// Presentation labels only. These are NOT clinically validated risk criteria.
// No cTnI, calibration output or numerical threshold is consumed by this rule set.
export const DEMO_SCREENING_RULES = {
  clinicalValidated: false,
  urgentSymptoms: ["เจ็บหน้าอก", "แน่นหน้าอก", "หายใจเหนื่อย / ลำบาก"],
  urgentLabel: "High Risk",
  otherSymptomsLabel: "Moderate Risk",
  noSymptomsLabel: "Low Risk",
} as const;
