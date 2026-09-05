"use client";

import type { ReactNode } from "react";
import { RoleProvider } from "@/lib/admin/role-context";
import { useAdmin } from "@/lib/admin/store";

export function AdminRoleBridge({ children }: { children: ReactNode }) {
  const { stylists } = useAdmin();
  return (
    <RoleProvider defaultStylistId={stylists[0]?.id ?? ""}>
      {children}
    </RoleProvider>
  );
}
