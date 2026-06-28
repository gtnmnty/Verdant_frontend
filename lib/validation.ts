import type { PasswordRequirement, PasswordStrengthLabel } from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PHONE_PATTERN = /^\+?[0-9()\-\s]{7,16}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  const digitCount = value.replace(/\D/g, "").length;
  return PHONE_PATTERN.test(value.trim()) && digitCount >= 7;
}

export function isValidIdentifier(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  return isValidEmail(trimmed) || isValidPhone(trimmed);
}

export function isValidFullName(value: string): boolean {
  return value.trim().length >= 2;
}

export const passwordRequirements: PasswordRequirement[] = [
  { id: "length", label: "At least 8 characters", test: (v) => v.length >= 8 },
  { id: "uppercase", label: "One uppercase letter (A–Z)", test: (v) => /[A-Z]/.test(v) },
  { id: "lowercase", label: "One lowercase letter (a–z)", test: (v) => /[a-z]/.test(v) },
  { id: "number", label: "One number (0–9)", test: (v) => /[0-9]/.test(v) },
  {
    id: "special",
    label: "One special character (!@#$…)",
    test: (v) => /[^A-Za-z0-9]/.test(v),
  },
];

export function getMetRequirementIds(password: string): Set<string> {
  const met = new Set<string>();
  for (const req of passwordRequirements) {
    if (req.test(password)) met.add(req.id);
  }
  return met;
}

export function isPasswordValid(password: string): boolean {
  return passwordRequirements.every((req) => req.test(password));
}

/** Returns a 0–4 strength score and a matching label for a password. */
export function getPasswordStrength(password: string): {
  score: number;
  label: PasswordStrengthLabel;
} {
  if (password.length === 0) return { score: 0, label: "Very weak" };

  const metCount = getMetRequirementIds(password).size;
  const lengthBonus = password.length >= 12 ? 1 : 0;
  const score = Math.min(4, Math.max(0, metCount - 1 + lengthBonus));

  const labels: PasswordStrengthLabel[] = ["Very weak", "Weak", "Fair", "Good", "Strong"];
  return { score, label: labels[score] };
}

/** Simple, deterministic mock "basic" password check used for the sign-up step. */
export function isUsablePassword(password: string): boolean {
  return password.length >= 8;
}
