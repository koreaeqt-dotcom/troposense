import { test } from "node:test";
import assert from "node:assert/strict";
import { createRecord, ctniDisplay } from "../model.ts";
import {
  seedDatabase,
  scopedDatabase,
  deletePatient,
  breakEven,
  qcStatus,
  screeningLabel,
  parseDatabase,
  csvText,
  appointmentState,
  canManage,
  applyChange,
  patientSummary,
  mergeStoredChange,
} from "./domain.ts";
test("patient sees only own linked records and cannot manage QC", () => {
  const db = seedDatabase();
  const mine = scopedDatabase(db, "patient");
  assert.equal(mine.patients.length, 1);
  assert.ok(mine.tests.every((x) => x.patientId === mine.patients[0].id));
  assert.equal(canManage("patient", "qc"), false);
  assert.equal(canManage("professional", "settings"), false);
  assert.throws(() =>
    applyChange(db, "patient", {
      kind: "savePatient",
      value: { ...db.patients[1], name: "changed" },
    }),
  );
});
test("deleting patient removes linked histories, retaining other patients", () => {
  const db = seedDatabase();
  const id = db.patients[0].id;
  const next = deletePatient(db, id);
  assert.ok(!next.patients.some((x) => x.id === id));
  for (const key of [
    "tests",
    "screenings",
    "emergencies",
    "referrals",
    "appointments",
  ] as const)
    assert.ok(!next[key].some((x) => x.patientId === id));
  assert.equal(next.patients.length, db.patients.length - 1);
});
test("QC never passes an expired or incomplete cartridge", () => {
  assert.equal(
    qcStatus([true, true, true], "2020-01-01", false, "2026-11-22"),
    "Fail",
  );
  assert.equal(
    qcStatus([true, false, true], "2027-01-01", false, "2026-11-22"),
    "Pending",
  );
  assert.equal(
    qcStatus([true, true, true], "2027-01-01", false, "2026-11-22"),
    "Pass",
  );
});
test("break even uses contribution margin, rejects missing or nonpositive margin", () => {
  assert.equal(breakEven(150000, 350, null, 0, null), null);
  assert.equal(breakEven(150000, 350, 350, 0, null), null);
  assert.equal(breakEven(150000, 350, 150, 0, null)?.tests, 750);
  assert.equal(breakEven(150000, 350, 150, 2, 2500)?.tests, 730);
  assert.equal(breakEven(150000, 350, 150, 1, null), null);
});
test("screen labels are demo workflow labels and urgent symptoms always escalate", () => {
  assert.equal(screeningLabel([]), "Low Risk");
  assert.equal(screeningLabel(["เวียนศีรษะ"]), "Moderate Risk");
  assert.equal(screeningLabel(["เจ็บหน้าอก"]), "High Risk");
});
test("storage rejects malformed nested records instead of crashing", () => {
  assert.equal(parseDatabase("{oops"), null);
  assert.equal(
    parseDatabase(JSON.stringify({ ...seedDatabase(), patients: [{}] })),
    null,
  );
  assert.equal(parseDatabase(JSON.stringify(seedDatabase()))?.version, 2);
});
test("CSV escapes quotes, newlines and spreadsheet formulas", () => {
  const csv = csvText([
    ["name", "notes"],
    ["=SUM(A1)", 'hello,"world"\nline'],
  ]);
  assert.match(csv, /'=SUM/);
  assert.match(csv, /""world""/);
});
test("appointment date comparison is deterministic and cancellations remain cancelled", () => {
  assert.equal(
    appointmentState("2026-11-01T10:00", "Scheduled", "2026-11-22T10:00"),
    "Missed",
  );
  assert.equal(
    appointmentState("2026-11-01T10:00", "Cancelled", "2026-11-22T10:00"),
    "Cancelled",
  );
});
test("patient cannot overwrite another patient record by changing its owner", () => {
  const db = seedDatabase();
  assert.throws(() =>
    applyChange(db, "patient", {
      kind: "saveEmergency",
      value: { ...db.emergencies[0], patientId: "PT-0001" },
    }),
  );
  assert.throws(() =>
    applyChange(db, "patient", {
      kind: "saveTest",
      value: { ...db.tests[1], patientId: "PT-0001" },
    }),
  );
  assert.throws(() =>
    applyChange(db, "patient", {
      kind: "saveAppointment",
      value: { ...db.appointments[1], patientId: "PT-0001" },
    }),
  );
});
test("stale tab merges a change against latest saved database", () => {
  const stale = seedDatabase();
  const newer = applyChange(stale, "admin", {
    kind: "savePatient",
    value: { ...stale.patients[0], id: "PT-NEW", name: "new demo" },
  });
  const merged = mergeStoredChange(stale, JSON.stringify(newer), "admin", {
    kind: "saveQC",
    value: { ...stale.qc[0], id: "QC-NEW" },
  });
  assert.ok(merged.patients.some((p) => p.id === "PT-NEW"));
  assert.ok(merged.qc.some((q) => q.id === "QC-NEW"));
});
test("patient summary retains duration, history and notes for consultation", () => {
  const db = seedDatabase();
  db.screenings[0] = {
    ...db.screenings[0],
    duration: "unique-duration",
    history: "unique-history",
    notes: "unique-note",
  };
  const text = patientSummary(db, "PT-0001");
  for (const s of ["unique-duration", "unique-history", "unique-note"])
    assert.ok(text.includes(s));
});
test("QC with missing expiry remains pending even with complete checklist", () => {
  assert.equal(qcStatus([true, true, true], ""), "Pending");
});
test("calculated DEMO records survive storage without becoming clinical results", () => {
  const db = seedDatabase();
  const record = {
    ...createRecord("150", "manual", {
      mode: "demo",
      unit: "mg/dL",
      confirmed: true,
    }),
    patientId: "PT-0001",
    ctniDemo: null,
  };
  const updated = applyChange(db, "admin", { kind: "saveTest", value: record });
  const restored = parseDatabase(JSON.stringify(updated));
  assert.ok(restored);
  const r = restored.tests.find((t) => t.id === record.id)!;
  assert.equal(ctniDisplay(r).valueNgL, 10);
  assert.equal(ctniDisplay(r).isDemo, true);
  assert.match(ctniDisplay(r).message, /ข้อมูลจำลอง — ไม่ใช่ผลตรวจทางการแพทย์/);
});
test("forged or unproven cTnI cannot enter the calibrated record path", () => {
  const db = seedDatabase();
  const r = {
    ...createRecord("150", "manual", {
      mode: "demo",
      unit: "mg/dL",
      confirmed: true,
    }),
    patientId: "PT-0001",
    ctniDemo: null,
  };
  assert.throws(() =>
    applyChange(db, "admin", {
      kind: "saveTest",
      value: {
        ...r,
        ctni: 40,
        calibration: { ...r.calibration!, valueNgL: 40 },
      },
    }),
  );
  assert.equal(ctniDisplay({ ...r, calibration: undefined }).valueNgL, null);
});
test("legacy cTnI fixtures are always labelled as nonmedical simulated data", () => {
  const d = ctniDisplay(seedDatabase().tests[0]);
  assert.equal(d.isDemo, true);
  assert.match(d.message, /ข้อมูลจำลอง — ไม่ใช่ผลตรวจทางการแพทย์/);
});
