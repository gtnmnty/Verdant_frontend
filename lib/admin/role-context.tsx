"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { ROLE_PERMS, roleFromBackend, type Role, type RolePerms } from "@/lib/admin/roles";
import { useAuth } from "@/context/AuthContext";
import { gqlRequest } from "@/utils/graphqlClient";

export interface AdminMe {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
}

interface RoleCtx {
  // The signed-in user's real role (from the backend), not a switchable preference.
  role: Role;
  perms: RolePerms;
  me: AdminMe;
  // Reload the signed-in user (name/avatar shown in the topbar) after they edit their profile.
  refreshMe: () => void;
  // The stylist id representing the "logged in stylist" when role=stylist
  currentStylistId: string;
}

const Ctx = createContext<RoleCtx | null>(null);

const ME_QUERY = `query AdminRoleMe { me { id fullName email avatarUrl role } }`;

export function RoleProvider({
  children,
  defaultStylistId,
}: {
  children: ReactNode;
  defaultStylistId: string;
}) {
  const { token, loading: authLoading } = useAuth();
  const [state, setState] = useState<
    { status: "loading" } | { status: "denied" } | { status: "ready"; role: Role; me: AdminMe }
  >({ status: "loading" });

  const [reloadKey, setReloadKey] = useState(0);

  // Wait for the session restore: a freshly loaded tab has no token yet, and an anonymous request is
  // answered with "You do not have permission".
  useEffect(() => {
    if (authLoading || !token) return;
    let cancelled = false;
    gqlRequest<{ me: AdminMe & { role: string } }>(ME_QUERY)
      .then((res) => {
        if (cancelled) return;
        const role = roleFromBackend(res.me.role);
        setState(role ? { status: "ready", role, me: res.me } : { status: "denied" });
      })
      .catch(() => {
        // A refresh after the first load must not throw the whole admin area out; keep what we have.
        if (!cancelled) setState((s) => (s.status === "ready" ? s : { status: "denied" }));
      });
    return () => { cancelled = true; };
  }, [authLoading, token, reloadKey]);

  const value = useMemo<RoleCtx | null>(
    () =>
      state.status === "ready"
        ? {
            role: state.role,
            perms: ROLE_PERMS[state.role],
            me: state.me,
            refreshMe: () => setReloadKey((k) => k + 1),
            currentStylistId: defaultStylistId,
          }
        : null,
    [state, defaultStylistId],
  );

  if (state.status === "loading") {
    return <p className="py-16 text-center text-sm text-admin-muted">Loading…</p>;
  }
  if (!value) {
    return (
      <p className="py-16 text-center text-sm text-admin-muted">
        Your account doesn&apos;t have access to the admin area.
      </p>
    );
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRole() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useRole must be used inside RoleProvider");
  return c;
}
