import type { Profession } from "@/types/app";

export const PROFESSIONS: {
  value: Profession;
  label: string;
  icon: string;
  exams: { value: string; label: string }[];
}[] = [
  {
    value: "architecture",
    label: "Architecture",
    icon: "pencil-ruler",
    exams: [
      { value: "ALE 2026", label: "ALE — Architect Licensure Exam (PH)" },
      { value: "ARE 5.0", label: "ARE 5.0 — Architect Registration Exam (US)" },
      { value: "RIBA Part 3", label: "RIBA Part 3 (UK)" },
    ],
  },
  {
    value: "medicine",
    label: "Medicine",
    icon: "stethoscope",
    exams: [
      { value: "PLE", label: "PLE — Physician Licensure Exam (PH)" },
      { value: "USMLE Step 1", label: "USMLE Step 1 (US)" },
      { value: "PLAB", label: "PLAB (UK)" },
    ],
  },
  {
    value: "law",
    label: "Law",
    icon: "scale",
    exams: [
      { value: "Philippine Bar", label: "Philippine Bar Exam" },
      { value: "Bar (US)", label: "Bar Exam (US)" },
    ],
  },
  {
    value: "engineering",
    label: "Engineering",
    icon: "hard-hat",
    exams: [
      { value: "CE Board", label: "Civil Engineering Board Exam (PH)" },
      { value: "ME Board", label: "Mechanical Engineering Board Exam (PH)" },
      { value: "EE Board", label: "Electrical Engineering Board Exam (PH)" },
    ],
  },
];

export const TIER_LIMITS = {
  free: { questionsPerDay: 50, aiTokens: 0, savedConfigs: 0 },
  camp: { questionsPerDay: Infinity, aiTokens: 1000, savedConfigs: 10 },
  insurance: { questionsPerDay: Infinity, aiTokens: 10000, savedConfigs: 100 },
  institutional: { questionsPerDay: Infinity, aiTokens: Infinity, savedConfigs: Infinity },
} as const;

export const TIER_PRICES = {
  camp: { amount: 499, currency: "PHP", label: "₱499/mo" },
  insurance: { amount: 999, currency: "PHP", label: "₱999/mo" },
  institutional: { amount: 1499, currency: "PHP", label: "₱1499/mo" },
} as const;
