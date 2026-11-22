/** Editable only after TropoSense-specific experimental review.
 * Ze et al. (2025), DOI 10.25259/AJC_178_2024 is a conceptual reference,
 * NOT the source of any coefficients, ranges or clinical limits below.
 */
export type CalibrationMode = "standard" | "demo";
export type CalibrationConfig = {
  id: string;
  model: "logarithmic";
  status: "unavailable" | "demo" | "validated";
  source: "none" | "synthetic" | "troposense-experiment";
  glucoseUnit: "mg/dL";
  ctniUnit: "ng/L";
  a: number | null;
  b: number | null;
  C0: number | null;
  glucoseRange: { min: number; max: number } | null;
  ctniRange: { min: number; max: number } | null;
  review: {
    reviewedBy: string;
    reviewedAt: string;
    evidence: string;
    deviceCompatibilityConfirmed: boolean;
  } | null;
};
// No real TropoSense calibration currently exists. Do not fill with paper coefficients.
export const CALIBRATION_CONFIG: Readonly<CalibrationConfig> = {
  id: "troposense-unconfigured-v1",
  model: "logarithmic",
  status: "unavailable",
  source: "none",
  glucoseUnit: "mg/dL",
  ctniUnit: "ng/L",
  a: null,
  b: null,
  C0: null,
  glucoseRange: null,
  ctniRange: null,
  review: null,
};
// Purely synthetic arithmetic fixture, NOT experimental data or a clinical range.
// G = 100 -> C = 1, G = 150 -> C = 10. Only usable after explicit DEMO selection.
export const DEMO_CALIBRATION_CONFIG: Readonly<CalibrationConfig> = {
  id: "synthetic-log-demo-v1",
  model: "logarithmic",
  status: "demo",
  source: "synthetic",
  glucoseUnit: "mg/dL",
  ctniUnit: "ng/L",
  a: 50,
  b: 100,
  C0: 1,
  glucoseRange: { min: 50, max: 200 },
  ctniRange: { min: 0.1, max: 100 },
  review: null,
};
export type ReferenceConfig = {
  status: "unavailable" | "validated";
  unit: "ng/L";
  upperLimitNgL: number | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  evidence: string | null;
};
// No 20/40 ng/L or other invented clinical cut-off.
export const CTNI_REFERENCE_CONFIG: Readonly<ReferenceConfig> = {
  status: "unavailable",
  unit: "ng/L",
  upperLimitNgL: null,
  reviewedBy: null,
  reviewedAt: null,
  evidence: null,
};
