"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/app/admin/_components/ConfirmDialog";
import { DataTable, type Column } from "@/app/admin/_components/DataTable";
import { PageHeader } from "@/app/admin/_components/PageHeader";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AccountFormDialog, EMPTY_ACCOUNT } from "@/app/admin/accounts/_components/AccountFormDialog";
import { useRole } from "@/lib/admin/role-context";
import { useAdmin } from "@/lib/admin/store";
import type { Account } from "@/lib/admin/types";

export function AccountsContent() {
  const { accounts, setAccounts, uid } = useAdmin();
  const { perms } = useRole();
  const canTouch = (a: Account) => perms.caps.manageManagers || a.role !== "manager";
  const router = useRouter();
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editing, setEditing] = useState<Account | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      accounts.filter((a) => {
        if (roleFilter !== "all" && a.role !== roleFilter) return false;
        if (q && !`${a.name} ${a.email}`.toLowerCase().includes(q.toLowerCase())) {
          return false;
        }
        return true;
      }),
    [accounts, q, roleFilter],
  );

  const columns: Column<Account>[] = [
    {
      key: "name",
      header: "User",
      sortable: true,
      sortValue: (a) => a.name,
      render: (a) => (
        <div className="flex min-w-0 items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded/dicebear avatar URLs */}
          <img src={a.avatar} alt="" className="size-9 shrink-0 rounded-full" />
          <div className="min-w-0">
            <p className="truncate font-medium">{a.name}</p>
            <p className="truncate text-xs text-admin-muted">{a.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (a) => <span className="text-sm capitalize">{a.role}</span>,
    },
    {
      key: "phone",
      header: "Phone",
      render: (a) => <span className="text-xs">{a.phone || "—"}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (a) => <StatusBadge status={a.status} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Accounts"
        actions={
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-admin-muted" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search"
                className="h-9 w-48 rounded-full border-admin-line bg-admin-surface pl-9 sm:w-64"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="h-9 w-36 rounded-full border-admin-line bg-admin-surface">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="stylist">Stylist</SelectItem>
                <SelectItem value="receptionist">Receptionist</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              className="rounded-full bg-admin-sidebar text-white"
              onClick={() => {
                setEditing({ ...EMPTY_ACCOUNT });
                setOpen(true);
              }}
            >
              <Plus className="size-4" /> Add Account
            </Button>
          </>
        }
      />

      <DataTable
        rows={filtered}
        columns={columns}
        emptyTitle="No accounts found"
        emptyDescription="Try a different search or role filter."
        rowActions={(row) => {
          const base = [
            {
              label: "View profile",
              onSelect: (r: Account) => router.push(`/admin/accounts/${r.id}`),
            },
          ];
          if (!canTouch(row)) return base;
          return [
            ...base,
            {
              label: "Edit",
              onSelect: (r: Account) => {
                setEditing({ ...r });
                setOpen(true);
              },
            },
            { label: "Reset password", onSelect: () => toast.success("Reset link sent") },
            {
              label: row.status === "active" ? "Suspend" : "Restore",
              onSelect: (r: Account) => {
                setAccounts((prev) =>
                  prev.map((a) =>
                    a.id === r.id
                      ? { ...a, status: a.status === "active" ? "suspended" : "active" }
                      : a,
                  ),
                );
                toast.success("Updated");
              },
            },
            { label: "Delete", destructive: true, onSelect: (r: Account) => setDeleteId(r.id) },
          ];
        }}
      />

      <AccountFormDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        onEditingChange={setEditing}
        onSave={(a) => {
          if (a.id) setAccounts((prev) => prev.map((row) => (row.id === a.id ? a : row)));
          else setAccounts((prev) => [{ ...a, id: uid("a") }, ...prev]);
          toast.success("Saved");
          setOpen(false);
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete account?"
        destructive
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteId) {
            setAccounts((prev) => prev.filter((a) => a.id !== deleteId));
            toast.success("Deleted");
            setDeleteId(null);
          }
        }}
      />
    </>
  );
}
