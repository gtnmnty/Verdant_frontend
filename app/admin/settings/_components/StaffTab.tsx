"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { SettingsCard } from "@/app/admin/settings/_components/SettingsCard";
import { gqlRequest } from "@/utils/graphqlClient";

const ROLES = ["admin", "manager", "stylist", "receptionist"] as const;
type Role = (typeof ROLES)[number];

const ROLE_TO_BACKEND: Record<Role, string> = {
  admin: "ADMIN",
  manager: "MANAGER",
  stylist: "STYLIST",
  receptionist: "RECEPTIONIST",
};
const ROLE_FROM_BACKEND: Record<string, Role> = {
  ADMIN: "admin",
  MANAGER: "manager",
  STYLIST: "stylist",
  RECEPTIONIST: "receptionist",
};

interface StaffMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  active: boolean;
}

interface BackendAccount {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  status: string;
}

// The old mock pulled from a shared client-side store — real staff comes
// from the same `accounts` query the Accounts route uses, filtered down to
// non-customer roles (fetched per-role since AccountFilterInput takes a
// single role, not "not customer").
const STAFF_QUERY = `
    query SettingsStaff($role: AccountRole!) {
        accounts(filter: { role: $role }, page: 1, pageSize: 100) {
            content { id fullName email avatarUrl role status }
        }
    }
`;

const UPDATE_ROLE_MUTATION = `
    mutation SettingsUpdateStaffRole($id: ID!, $input: UpdateAccountInput!) {
        updateAccount(id: $id, input: $input) { id role }
    }
`;

const SUSPEND_ACCOUNTS_MUTATION = `
    mutation SettingsSuspendStaff($ids: [ID!]!) {
        suspendAccounts(ids: $ids) { id status }
    }
`;

const RESTORE_ACCOUNT_MUTATION = `
    mutation SettingsRestoreStaff($id: ID!, $input: UpdateAccountInput!) {
        updateAccount(id: $id, input: $input) { id status }
    }
`;

const FALLBACK_AVATAR = "https://picsum.photos/seed/staff-settings/100/100";

export function StaffTab() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = () => {
    setLoading(true);
    Promise.all(
      ROLES.map((r) =>
        gqlRequest<{ accounts: { content: BackendAccount[] } }>(STAFF_QUERY, {
          role: ROLE_TO_BACKEND[r],
        }).then((res) => res.accounts.content),
      ),
    )
      .then((lists) => {
        const flat = lists.flat().map((a) => ({
          id: a.id,
          name: a.fullName,
          email: a.email,
          avatar: a.avatarUrl ?? FALLBACK_AVATAR,
          role: ROLE_FROM_BACKEND[a.role] ?? "stylist",
          active: a.status === "ACTIVE",
        }));
        setStaff(flat);
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load staff."))
      .finally(() => setLoading(false));
  };

  useEffect(fetchStaff, []);

  const setRole = (id: string, role: Role) => {
    gqlRequest(UPDATE_ROLE_MUTATION, { id, input: { role: ROLE_TO_BACKEND[role] } })
      .then(() => {
        toast.success("Role updated");
        fetchStaff();
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to update role."));
  };

  const toggleStatus = (member: StaffMember) => {
    const request = member.active
      ? gqlRequest(SUSPEND_ACCOUNTS_MUTATION, { ids: [member.id] })
      : gqlRequest(RESTORE_ACCOUNT_MUTATION, { id: member.id, input: { status: "ACTIVE" } });

    request
      .then(() => {
        toast.success("Updated");
        fetchStaff();
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to update status."));
  };

  return (
    <div className="space-y-5">
      <SettingsCard
        title="Staff & roles"
        description="Quick role and access changes. Manage full profiles from Accounts."
        actions={
          <Button asChild variant="outline" size="sm" className="border-admin-line">
            <Link href="/admin/accounts">
              Open Accounts <ArrowRight className="ml-1 size-3.5" />
            </Link>
          </Button>
        }
      >
        {loading ? (
          <p className="text-sm text-admin-muted">Loading…</p>
        ) : staff.length === 0 ? (
          <p className="text-sm text-admin-muted">No staff accounts yet.</p>
        ) : (
          <ul className="divide-y divide-admin-line/60">
            {staff.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 py-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded avatar URLs */}
                <img src={a.avatar} alt="" className="size-9 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.name}</p>
                  <p className="truncate text-xs text-admin-muted">{a.email}</p>
                </div>
                <Select value={a.role} onValueChange={(v) => setRole(a.id, v as Role)}>
                  <SelectTrigger className="w-36 shrink-0"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <label className="flex shrink-0 items-center gap-2 text-xs text-admin-muted">
                  Active
                  <Switch checked={a.active} onCheckedChange={() => toggleStatus(a)} />
                </label>
              </li>
            ))}
          </ul>
        )}
      </SettingsCard>
    </div>
  );
}
