import {
  evaluateCtni,
  parseGlucose,
  referenceStatus,
  DEMO_WARNING,
  REFERENCE_UNAVAILABLE,
  CALIBRATION_UNAVAILABLE,
  type CalibrationResult,
  type ReadingOptions,
} from "./calibration/evaluate.ts";
export type TestRecord = {
  id: string;
  date: string;
  glucose: number;
  ctni: number | null;
  calibration?: CalibrationResult;
  ctniDemo?: number | null;
  source: "manual" | "ocr-demo";
  demo: boolean;
};
export const validReading = (value: string) => parseGlucose(value) !== null;
export function createRecord(
  value: string,
  source: TestRecord["source"],
  options: ReadingOptions = {
    mode: "standard",
    unit: "mg/dL",
    confirmed: false,
  },
): TestRecord {
  const calibration = evaluateCtni({ glucose: value, source, ...options });
  if (calibration.status === "invalid" || calibration.status === "out-of-range")
    throw new Error(calibration.message);
  return {
    id: `TS-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    date: new Date().toISOString(),
    glucose: Number(value),
    ctni: calibration.valueNgL,
    calibration,
    source,
    demo: source === "ocr-demo" || calibration.status === "demo",
  };
}
export const initialRecords: TestRecord[] = [
  {
    id: "TS-DEMO-003",
    date: "2026-11-22T03:30:00Z",
    glucose: 124,
    ctni: null,
    source: "manual",
    demo: true,
  },
  {
    id: "TS-DEMO-002",
    date: "2026-11-21T07:15:00Z",
    glucose: 108,
    ctni: null,
    source: "manual",
    demo: true,
  },
  {
    id: "TS-DEMO-001",
    date: "2026-11-20T02:45:00Z",
    glucose: 116,
    ctni: null,
    source: "ocr-demo",
    demo: true,
  },
];
export const formatDate = (date: string) =>
  new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(date));
export function reportText(r: TestRecord) {
  const display = ctniDisplay(r);
  return `TropoSense — รายงานข้อมูลการตรวจ\nTest ID: ${r.id}\nวันที่: ${formatDate(r.date)} (ประเทศไทย)\nGlucose: ${r.glucose} mg/dL\nEstimated cTnI: ${formatCtni(display.valueNgL)} ng/L\n${display.message}\n${display.referenceStatus}\nแบบจำลอง: C = C0 × 10^((G − b) / a)\nCalibration ID: ${r.calibration?.configId ?? "ไม่มี"}\nแหล่งข้อมูล: ${r.source === "ocr-demo" ? "OCR จำลอง (ไม่ได้อ่านภาพจริง)" : "กรอกด้วยตนเอง"}\nไม่ใช้ cTnI ค่าเดียววินิจฉัยภาวะหัวใจวาย หากมีอาการฉุกเฉินไม่ต้องรอผลจากเว็บไซต์`;
}
export type CtniDisplay = {
  valueNgL: number | null;
  message: string;
  referenceStatus: string;
  isDemo: boolean;
};
export const formatCtni = (value: number | null) =>
  value === null
    ? "—"
    : new Intl.NumberFormat("en-US", {
        maximumSignificantDigits: 6,
        useGrouping: false,
      }).format(value);
export function validCalibrationSnapshot(
  value: unknown,
): value is CalibrationResult {
  if (value === null || typeof value !== "object") return false;
  const v = value as CalibrationResult;
  return (
    ["unavailable", "invalid", "out-of-range", "demo", "calibrated"].includes(
      v.status,
    ) &&
    ["standard", "demo"].includes(v.mode) &&
    (v.valueNgL === null ||
      (typeof v.valueNgL === "number" &&
        Number.isFinite(v.valueNgL) &&
        v.valueNgL > 0)) &&
    typeof v.message === "string" &&
    typeof v.referenceStatus === "string" &&
    typeof v.medicalResult === "boolean" &&
    (v.configId === null || typeof v.configId === "string")
  );
}
export function ctniDisplay(
  record: TestRecord,
  legacyDemoValue: number | null = record.ctniDemo ?? null,
): CtniDisplay {
  const unavailable = (message = CALIBRATION_UNAVAILABLE): CtniDisplay => ({
    valueNgL: null,
    message,
    referenceStatus: REFERENCE_UNAVAILABLE,
    isDemo: false,
  });
  if (record.calibration !== undefined) {
    if (!validCalibrationSnapshot(record.calibration))
      return unavailable(
        "ข้อมูล Calibration ของรายการนี้ไม่ถูกต้อง ต้องตรวจสอบใหม่",
      );
    const current = evaluateCtni({
      glucose: record.glucose,
      unit: "mg/dL",
      source: record.source,
      confirmed: true,
      mode: record.calibration.mode,
    });
    if (
      current.configId !== record.calibration.configId ||
      current.status !== record.calibration.status ||
      current.valueNgL !== record.calibration.valueNgL ||
      record.ctni !== current.valueNgL
    )
      return unavailable(
        "Calibration ของรายการนี้ไม่ตรงกับ Configuration ปัจจุบัน ต้องตรวจสอบใหม่",
      );
    if (current.valueNgL === null) return unavailable(current.message);
    const isDemo =
      record.demo || current.status === "demo" || record.source === "ocr-demo";
    return {
      valueNgL: current.valueNgL,
      message: isDemo ? DEMO_WARNING : current.message,
      isDemo,
      referenceStatus: referenceStatus(current.valueNgL, isDemo),
    };
  }
  if (record.ctni !== null)
    return unavailable("ไม่พบหลักฐาน Calibration ของค่า cTnI ที่บันทึก");
  if (
    typeof legacyDemoValue === "number" &&
    Number.isFinite(legacyDemoValue) &&
    legacyDemoValue >= 0
  )
    return {
      valueNgL: legacyDemoValue,
      message: DEMO_WARNING,
      isDemo: true,
      referenceStatus: REFERENCE_UNAVAILABLE,
    };
  return unavailable();
}
export function downloadText(name: string, text: string) {
  const url = URL.createObjectURL(
    new Blob(["\uFEFF" + text], { type: "text/plain;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
