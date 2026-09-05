"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
import { useAdmin } from "@/lib/admin/store";
import type { Account } from "@/lib/admin/types";

const ROLES: Account["role"][] = ["admin", "manager", "stylist", "receptionist", "customer"];

export function StaffTab() {
  const { accounts, setAccounts } = useAdmin();
  const staff = accounts.filter((a) => a.role !== "customer");

  const setRole = (id: string, role: Account["role"]) =>
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, role } : a)));

  const toggleStatus = (id: string) =>
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: a.status === "active" ? "suspended" : "active" } : a,
      ),
    );

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
        <ul className="divide-y divide-admin-line/60">
          {staff.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-3 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- dicebear returns SVG, next/image blocks SVG by default */}
              <img src={a.avatar} alt="" className="size-9 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{a.name}</p>
                <p className="truncate text-xs text-admin-muted">{a.email}</p>
              </div>
              <Select value={a.role} onValueChange={(v) => setRole(a.id, v as Account["role"])}>
                <SelectTrigger className="w-36 shrink-0"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.filter((r) => r !== "customer").map((r) => (
                    <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label className="flex shrink-0 items-center gap-2 text-xs text-admin-muted">
                Active
                <Switch checked={a.status === "active"} onCheckedChange={() => toggleStatus(a.id)} />
              </label>
            </li>
          ))}
        </ul>
      </SettingsCard>
    </div>
  );
}
