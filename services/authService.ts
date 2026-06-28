// services/authService.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_URL!;
const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL!;

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
}

function decodeTokenPayload(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: "",
      email: payload.sub,
      fullName: "",
    };
  } catch {
    return null;
  }
}

export async function loginUser(
  identifier: string,
  password: string
): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: identifier, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message ?? "Login failed");
  }

  const data = await res.json();
  const user = await decodeTokenPayload(data.token);
  if (!user) throw new Error("Failed to load user profile");

  return { token: data.token, user };
}

export async function signUpUser(payload: {
  fullName: string;
  phone: string;
  email: string;
  password: string;
}): Promise<void> {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message ?? "Sign up failed");
  }
}

export async function verifyEmail(
  email: string,
  code: string
): Promise<void> {
  const res = await fetch(`${BASE_URL}/auth/verify`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, verificationCode: code }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message ?? "Verification failed");
  }
}

export async function resendVerificationCode(email: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/auth/resend`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message ?? "Failed to resend code");
  }
}