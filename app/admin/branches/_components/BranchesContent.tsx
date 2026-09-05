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
import { BranchFormDialog, EMPTY_BRANCH } from "@/app/admin/branches/_components/BranchFormDialog";
import { useRole } from "@/lib/admin/role-context";
import { useAdmin } from "@/lib/admin/store";
import type { Branch } from "@/lib/admin/types";

export function BranchesContent() {
  const { branches, setBranches, uid } = useAdmin();
  const { perms } = useRole();
  const canEdit = perms.caps.editBranch;
  const isManagerScope = perms.role === "manager";
  const router = useRouter();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [editing, setEditing] = useState<Branch | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const scoped = isManagerScope ? branches.slice(0, 1) : branches;
    return scoped.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      return !q || b.name.toLowerCase().includes(q.toLowerCase());
    });
  }, [branches, q, statusFilter, isManagerScope]);

  const columns: Column<Branch>[] = [
    {
      key: "name",
      header: "Branch",
      sortable: true,
      sortValue: (b) => b.name,
      render: (b) => (
        <div className="flex min-w-0 items-center gap-3">
          {b.image ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded URLs
            <img src={b.image} alt="" className="size-10 shrink-0 rounded-md object-cover" />
          ) : (
            <div className="size-10 shrink-0 rounded-md bg-admin-cream" />
          )}
          <div className="min-w-0">
            <p className="truncate font-medium">{b.name}</p>
            <p className="truncate text-xs text-admin-muted">{b.address}</p>
          </div>
        </div>
      ),
    },
    { key: "phone", header: "Phone", render: (b) => b.phone },
    {
      key: "hours",
      header: "Hours",
      render: (b) => <span className="text-sm">{b.operatingHours}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (b) => <StatusBadge status={b.status} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Branches"
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
            <div className="flex flex-wrap gap-2">
              {(["all", "active", "inactive"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setStatusFilter(k)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${
                    statusFilter === k
                      ? "border-admin-sidebar bg-admin-sidebar text-white"
                      : "border-admin-line bg-admin-surface text-admin-muted hover:text-admin-ink"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
            {canEdit && !isManagerScope ? (
              <Button
                size="sm"
                className="rounded-full bg-admin-sidebar text-white"
                onClick={() => {
                  setEditing({ ...EMPTY_BRANCH });
                  setOpen(true);
                }}
              >
                <Plus className="size-4" /> Add Branch
              </Button>
            ) : null}
          </>
        }
      />

      <DataTable
        rows={filtered}
        columns={columns}
        emptyTitle="No branches found"
        emptyDescription="Try a different search or status filter."
        rowActions={(row) =>
          canEdit
            ? [
                {
                  label: "View details",
                  onSelect: (r: Branch) => router.push(`/admin/branches/${r.id}`),
                },
                {
                  label: "Edit",
                  onSelect: (r: Branch) => {
                    setEditing({ ...r });
                    setOpen(true);
                  },
                },
                {
                  label: row.status === "active" ? "Set inactive" : "Set active",
                  onSelect: (r: Branch) => {
                    setBranches((prev) =>
                      prev.map((b) =>
                        b.id === r.id
                          ? { ...b, status: b.status === "active" ? "inactive" : "active" }
                          : b,
                      ),
                    );
                    toast.success("Updated");
                  },
                },
                ...(isManagerScope
                  ? []
                  : [
                      {
                        label: "Delete",
                        destructive: true,
                        onSelect: (r: Branch) => setDeleteId(r.id),
                      },
                    ]),
              ]
            : [
                {
                  label: "View details",
                  onSelect: (r: Branch) => router.push(`/admin/branches/${r.id}`),
                },
              ]
        }
        bulkActions={
          canEdit && !isManagerScope
            ? (ids, clear) => (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-admin-rose"
                  onClick={() => {
                    setBranches((prev) => prev.filter((b) => !ids.includes(b.id)));
                    toast.success("Deleted");
                    clear();
                  }}
                >
                  Delete selected
                </Button>
              )
            : undefined
        }
      />

      <BranchFormDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        onEditingChange={setEditing}
        onSave={(b) => {
          if (b.id) setBranches((prev) => prev.map((row) => (row.id === b.id ? b : row)));
          else setBranches((prev) => [{ ...b, id: uid("b") }, ...prev]);
          toast.success("Saved");
          setOpen(false);
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete branch?"
        destructive
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteId) {
            setBranches((prev) => prev.filter((b) => b.id !== deleteId));
            toast.success("Deleted");
            setDeleteId(null);
          }
        }}
      />
    </>
  );
}
