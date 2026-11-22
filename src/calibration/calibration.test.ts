import { test } from "node:test";
import assert from "node:assert/strict";
import {
  evaluateCtni,
  referenceStatus,
  DEMO_WARNING,
  REFERENCE_UNAVAILABLE,
} from "./evaluate.ts";
import {
  CALIBRATION_CONFIG,
  DEMO_CALIBRATION_CONFIG,
  CTNI_REFERENCE_CONFIG,
  type CalibrationConfig,
} from "../config/calibration.ts";
const input = (glucose: unknown = 150, extra = {}) => ({
  glucose,
  unit: "mg/dL",
  source: "manual" as const,
  confirmed: true,
  mode: "demo" as const,
  ...extra,
});
const config = (extra: Partial<CalibrationConfig> = {}) => ({
  ...DEMO_CALIBRATION_CONFIG,
  ...extra,
});
test("logarithmic model: G=b gives C0 and a glucose step a gives tenfold concentration", () => {
  assert.equal(evaluateCtni(input(100)).valueNgL, 1);
  assert.equal(evaluateCtni(input(150)).valueNgL, 10);
  assert.equal(evaluateCtni(input(200)).valueNgL, 100);
  assert.equal(evaluateCtni(input(50)).valueNgL, 0.1);
});
test("unconfigured default returns no cTnI", () => {
  const r = evaluateCtni(input(124, { mode: "standard" }));
  assert.equal(r.status, "unavailable");
  assert.equal(r.valueNgL, null);
  assert.equal(CALIBRATION_CONFIG.a, null);
  assert.equal(CALIBRATION_CONFIG.b, null);
});
test("demo output always carries the exact warning and no clinical reference interpretation", () => {
  const r = evaluateCtni(input());
  assert.equal(r.status, "demo");
  assert.equal(r.message, DEMO_WARNING);
  assert.equal(r.medicalResult, false);
  assert.equal(r.referenceStatus, REFERENCE_UNAVAILABLE);
});
test("manual and simulated OCR use identical logarithmic evaluator in demo mode", () => {
  const m = evaluateCtni(input(124));
  const o = evaluateCtni(input(124, { source: "ocr-demo" }));
  assert.equal(m.valueNgL, o.valueNgL);
  assert.equal(o.status, "demo");
});
test("rejects unconfirmed values and unsupported input/config/output units", () => {
  for (const extra of [
    { confirmed: false },
    { unit: "mmol/L" },
    { unit: "ng/L" },
    { unit: "" },
  ])
    assert.equal(evaluateCtni(input(124, extra)).status, "invalid");
  for (const c of [
    config({ glucoseUnit: "mmol/L" as "mg/dL" }),
    config({ ctniUnit: "ng/mL" as "ng/L" }),
  ])
    assert.equal(evaluateCtni(input(), c).status, "invalid");
});
test("rejects blank, nonnumeric, nonfinite, zero, negative and coerced booleans", () => {
  for (const v of [
    "",
    " ",
    "124 mg/dL",
    "0x7c",
    "NaN",
    "Infinity",
    NaN,
    Infinity,
    null,
    true,
    {},
    0,
    -1,
    "1e309",
  ])
    assert.equal(evaluateCtni(input(v)).status, "invalid", String(v));
});
test("rejects zero/nonfinite slopes, nonpositive C0 and invalid intercept", () => {
  for (const bad of [
    { a: 0 },
    { a: NaN },
    { a: Infinity },
    { b: Infinity },
    { b: null },
    { C0: 0 },
    { C0: -1 },
    { C0: NaN },
    { C0: null },
  ])
    assert.equal(evaluateCtni(input(), config(bad)).status, "invalid");
});
test("allows a negative slope when explicitly calibrated for the supplied range", () => {
  assert.equal(evaluateCtni(input(150), config({ a: -50 })).valueNgL, 0.1);
});
test("rejects extrapolation and invalid glucose/concentration calibration ranges", () => {
  for (const g of [49.9, 200.1])
    assert.equal(evaluateCtni(input(g)).status, "out-of-range");
  for (const c of [
    config({ glucoseRange: null }),
    config({ glucoseRange: { min: 200, max: 50 } }),
    config({ ctniRange: { min: 20, max: 10 } }),
  ])
    assert.equal(evaluateCtni(input(), c).status, "invalid");
  assert.equal(
    evaluateCtni(input(), config({ ctniRange: { min: 0.1, max: 5 } })).status,
    "out-of-range",
  );
});
test("rejects numerical overflow/underflow instead of displaying zero or infinity", () => {
  for (const a of [0.001, -0.001]) {
    const r = evaluateCtni(input(150), config({ a }));
    assert.equal(r.valueNgL, null);
    assert.equal(r.status, "invalid");
  }
});
test("status flag alone never promotes synthetic or unreviewed coefficients to validated data", () => {
  const c = config({ status: "validated" });
  assert.equal(
    evaluateCtni(input(124, { mode: "standard" }), c).valueNgL,
    null,
  );
  assert.equal(
    evaluateCtni(input(124, { mode: "standard" }), DEMO_CALIBRATION_CONFIG)
      .valueNgL,
    null,
  );
});
test("validated calibration requires TropoSense-specific review and blocks simulated OCR", () => {
  const c = config({
    id: "test-reviewed",
    status: "validated",
    source: "troposense-experiment",
    review: {
      reviewedBy: "TEST REVIEWER ONLY",
      reviewedAt: "2026-11-22",
      evidence: "UNIT TEST FIXTURE ONLY",
      deviceCompatibilityConfirmed: true,
    },
  });
  assert.equal(
    evaluateCtni(input(150, { mode: "standard" }), c).status,
    "calibrated",
  );
  assert.equal(
    evaluateCtni(input(150, { mode: "standard", source: "ocr-demo" }), c)
      .valueNgL,
    null,
  );
});
test("no invented upper reference limit and demo results cannot be clinically compared", () => {
  assert.equal(CTNI_REFERENCE_CONFIG.upperLimitNgL, null);
  assert.equal(referenceStatus(40, true), REFERENCE_UNAVAILABLE);
  assert.equal(referenceStatus(20, false), REFERENCE_UNAVAILABLE);
});
