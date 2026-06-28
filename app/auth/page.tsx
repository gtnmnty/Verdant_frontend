import { Suspense } from "react";
import { AuthCard } from "./_components/AuthCard";

function AuthFallback() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F7F2E8]">
      <div className="h-9 w-9 animate-pulse rounded-full border border-[#B68D40]/40" aria-hidden="true" />
      <span className="sr-only">Loading sign-in</span>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <AuthCard />
    </Suspense>
  );
}
