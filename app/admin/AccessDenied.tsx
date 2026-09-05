"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRole } from "@/lib/admin/role-context";

export function AccessDenied({ resource }: { resource?: string }) {
  const { perms } = useRole();
  return (
    <div className="mx-auto grid max-w-lg place-items-center rounded-2xl bg-admin-surface p-10 text-center shadow-sm">
      <div className="grid size-14 place-items-center rounded-full bg-admin-cream">
        <Lock className="size-6 text-admin-muted" />
      </div>
      <h2 className="mt-4 font-display text-2xl">Access restricted</h2>
      <p className="mt-2 text-sm text-admin-muted">
        Your role <span className="font-medium text-admin-ink">{perms.label}</span> doesn&apos;t
        have permission to view
        {resource ? ` ${resource}` : " this section"}. Contact your Manager for access.
      </p>
      <Button asChild className="mt-5 rounded-full bg-admin-sidebar text-white">
        <Link href="/admin">Go to Dashboard</Link>
      </Button>
    </div>
  );
}
