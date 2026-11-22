import {
  CALIBRATION_CONFIG,
  DEMO_CALIBRATION_CONFIG,
  CTNI_REFERENCE_CONFIG,
  type CalibrationConfig,
  type CalibrationMode,
  type ReferenceConfig,
} from "../config/calibration.ts";
export const DEMO_WARNING = "ข้อมูลจำลอง — ไม่ใช่ผลตรวจทางการแพทย์";
export const REFERENCE_UNAVAILABLE = "ยังไม่มีเกณฑ์อ้างอิงที่ผ่านการตรวจสอบ";
export const CALIBRATION_UNAVAILABLE =
  "ยังไม่มีข้อมูลสอบเทียบที่ผ่านการตรวจสอบ";
export type ReadingOptions = {
  mode: CalibrationMode;
  unit: string;
  confirmed: boolean;
};
export type CalibrationInput = ReadingOptions & {
  glucose: unknown;
  source: "manual" | "ocr-demo";
};
export type CalibrationResult = {
  status: "unavailable" | "invalid" | "out-of-range" | "demo" | "calibrated";
  valueNgL: number | null;
  message: string;
  medicalResult: boolean;
  mode: CalibrationMode;
  configId: string | null;
  referenceStatus: string;
};
const finite = (n: unknown): n is number =>
  typeof n === "number" && Number.isFinite(n);
export function parseGlucose(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (
    typeof value === "string" &&
    !/^\+?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim())
  )
    return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}
export function referenceStatus(
  value: unknown,
  isDemo: boolean,
  config: Readonly<ReferenceConfig> = CTNI_REFERENCE_CONFIG,
): string {
  if (
    isDemo ||
    !finite(value) ||
    value < 0 ||
    config.status !== "validated" ||
    config.unit !== "ng/L" ||
    !finite(config.upperLimitNgL) ||
    config.upperLimitNgL <= 0 ||
    !config.reviewedBy?.trim() ||
    !config.evidence?.trim() ||
    !config.reviewedAt ||
    !Number.isFinite(Date.parse(config.reviewedAt))
  )
    return REFERENCE_UNAVAILABLE;
  return value > config.upperLimitNgL
    ? "เกินขีดจำกัดอ้างอิงที่กำหนด — ต้องประเมินร่วมกับข้อมูลทางคลินิก"
    : "ไม่เกินขีดจำกัดอ้างอิงที่กำหนด — ไม่ใช้ตัดภาวะฉุกเฉิน";
}
export function evaluateCtni(
  input: CalibrationInput,
  config: Readonly<CalibrationConfig> = input.mode === "demo"
    ? DEMO_CALIBRATION_CONFIG
    : CALIBRATION_CONFIG,
): CalibrationResult {
  const response = (
    status: CalibrationResult["status"],
    message: string,
    valueNgL: number | null = null,
  ): CalibrationResult => ({
    status,
    valueNgL,
    message,
    medicalResult: status === "calibrated",
    mode: input.mode,
    configId: config.id || null,
    referenceStatus: referenceStatus(valueNgL, status !== "calibrated"),
  });
  const glucose = parseGlucose(input.glucose);
  if (glucose === null)
    return response(
      "invalid",
      "กรุณาระบุค่ากลูโคสเป็นตัวเลขที่มากกว่า 0 และมีค่าจำกัด",
    );
  if (input.confirmed !== true)
    return response(
      "invalid",
      "โปรดยืนยันตัวเลขและหน่วยวัดกับเครื่องอ่านก่อนบันทึก",
    );
  if (
    input.unit !== "mg/dL" ||
    !["manual", "ocr-demo"].includes(input.source) ||
    !["standard", "demo"].includes(input.mode)
  )
    return response(
      "invalid",
      "หน่วยหรือแหล่งข้อมูลไม่ถูกต้อง ต้องใช้ Glucose หน่วย mg/dL",
    );
  if (
    config.glucoseUnit !== "mg/dL" ||
    config.ctniUnit !== "ng/L" ||
    config.model !== "logarithmic"
  )
    return response("invalid", "หน่วยหรือชนิดแบบจำลอง Calibration ไม่ถูกต้อง");
  if (config.status === "unavailable")
    return response("unavailable", CALIBRATION_UNAVAILABLE);
  if (input.mode === "standard") {
    const review = config.review;
    if (
      config.status !== "validated" ||
      config.source !== "troposense-experiment" ||
      !review?.reviewedBy.trim() ||
      !review.evidence.trim() ||
      !Number.isFinite(Date.parse(review.reviewedAt)) ||
      review.deviceCompatibilityConfirmed !== true
    )
      return response("unavailable", CALIBRATION_UNAVAILABLE);
    if (input.source === "ocr-demo")
      return response(
        "invalid",
        "OCR จำลองไม่สามารถใช้สร้างผลจาก Calibration จริงได้ เลือก DEMO หรือกรอกและตรวจสอบค่าด้วยตนเอง",
      );
  } else if (config.status !== "demo" || config.source !== "synthetic")
    return response(
      "invalid",
      "DEMO ต้องใช้ชุดพารามิเตอร์สมมติที่ระบุแหล่งข้อมูลชัดเจน",
    );
  if (
    !finite(config.a) ||
    config.a === 0 ||
    !finite(config.b) ||
    !finite(config.C0) ||
    config.C0 <= 0
  )
    return response(
      "invalid",
      "พารามิเตอร์ Calibration ไม่ถูกต้อง: a ต้องไม่เป็น 0 และ C0 ต้องเป็นบวก",
    );
  const validRange = (range: CalibrationConfig["glucoseRange"]) =>
    range !== null &&
    finite(range.min) &&
    finite(range.max) &&
    range.min > 0 &&
    range.max > range.min;
  if (!validRange(config.glucoseRange) || !validRange(config.ctniRange))
    return response("invalid", "ยังไม่ได้กำหนดช่วงสอบเทียบที่ถูกต้อง");
  const gRange = config.glucoseRange!,
    cRange = config.ctniRange!;
  if (glucose < gRange.min || glucose > gRange.max)
    return response(
      "out-of-range",
      `Glucose อยู่นอกช่วงสอบเทียบ ${gRange.min}–${gRange.max} mg/dL ไม่คำนวณนอกช่วง`,
    );
  // C = C0 * 10^((G-b)/a), evaluated in log-space to avoid intermediate overflow.
  const exponent = Math.log10(config.C0) + (glucose - config.b) / config.a;
  const concentration = 10 ** exponent;
  if (!finite(exponent) || !finite(concentration) || concentration <= 0)
    return response(
      "invalid",
      "ผลคำนวณเกินขีดจำกัดตัวเลข หรือเกิด underflow ไม่สามารถแสดง cTnI ได้",
    );
  const nearly = (a: number, b: number) =>
    Math.abs(a - b) <= Math.max(Math.abs(a), Math.abs(b)) * 1e-12;
  if (
    (concentration < cRange.min && !nearly(concentration, cRange.min)) ||
    (concentration > cRange.max && !nearly(concentration, cRange.max))
  )
    return response(
      "out-of-range",
      "cTnI อยู่นอกช่วงความเข้มข้นที่สอบเทียบ ไม่แสดงค่าประมาณ",
    );
  return input.mode === "demo"
    ? response("demo", DEMO_WARNING, concentration)
    : response(
        "calibrated",
        "ค่าประมาณจาก Calibration ของ TropoSense ที่ผ่านการตรวจสอบ",
        concentration,
      );
}
