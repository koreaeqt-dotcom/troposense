import { test } from "node:test";
import assert from "node:assert/strict";
import { createRecord, validReading, reportText } from "./model.ts";
test("rejects missing, nonfinite, zero and negative readings", () => {
  for (const value of ["", " ", "NaN", "Infinity", "-5", "0", "1e309"])
    assert.equal(validReading(value), false);
  assert.equal(validReading("124"), true);
});
test("new measurement never invents a cTnI estimate", () => {
  const record = createRecord("124", "manual", {
    mode: "standard",
    unit: "mg/dL",
    confirmed: true,
  });
  assert.equal(record.glucose, 124);
  assert.equal(record.ctni, null);
  assert.match(reportText(record), /ยังไม่มีข้อมูลสอบเทียบ/);
  assert.throws(() => createRecord("", "manual"));
});
test("every new submission requires explicit confirmation of number and units", () => {
  assert.throws(() => createRecord("124", "manual"));
  assert.throws(() =>
    createRecord("124", "manual", {
      mode: "demo",
      unit: "mg/dL",
      confirmed: false,
    }),
  );
  assert.throws(() =>
    createRecord("124", "manual", {
      mode: "demo",
      unit: "mmol/L",
      confirmed: true,
    }),
  );
});
test("manual and OCR records share the same demo model and export the exact warning", () => {
  const options = { mode: "demo" as const, unit: "mg/dL", confirmed: true };
  const m = createRecord("150", "manual", options),
    o = createRecord("150", "ocr-demo", options);
  assert.equal(m.ctni, 10);
  assert.equal(o.ctni, m.ctni);
  assert.equal(m.demo, true);
  assert.match(reportText(m), /ข้อมูลจำลอง — ไม่ใช่ผลตรวจทางการแพทย์/);
  assert.match(reportText(m), /ยังไม่มีเกณฑ์อ้างอิงที่ผ่านการตรวจสอบ/);
  assert.throws(() => createRecord("201", "manual", options));
});
