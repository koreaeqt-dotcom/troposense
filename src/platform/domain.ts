import {
  ctniDisplay,
  formatCtni,
  validCalibrationSnapshot,
  type TestRecord,
} from "../model.ts";
import { DEMO_SCREENING_RULES } from "../config/screening.ts";
export type Role = "admin" | "professional" | "patient";
export type Risk = "Low Risk" | "Moderate Risk" | "High Risk";
export type Patient = {
  id: string;
  name: string;
  age: number;
  sex: string;
  contact: string;
  history: string;
  notes: string;
  status: "ทั่วไป" | "ติดตาม";
};
export type Measurement = TestRecord & {
  patientId: string;
  ctniDemo: number | null;
};
export type QC = {
  id: string;
  device: string;
  lot: string;
  expiry: string;
  checks: boolean[];
  failed: boolean;
  notes: string;
  date: string;
};
export type Screening = {
  id: string;
  patientId: string;
  date: string;
  symptoms: string[];
  duration: string;
  history: string;
  notes: string;
  risk: Risk;
};
export type Emergency = {
  id: string;
  patientId: string;
  date: string;
  severity: "Normal" | "Warning" | "Emergency";
  contact: string;
  location: string;
  notes: string;
  doctorSent: boolean;
  contactSent: boolean;
  resolved: boolean;
};
export type Referral = {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  summary: string;
  notes: string;
  status: "Requested" | "Reviewed" | "Closed";
  communications: string[];
};
export type Appointment = {
  id: string;
  patientId: string;
  date: string;
  reason: string;
  notes: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  reminder: boolean;
};
export type Database = {
  version: 2;
  patients: Patient[];
  tests: Measurement[];
  qc: QC[];
  screenings: Screening[];
  emergencies: Emergency[];
  referrals: Referral[];
  appointments: Appointment[];
  settings: { organization: string; compact: boolean };
};
export const DEMO_PATIENT = "PT-0001";
export const DISCLAIMER =
  "TropoSense เป็นโครงการนวัตกรรมต้นแบบเพื่อการพัฒนาและสาธิตแนวคิด ระบบยังอยู่ระหว่างการทดสอบความเข้ากันได้และประสิทธิภาพ ไม่ใช่อุปกรณ์ที่ผ่านการยืนยันความแม่นยำทางคลินิก และไม่สามารถใช้แทนการวินิจฉัยหรือการรักษาโดยแพทย์ได้";
export const STORAGE_KEY = "troposense-demo-v2";
export const roleNames: Record<Role, string> = {
  admin: "Administrator",
  professional: "Healthcare Professional",
  patient: "Patient",
};
export const uid = (prefix: string) =>
  `${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
export function thaiNow() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date())
    .replace(" ", "T");
}
export function seedDatabase(): Database {
  return {
    version: 2,
    patients: [
      {
        id: "PT-0001",
        name: "อรุณ ใจดี",
        age: 58,
        sex: "ชาย",
        contact: "demo-patient-01@example.test",
        history: "ประวัติสุขภาพตัวอย่างสำหรับสาธิต",
        notes: "ข้อมูลสมมติ ห้ามใช้ประกอบการรักษา",
        status: "ติดตาม",
      },
      {
        id: "PT-0002",
        name: "มินตรา สายลม",
        age: 42,
        sex: "หญิง",
        contact: "demo-patient-02@example.test",
        history: "ไม่มีข้อมูลเพิ่มเติมในสถานการณ์ตัวอย่าง",
        notes: "นัดติดตามตามแผนสาธิต",
        status: "ติดตาม",
      },
      {
        id: "PT-0003",
        name: "ธันวา แสงดี",
        age: 65,
        sex: "ชาย",
        contact: "demo-patient-03@example.test",
        history: "ประวัติสมมติสำหรับแสดงแบบบันทึก",
        notes: "ข้อมูลทดสอบระบบ",
        status: "ทั่วไป",
      },
      {
        id: "PT-0004",
        name: "พิมพ์ชนก เมฆา",
        age: 36,
        sex: "หญิง",
        contact: "demo-patient-04@example.test",
        history: "ประวัติสุขภาพจำลอง",
        notes: "ข้อมูลทดสอบระบบ",
        status: "ทั่วไป",
      },
    ],
    tests: [124, 108, 116, 132, 119, 112, 121].map((g, i) => ({
      id: `TS-2026-${String(i + 1).padStart(3, "0")}`,
      patientId: `PT-000${(i % 4) + 1}`,
      date: `2026-11-${String(22 - i).padStart(2, "0")}T03:30:00Z`,
      glucose: g,
      ctni: null,
      ctniDemo: i % 2 === 0 ? [12, 18, 10, 15][i % 4] : null,
      source: "manual",
      demo: true,
    })),
    qc: [
      {
        id: "QC-2026-01",
        device: "TS-RD-001",
        lot: "HC-2026-011",
        expiry: "2027-05-30",
        checks: [true, true, true],
        failed: false,
        notes: "ตัวอย่างการตรวจตาม checklist สาธิต ไม่ใช่การรับรองความแม่นยำ",
        date: "2026-11-22T02:30:00Z",
      },
      {
        id: "QC-2026-02",
        device: "TS-RD-002",
        lot: "HC-2026-012",
        expiry: "2027-04-30",
        checks: [true, false, false],
        failed: false,
        notes: "รอผู้รับผิดชอบตรวจรายการที่เหลือ",
        date: "2026-11-21T02:30:00Z",
      },
    ],
    screenings: [
      {
        id: "SC-2026-01",
        patientId: "PT-0001",
        date: "2026-11-22T04:00:00Z",
        symptoms: ["เวียนศีรษะ"],
        duration: "10 นาที",
        history: "ประวัติสาธิต",
        notes: "สถานการณ์สาธิต ไม่มีผลประเมินจริง",
        risk: "Moderate Risk",
      },
    ],
    emergencies: [
      {
        id: "EM-2026-01",
        patientId: "PT-0003",
        date: "2026-11-22T02:45:00Z",
        severity: "Warning",
        contact: "ผู้ติดต่อสมมติ",
        location: "จุดสาธิต A · ไม่ใช่ GPS จริง",
        notes: "ทดสอบลำดับงานแจ้งเตือน",
        doctorSent: false,
        contactSent: false,
        resolved: false,
      },
    ],
    referrals: [
      {
        id: "RF-2026-01",
        patientId: "PT-0001",
        doctorId: "DR-01",
        date: "2026-11-22T04:15:00Z",
        summary: "รายงานสรุปผู้ป่วยสมมติ เพื่อทดสอบระบบ",
        notes: "รอตรวจสอบข้อมูลสาธิต",
        status: "Requested",
        communications: [
          "สร้างคำขอปรึกษาจำลอง · ยังไม่ได้ส่งออกจากเบราว์เซอร์",
        ],
      },
    ],
    appointments: [
      {
        id: "FU-2026-01",
        patientId: "PT-0001",
        date: "2026-11-23T10:00",
        reason: "ติดตามผลการตรวจ",
        notes: "ติดตามอาการและข้อมูลการตรวจ",
        status: "Scheduled",
        reminder: true,
      },
      {
        id: "FU-2026-02",
        patientId: "PT-0002",
        date: "2026-11-25T13:30",
        reason: "ปรึกษาผลการตรวจ",
        notes: "ข้อมูลสมมติ",
        status: "Scheduled",
        reminder: false,
      },
      {
        id: "FU-2026-03",
        patientId: "PT-0001",
        date: "2026-11-18T09:00",
        reason: "ติดตามครั้งก่อน",
        notes: "ผู้ป่วยไม่ได้เข้าร่วมตามนัด",
        status: "Scheduled",
        reminder: false,
      },
    ],
    settings: { organization: "TropoSense Research Lab", compact: false },
  };
}
export function scopedDatabase(db: Database, role: Role): Database {
  if (role !== "patient") return db;
  return {
    ...db,
    patients: db.patients.filter((x) => x.id === DEMO_PATIENT),
    tests: db.tests.filter((x) => x.patientId === DEMO_PATIENT),
    qc: [],
    screenings: db.screenings.filter((x) => x.patientId === DEMO_PATIENT),
    emergencies: db.emergencies.filter((x) => x.patientId === DEMO_PATIENT),
    referrals: db.referrals.filter((x) => x.patientId === DEMO_PATIENT),
    appointments: db.appointments.filter((x) => x.patientId === DEMO_PATIENT),
  };
}
export function canManage(
  role: Role,
  area: "patients" | "qc" | "settings" | "notes" | "delete",
) {
  return (
    role === "admin" ||
    (role === "professional" && area !== "settings" && area !== "delete")
  );
}
export function deletePatient(db: Database, id: string): Database {
  return {
    ...db,
    patients: db.patients.filter((x) => x.id !== id),
    tests: db.tests.filter((x) => x.patientId !== id),
    screenings: db.screenings.filter((x) => x.patientId !== id),
    emergencies: db.emergencies.filter((x) => x.patientId !== id),
    referrals: db.referrals.filter((x) => x.patientId !== id),
    appointments: db.appointments.filter((x) => x.patientId !== id),
  };
}
export function qcStatus(
  checks: boolean[],
  expiry: string,
  failed = false,
  today = thaiNow().slice(0, 10),
): "Pass" | "Fail" | "Pending" {
  if (failed) return "Fail";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expiry)) return "Pending";
  if (expiry < today) return "Fail";
  return checks.length === 3 && checks.every(Boolean) ? "Pass" : "Pending";
}
export function screeningLabel(symptoms: string[]): Risk {
  if (
    symptoms.some((s) =>
      (DEMO_SCREENING_RULES.urgentSymptoms as readonly string[]).includes(s),
    )
  )
    return DEMO_SCREENING_RULES.urgentLabel;
  return symptoms.length
    ? DEMO_SCREENING_RULES.otherSymptomsLabel
    : DEMO_SCREENING_RULES.noSymptomsLabel;
}
export function appointmentState(
  date: string,
  status: Appointment["status"],
  now = thaiNow(),
) {
  return status === "Scheduled" && date < now ? "Missed" : status;
}
export function breakEven(
  investment: number,
  price: number,
  cost: number | null,
  readers: number,
  readerCost: number | null,
) {
  if (
    cost === null ||
    [investment, price, cost, readers].some(
      (v) => !Number.isFinite(v) || v < 0,
    ) ||
    !Number.isInteger(readers) ||
    price <= cost ||
    (readers > 0 &&
      (readerCost === null || !Number.isFinite(readerCost) || readerCost < 0))
  )
    return null;
  const readerMargin = readers * (4500 - (readerCost ?? 0));
  const remaining = Math.max(0, investment - readerMargin);
  return {
    tests: Math.ceil(remaining / (price - cost)),
    margin: price - cost,
    readerMargin,
    remaining,
  };
}
export function csvText(rows: (string | number)[][]) {
  return rows
    .map((row) =>
      row
        .map((v) => {
          let s = String(v);
          if (/^[\s]*[=+@-]/.test(s)) s = "'" + s;
          return '"' + s.replaceAll('"', '""') + '"';
        })
        .join(","),
    )
    .join("\r\n");
}
export function saveFile(
  name: string,
  text: string,
  type = "text/plain;charset=utf-8",
) {
  const url = URL.createObjectURL(new Blob(["\uFEFF" + text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function exportRows(name: string, rows: (string | number)[][]) {
  saveFile(name, csvText(rows), "text/csv;charset=utf-8");
}
export type Change =
  | { kind: "savePatient"; value: Patient }
  | { kind: "deletePatient"; id: string }
  | { kind: "saveQC"; value: QC }
  | { kind: "deleteQC"; id: string }
  | { kind: "saveTest"; value: Measurement }
  | { kind: "saveScreening"; value: Screening }
  | { kind: "saveEmergency"; value: Emergency }
  | { kind: "saveReferral"; value: Referral }
  | { kind: "saveAppointment"; value: Appointment }
  | { kind: "deleteAppointment"; id: string }
  | { kind: "settings"; value: Database["settings"] };
function upsert<T extends { id: string }>(list: T[], value: T): T[] {
  return list.some((x) => x.id === value.id)
    ? list.map((x) => (x.id === value.id ? value : x))
    : [value, ...list];
}
export function applyChange(
  db: Database,
  role: Role,
  change: Change,
): Database {
  const forbidden = () => {
    throw new Error("บทบาทนี้ไม่มีสิทธิ์แก้ไขข้อมูลรายการนี้");
  };
  if (change.kind === "settings") {
    if (!canManage(role, "settings")) return forbidden();
    return { ...db, settings: change.value };
  }
  if (change.kind === "savePatient") {
    if (!canManage(role, "patients")) return forbidden();
    const p = change.value;
    if (!p.name.trim() || !Number.isInteger(p.age) || p.age < 1 || p.age > 130)
      throw new Error("ชื่อและอายุไม่ถูกต้อง");
    return { ...db, patients: upsert(db.patients, p) };
  }
  if (change.kind === "deletePatient") {
    if (role !== "admin") return forbidden();
    if (change.id === DEMO_PATIENT)
      throw new Error("เก็บผู้ป่วย PT-0001 ไว้สำหรับบทบาท Patient Demo");
    return deletePatient(db, change.id);
  }
  if (change.kind === "saveQC" || change.kind === "deleteQC") {
    if (!canManage(role, "qc")) return forbidden();
    return change.kind === "saveQC"
      ? { ...db, qc: upsert(db.qc, change.value) }
      : { ...db, qc: db.qc.filter((x) => x.id !== change.id) };
  }
  if (change.kind === "deleteAppointment") {
    if (!canManage(role, "delete")) return forbidden();
    return {
      ...db,
      appointments: db.appointments.filter((x) => x.id !== change.id),
    };
  }
  const v = change.value;
  if (!db.patients.some((x) => x.id === v.patientId))
    throw new Error("ไม่พบผู้ป่วยที่เลือก");
  if (role === "patient" && v.patientId !== DEMO_PATIENT) return forbidden();
  const lists = {
    saveTest: db.tests,
    saveScreening: db.screenings,
    saveEmergency: db.emergencies,
    saveReferral: db.referrals,
    saveAppointment: db.appointments,
  };
  const existing = lists[change.kind].find((x) => x.id === v.id);
  if (existing && existing.patientId !== v.patientId)
    throw new Error("ไม่สามารถเปลี่ยนเจ้าของรายการที่บันทึกไว้");
  if (change.kind === "saveTest") {
    if (
      !Number.isFinite(change.value.glucose) ||
      change.value.glucose <= 0 ||
      (change.value.calibration !== undefined &&
        !validCalibrationSnapshot(change.value.calibration)) ||
      (change.value.ctni !== null &&
        (!Number.isFinite(change.value.ctni) ||
          change.value.ctni <= 0 ||
          ctniDisplay(change.value).valueNgL !== change.value.ctni)) ||
      (change.value.ctniDemo !== null &&
        (!Number.isFinite(change.value.ctniDemo) || change.value.ctniDemo < 0))
    )
      throw new Error("ค่าการตรวจไม่ถูกต้อง");
    return { ...db, tests: upsert(db.tests, change.value) };
  }
  if (change.kind === "saveScreening")
    return {
      ...db,
      screenings: upsert(db.screenings, {
        ...change.value,
        risk: screeningLabel(change.value.symptoms),
      }),
    };
  if (change.kind === "saveEmergency")
    return { ...db, emergencies: upsert(db.emergencies, change.value) };
  if (change.kind === "saveReferral") {
    if (role === "patient") {
      const old = db.referrals.find((x) => x.id === change.value.id);
      if (old) return forbidden();
      if (change.value.status !== "Requested" || change.value.notes !== "")
        return forbidden();
    }
    return { ...db, referrals: upsert(db.referrals, change.value) };
  }
  if (change.kind === "saveAppointment") {
    const a = change.value;
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(a.date) || !a.reason.trim())
      throw new Error("ระบุวันเวลาและเหตุผลนัดหมาย");
    return { ...db, appointments: upsert(db.appointments, a) };
  }
  return db;
}
export function mergeStoredChange(
  memory: Database,
  stored: string | null,
  role: Role,
  change: Change,
) {
  return applyChange(
    stored ? (parseDatabase(stored) ?? memory) : memory,
    role,
    change,
  );
}
export function parseDatabase(text: string): Database | null {
  try {
    const d = JSON.parse(text);
    if (
      !d ||
      d.version !== 2 ||
      !d.settings ||
      typeof d.settings.organization !== "string" ||
      typeof d.settings.compact !== "boolean"
    )
      return null;
    const string = (x: unknown) => typeof x === "string";
    const num = (x: unknown) => typeof x === "number" && Number.isFinite(x);
    const strs = (x: unknown) => Array.isArray(x) && x.every(string);
    const base = (x: any) => x && string(x.id) && x.id.length > 0;
    const dated = (x: any) =>
      base(x) && string(x.date) && Number.isFinite(Date.parse(x.date));
    const linked = (x: any) =>
      dated(x) &&
      string(x.patientId) &&
      d.patients.some((p: Patient) => p.id === x.patientId);
    if (
      !Array.isArray(d.patients) ||
      !d.patients.some((p: Patient) => p?.id === DEMO_PATIENT) ||
      !d.patients.every(
        (p: any) =>
          base(p) &&
          ["name", "sex", "contact", "history", "notes"].every((k) =>
            string(p[k]),
          ) &&
          num(p.age) &&
          p.age >= 1 &&
          p.age <= 130 &&
          Number.isInteger(p.age) &&
          ["ทั่วไป", "ติดตาม"].includes(p.status),
      )
    )
      return null;
    const checks: Record<string, (x: any) => boolean> = {
      tests: (x) =>
        linked(x) &&
        num(x.glucose) &&
        x.glucose > 0 &&
        (x.ctni === null ||
          (num(x.ctni) &&
            x.ctni > 0 &&
            validCalibrationSnapshot(x.calibration))) &&
        (x.calibration === undefined ||
          validCalibrationSnapshot(x.calibration)) &&
        (x.ctniDemo === null || (num(x.ctniDemo) && x.ctniDemo >= 0)) &&
        ["manual", "ocr-demo"].includes(x.source) &&
        typeof x.demo === "boolean",
      qc: (x) =>
        dated(x) &&
        string(x.device) &&
        string(x.lot) &&
        /^\d{4}-\d{2}-\d{2}$/.test(x.expiry) &&
        Array.isArray(x.checks) &&
        x.checks.length === 3 &&
        x.checks.every((b: unknown) => typeof b === "boolean") &&
        typeof x.failed === "boolean" &&
        string(x.notes),
      screenings: (x) =>
        linked(x) &&
        strs(x.symptoms) &&
        ["Low Risk", "Moderate Risk", "High Risk"].includes(x.risk) &&
        ["duration", "history", "notes"].every((k) => string(x[k])),
      emergencies: (x) =>
        linked(x) &&
        ["Normal", "Warning", "Emergency"].includes(x.severity) &&
        ["contact", "location", "notes"].every((k) => string(x[k])) &&
        ["doctorSent", "contactSent", "resolved"].every(
          (k) => typeof x[k] === "boolean",
        ),
      referrals: (x) =>
        linked(x) &&
        ["doctorId", "summary", "notes"].every((k) => string(x[k])) &&
        ["Requested", "Reviewed", "Closed"].includes(x.status) &&
        strs(x.communications),
      appointments: (x) =>
        linked(x) &&
        ["reason", "notes"].every((k) => string(x[k])) &&
        ["Scheduled", "Completed", "Cancelled"].includes(x.status) &&
        typeof x.reminder === "boolean",
    };
    for (const [key, check] of Object.entries(checks)) {
      if (
        !Array.isArray(d[key]) ||
        !d[key].every(check) ||
        new Set(d[key].map((x: any) => x.id)).size !== d[key].length
      )
        return null;
    }
    return presentationRecords(d as Database);
  } catch {
    return null;
  }
}
function presentationRecords(db: Database): Database {
  const clean = (value: string) => value.replace(/ \(สมมติ\)| \(Demo\)/g, "");
  const id = (value: string) => value.replace("-DEMO-", "-2026-");
  return {
    ...db,
    patients: db.patients.map((p) => ({ ...p, name: clean(p.name) })),
    tests: db.tests.map((t) => ({ ...t, id: id(t.id) })),
    qc: db.qc.map((q) => ({ ...q, id: id(q.id) })),
    screenings: db.screenings.map((s) => ({ ...s, id: id(s.id) })),
    emergencies: db.emergencies.map((e) => ({ ...e, id: id(e.id) })),
    referrals: db.referrals.map((r) => ({ ...r, id: id(r.id) })),
    appointments: db.appointments.map((a) => ({
      ...a,
      id: id(a.id),
      reason: clean(a.reason),
      notes: a.notes
        .replace("ผู้ป่วยตัวอย่างไม่ได้เข้าร่วม", "ผู้ป่วยไม่ได้เข้าร่วมตามนัด")
        .replace("สอบถามอาการในสถานการณ์จำลอง", "ติดตามอาการและข้อมูลการตรวจ"),
    })),
  };
}
export function patientSummary(db: Database, id: string) {
  const p = db.patients.find((x) => x.id === id);
  if (!p) return "ไม่พบผู้ป่วย";
  const tests = db.tests.filter((x) => x.patientId === id);
  const screens = db.screenings.filter((x) => x.patientId === id);
  return `TropoSense · สรุปข้อมูลสมมติ (DEMO ONLY)\n${p.id} · ${p.name}\nอายุ ${p.age} ปี · ${p.sex}\nติดต่อสมมติ: ${p.contact || "—"}\nประวัติสุขภาพ: ${p.history || "ไม่ได้ระบุ"}\nหมายเหตุ: ${p.notes || "—"}\n\nผลตรวจ ${tests.length} รายการ\n${tests
    .map((t) => {
      const d = ctniDisplay(t);
      return `${t.date} | Glucose ${t.glucose} mg/dL | cTnI: ${formatCtni(d.valueNgL)} ng/L\n${d.message}\n${d.referenceStatus}`;
    })
    .join(
      "\n",
    )}\nรายการใหม่ใช้ C = C0 × 10^((G − b) / a) ส่วนข้อมูลจำลองเดิมไม่มีหลักฐานสอบเทียบ ห้ามใช้วินิจฉัยจาก cTnI ค่าเดียว\n\nประวัติอาการ ${screens.length} รายการ\n${screens.map((s) => `${s.date} | ${s.symptoms.join(", ") || "ไม่ได้เลือกอาการ"} | ${s.risk} (สถานการณ์ Demo)\nระยะเวลา: ${s.duration || "ไม่ระบุ"}\nประวัติสุขภาพเพิ่มเติม: ${s.history || "ไม่ระบุ"}\nข้อมูลประกอบ: ${s.notes || "ไม่ระบุ"}`).join("\n")}\n\n${DISCLAIMER}`;
}
