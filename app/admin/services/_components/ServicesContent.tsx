"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/app/admin/_components/PageHeader";
import { DataTable, type Column } from "@/app/admin/_components/DataTable";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { ConfirmDialog } from "@/app/admin/_components/ConfirmDialog";
import { ServiceFormDialog } from "@/app/admin/services/_components/ServiceFormDialog";
import { useAdmin } from "@/lib/admin/store";
import type { Service } from "@/lib/admin/types";

export function ServicesContent() {
  const { services, setServices, pushActivity } = useAdmin();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState<Service | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(services.map((s) => s.category))).sort(),
    [services],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services.filter((s) => {
      if (category !== "all" && s.category !== category) return false;
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
    });
  }, [services, search, category]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (s: Service) => {
    setEditing(s);
    setFormOpen(true);
  };

  const toggleActive = (s: Service) => {
    setServices((prev) =>
      prev.map((row) => (row.id === s.id ? { ...row, active: !row.active } : row)),
    );
  };

  const duplicate = (s: Service) => {
    const copy: Service = {
      ...s,
      id: `sv_${Math.random().toString(36).slice(2, 8)}`,
      name: `${s.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setServices((prev) => [copy, ...prev]);
    toast.success("Service duplicated.");
  };

  const confirmDelete = () => {
    if (!deleting) return;
    setServices((prev) => prev.filter((s) => s.id !== deleting.id));
    pushActivity({ kind: "shift", title: "Service Removed", body: deleting.name });
    toast.success("Service deleted.");
    setDeleting(null);
  };

  const columns: Column<Service>[] = [
    {
      key: "name",
      header: "Service",
      sortable: true,
      sortValue: (s) => s.name,
      render: (s) => (
        <Link href={`/admin/services/${s.id}`} className="flex items-center gap-3 hover:underline">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-admin-cream">
            {s.image ? <Image src={s.image} alt="" fill sizes="40px" className="object-cover" /> : null}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{s.name}</p>
            <p className="truncate text-xs text-admin-muted">{s.subName}</p>
          </div>
        </Link>
      ),
    },
    { key: "category", header: "Category", sortable: true, sortValue: (s) => s.category, render: (s) => s.category },
    {
      key: "duration",
      header: "Duration",
      sortable: true,
      sortValue: (s) => s.duration,
      render: (s) => `${s.duration} min`,
    },
    {
      key: "price",
      header: "Price",
      sortable: true,
      sortValue: (s) => s.price,
      render: (s) => `$${s.price.toFixed(0)}`,
    },
    {
      key: "status",
      header: "Status",
      render: (s) => (
        <div className="flex items-center gap-2">
          <Switch checked={s.active} onCheckedChange={() => toggleActive(s)} />
          <StatusBadge status={s.active ? "active" : "inactive"} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Services"
        description="Manage the salon's service catalog."
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-1.5 size-4" /> New Service
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-admin-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services…"
            className="border-admin-line bg-admin-surface pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-44 border-admin-line bg-admin-surface">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        rows={filtered}
        columns={columns}
        emptyTitle="No services found"
        emptyDescription="Try a different search or add a new service."
        rowActions={(s) => [
          { label: "Edit", onSelect: () => openEdit(s) },
          { label: "Duplicate", onSelect: () => duplicate(s) },
          { label: "Delete", onSelect: () => setDeleting(s), destructive: true },
        ]}
      />

      <ServiceFormDialog open={formOpen} onOpenChange={setFormOpen} service={editing} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete this service?"
        description={`"${deleting?.name}" will be permanently removed from the catalog.`}
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
      />
    </div>
  );
}
