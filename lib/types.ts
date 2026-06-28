export type AuthMode = "login" | "signup" | "forgot";

export type AsyncStatus = "idle" | "loading" | "success" | "error";

export interface LoginPayload {
  identifier: string;
  password: string;
  remember: boolean;
}

export interface SignUpPayload {
  fullName: string;
  phone: string;
  email: string;
  password: string;
}

export interface PasswordRequirement {
  id: "length" | "uppercase" | "lowercase" | "number" | "special";
  label: string;
  test: (value: string) => boolean;
}

export type PasswordStrengthLabel = "Very weak" | "Weak" | "Fair" | "Good" | "Strong";
