"use client";

import { useMemo, useState, type SubmitEvent } from "react";
import { Button } from "./ui/Button";
import { TextField, PasswordField } from "./ui/Field";
import { Checkbox } from "./ui/Checkbox";
import { SocialButtons } from "./SocialButtons";
import { isValidIdentifier } from "@/lib/validation";
import type { AsyncStatus } from "@/lib/types";
import {useRouter} from "next/navigation";
import {useAuth} from "@/context/AuthContext";
import { loginUser } from "@/services/authService";

interface LoginFormProps {
  onSwitchToSignUp: () => void;
  onSwitchToForgot: () => void;
  initialIdentifier?: string;
}

export function LoginForm(
  { onSwitchToSignUp, onSwitchToForgot, initialIdentifier = "" }: LoginFormProps) {
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<AsyncStatus>("idle");
  const [notice, setNotice] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();

  const identifierError =
    touched && identifier.length > 0 && !isValidIdentifier(identifier)
      ? "Enter a valid email address or phone number."
      : undefined;

  const isFormValid = useMemo(
    () => isValidIdentifier(identifier) && password.length >= 1,
    [identifier, password]
  );

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (!isFormValid) return;

    setStatus("loading");
    setNotice(null);

    try {
      const { token, user } = await loginUser(identifier, password);
      login(token, user);
      router.push("/");
    } catch (err) {
      setStatus("error");
      setNotice(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
      <TextField
        label="Email or phone number"
        name="identifier"
        type="text"
        autoComplete="username"
        placeholder="your@email.com"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        onBlur={() => setTouched(true)}
        error={identifierError}
      />

      <div>
        <PasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showToggleLabel="password"
        />
        <button
          type="button"
          onClick={onSwitchToForgot}
          className="mt-2 text-[0.8rem] font-medium text-[#B68D40] underline-offset-2
          transition-colors hover:text-[#15241D] hover:underline focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-[#B68D40]/40 focus-visible:rounded-sm"
        >
          Forgot password?
        </button>
      </div>

      <Checkbox
        label="Remember me on this device"
        checked={remember}
        onChange={(e) => setRemember(e.target.checked)}
      />

      {notice ? <p className="text-[0.8rem] text-[#6E6859]">{notice}</p> : null}

      <Button
        type="submit"
        isLoading={status === "loading"}
        loadingLabel="Signing in"
        disabled={!isFormValid}
      >
        Log in
      </Button>

      <SocialButtons onSelect={(provider) => setNotice(
        `${provider === "google" ? "Google" : "Apple"} sign-in is a demo placeholder.`)} />

      <p className="text-center text-[0.85rem] text-[#6E6859]">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="font-medium text-[#15241D] underline-offset-2 hover:underline
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B68D40]/40
          focus-visible:rounded-sm"
        >
          Create account now
        </button>
      </p>
    </form>
  );
}
