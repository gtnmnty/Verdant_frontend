"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { ROLE_PERMS, type Role, type RolePerms } from "@/lib/admin/roles";

interface RoleCtx {
  role: Role;
  perms: RolePerms;
  setRole: (r: Role) => void;
  /** The stylist id representing the "logged in stylist" when role=stylist */
  currentStylistId: string;
}

const Ctx = createContext<RoleCtx | null>(null);

const STORAGE_KEY = "admin.role";

export function RoleProvider({
  children,
  defaultStylistId,
}: {
  children: ReactNode;
  defaultStylistId: string;
}) {
  const [role, setRoleState] = useState<Role>("manager");

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY) as Role | null;
      if (v && ROLE_PERMS[v]) setRoleState(v);
    } catch {
      /* noop */
    }
  }, []);

  const setRole = (r: Role) => {
    setRoleState(r);
    try {
      localStorage.setItem(STORAGE_KEY, r);
    } catch {
      /* noop */
    }
  };

  const value = useMemo<RoleCtx>(
    () => ({
      role,
      perms: ROLE_PERMS[role],
      setRole,
      currentStylistId: defaultStylistId,
    }),
    [role, defaultStylistId],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRole() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useRole must be used inside RoleProvider");
  return c;
}
