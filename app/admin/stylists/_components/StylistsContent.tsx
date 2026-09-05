"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/app/admin/_components/PageHeader";
import { DataTable, type Column } from "@/app/admin/_components/DataTable";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { ConfirmDialog } from "@/app/admin/_components/ConfirmDialog";
import { StylistFormDialog } from "@/app/admin/stylists/_components/StylistFormDialog";
import { useAdmin } from "@/lib/admin/store";
import type { Stylist } from "@/lib/admin/types";

export function StylistsContent() {
  const router = useRouter();
  const { stylists, setStylists, branches, pushActivity } = useAdmin();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Stylist | null>(null);
  const [deleting, setDeleting] = useState<Stylist | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stylists;
    return stylists.filter(
      (s) => s.fullName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q),
    );
  }, [stylists, search]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (s: Stylist) => {
    setEditing(s);
    setFormOpen(true);
  };

  const toggleStatus = (s: Stylist) => {
    setStylists((prev) =>
      prev.map((row) =>
        row.id === s.id ? { ...row, status: row.status === "active" ? "inactive" : "active" } : row,
      ),
    );
    toast.success("Status updated");
  };

  const confirmDelete = () => {
    if (!deleting) return;
    setStylists((prev) => prev.filter((s) => s.id !== deleting.id));
    pushActivity({ kind: "shift", title: "Stylist Removed", body: deleting.fullName });
    toast.success("Stylist deleted");
    setDeleting(null);
  };

  const columns: Column<Stylist>[] = [
    {
      key: "name",
      header: "Stylist",
      sortable: true,
      sortValue: (s) => s.fullName,
      render: (s) => (
        <Link href={`/admin/stylists/${s.id}`} className="flex min-w-0 items-center gap-3 hover:underline">
          {/* eslint-disable-next-line @next/next/no-img-element -- dicebear returns SVG, next/image blocks SVG by default */}
          <img src={s.photo} alt="" className="size-10 shrink-0 rounded-full" />
          <div className="min-w-0">
            <p className="truncate font-medium">{s.fullName}</p>
            <p className="truncate text-xs text-admin-muted">{s.email}</p>
          </div>
        </Link>
      ),
    },
    {
      key: "branch",
      header: "Branch",
      render: (s) => branches.find((b) => b.id === s.branchId)?.name ?? "—",
    },
    {
      key: "specialties",
      header: "Specialties",
      render: (s) => <span className="text-sm">{s.specialties.slice(0, 2).join(", ")}</span>,
    },
    { key: "status", header: "Status", render: (s) => <StatusBadge status={s.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Stylists"
        description="Manage your team of stylists and their assigned services."
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-1.5 size-4" /> Add Stylist
          </Button>
        }
      />

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-admin-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stylists…"
            className="border-admin-line bg-admin-surface pl-9"
          />
        </div>
      </div>

      <DataTable
        rows={filtered}
        columns={columns}
        emptyTitle="No stylists found"
        emptyDescription="Try a different search or add a new stylist."
        rowActions={(s) => [
          { label: "View Profile", onSelect: () => router.push(`/admin/stylists/${s.id}`) },
          { label: "Edit", onSelect: () => openEdit(s) },
          {
            label: s.status === "active" ? "Set Inactive" : "Set Active",
            onSelect: () => toggleStatus(s),
          },
          { label: "Delete", onSelect: () => setDeleting(s), destructive: true },
        ]}
      />

      <StylistFormDialog open={formOpen} onOpenChange={setFormOpen} stylist={editing} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete this stylist?"
        description={`"${deleting?.fullName}" will be permanently removed.`}
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
      />
    </div>
  );
}
