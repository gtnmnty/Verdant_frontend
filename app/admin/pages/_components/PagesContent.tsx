"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/app/admin/_components/PageHeader";
import { DataTable, type Column } from "@/app/admin/_components/DataTable";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { ConfirmDialog } from "@/app/admin/_components/ConfirmDialog";
import { PageFormDialog } from "@/app/admin/pages/_components/PageFormDialog";
import { useAdmin } from "@/lib/admin/store";
import type { PageRecord } from "@/lib/admin/types";

export function PagesContent() {
  const router = useRouter();
  const { pages, setPages, uid } = useAdmin();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PageRecord | null>(null);
  const [deleting, setDeleting] = useState<PageRecord | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter((p) => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q));
  }, [pages, search]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (p: PageRecord) => {
    setEditing(p);
    setFormOpen(true);
  };

  const togglePublish = (p: PageRecord) => {
    setPages((prev) =>
      prev.map((row) =>
        row.id === p.id ? { ...row, status: row.status === "draft" ? "published" : "draft" } : row,
      ),
    );
    toast.success(p.status === "draft" ? "Page published" : "Page moved to draft");
  };

  const duplicate = (p: PageRecord) => {
    setPages((prev) => [
      { ...p, id: uid("pg"), title: `${p.title} (Copy)`, status: "draft" },
      ...prev,
    ]);
    toast.success("Page duplicated");
  };

  const confirmDelete = () => {
    if (!deleting) return;
    setPages((prev) => prev.filter((p) => p.id !== deleting.id));
    toast.success("Page deleted");
    setDeleting(null);
  };

  const columns: Column<PageRecord>[] = [
    {
      key: "title",
      header: "Title",
      sortable: true,
      sortValue: (p) => p.title,
      render: (p) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{p.title}</p>
          <p className="truncate text-xs text-admin-muted">/{p.slug}</p>
        </div>
      ),
    },
    { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
    {
      key: "updated",
      header: "Updated",
      sortable: true,
      sortValue: (p) => p.updatedAt,
      render: (p) => <span className="text-sm text-admin-muted">{p.updatedAt}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Pages"
        description="Manage static content pages and their SEO metadata."
        actions={
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-admin-muted" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="h-9 w-48 rounded-full border-admin-line bg-admin-surface pl-9 sm:w-64"
              />
            </div>
            <Button size="sm" className="rounded-full bg-admin-sidebar text-white hover:bg-admin-sidebar/90" onClick={openCreate}>
              <Plus className="size-4" /> Add Page
            </Button>
          </>
        }
      />

      <DataTable
        rows={filtered}
        columns={columns}
        emptyTitle="No pages found"
        emptyDescription="Try a different search or add a new page."
        rowActions={(p) => [
          { label: "View Details", onSelect: () => router.push(`/admin/pages/${p.id}`) },
          { label: "Edit", onSelect: () => openEdit(p) },
          { label: p.status === "draft" ? "Publish" : "Unpublish", onSelect: () => togglePublish(p) },
          { label: "Duplicate", onSelect: () => duplicate(p) },
          { label: "Delete", onSelect: () => setDeleting(p), destructive: true },
        ]}
      />

      <PageFormDialog open={formOpen} onOpenChange={setFormOpen} page={editing} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete this page?"
        description={`"${deleting?.title}" will be permanently removed.`}
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
      />
    </div>
  );
}
