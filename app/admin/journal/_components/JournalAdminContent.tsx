"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/app/admin/_components/ConfirmDialog";
import { DataTable, type Column } from "@/app/admin/_components/DataTable";
import { PageHeader } from "@/app/admin/_components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JournalFormDialog } from "@/app/admin/journal/_components/JournalFormDialog";
import {
  categoryLabel,
  type AdminJournalStory,
  type JournalStatus,
} from "@/app/admin/journal/_components/types";
import { gqlRequest } from "@/utils/graphqlClient";

const LIST_QUERY = `
  query AdminJournalStories($status: JournalStoryStatus, $search: String, $page: Int, $pageSize: Int) {
    adminJournalStories(status: $status, search: $search, page: $page, pageSize: $pageSize) {
      items {
        id clientName quote category service stylist status publishedAt createdAt
        resultImage { url width height }
        serviceImageUrl
        products { id name price salePrice imageUrl }
      }
      totalPages
    }
  }
`;

const STATUS_MUTATION = `
  mutation SetJournalStatus($id: ID!, $status: JournalStoryStatus!) {
    setJournalStoryStatus(id: $id, status: $status) { id status }
  }
`;

const DELETE_MUTATION = `mutation DeleteJournalStory($id: ID!) { deleteJournalStory(id: $id) }`;

export function JournalAdminContent() {
  const [stories, setStories] = useState<AdminJournalStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | JournalStatus>("all");
  const [editing, setEditing] = useState<AdminJournalStory | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setSearch(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    try {
      const all: AdminJournalStory[] = [];
      let page = 1;
      let totalPages = 1;
      do {
        const res = await gqlRequest<{
          adminJournalStories: { items: AdminJournalStory[]; totalPages: number };
        }>(LIST_QUERY, {
          status: statusFilter === "all" ? undefined : statusFilter,
          search: search || undefined,
          page,
          pageSize: 50,
        });
        all.push(...res.adminJournalStories.items);
        totalPages = res.adminJournalStories.totalPages;
        page += 1;
      } while (page <= totalPages);
      setStories(all);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load journal stories");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleStatus = async (s: AdminJournalStory) => {
    try {
      await gqlRequest(STATUS_MUTATION, {
        id: s.id,
        status: s.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
      });
      toast.success(s.status === "PUBLISHED" ? "Unpublished" : "Published");
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const remove = async () => {
    if (!deleteId) return;
    try {
      await gqlRequest(DELETE_MUTATION, { id: deleteId });
      toast.success("Deleted");
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete story");
    } finally {
      setDeleteId(null);
    }
  };

  const columns: Column<AdminJournalStory>[] = [
    {
      key: "client",
      header: "Testimonial",
      sortable: true,
      sortValue: (s) => s.clientName,
      render: (s) => (
        <div className="flex min-w-0 items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- Cloudinary URLs */}
          <img src={s.resultImage.url} alt="" className="size-10 shrink-0 rounded-md object-cover" />
          <div className="min-w-0">
            <p className="truncate font-medium">{s.clientName}</p>
            <p className="max-w-xs truncate text-xs text-admin-muted">{s.quote}</p>
          </div>
        </div>
      ),
    },
    { key: "service", header: "Service", render: (s) => s.service },
    { key: "stylist", header: "Stylist", render: (s) => s.stylist },
    { key: "category", header: "Category", render: (s) => categoryLabel(s.category) },
    {
      key: "status",
      header: "Status",
      render: (s) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            s.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-800" : "bg-admin-cream text-admin-muted"
          }`}
        >
          {s.status === "PUBLISHED" ? "Published" : "Draft"}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Journal"
        description="Client testimonials shown to customers on the public Journal page."
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
              {(["all", "PUBLISHED", "DRAFT"] as const).map((k) => (
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
                  {k.toLowerCase()}
                </button>
              ))}
            </div>
            <Button
              size="sm"
              className="rounded-full bg-admin-sidebar text-white"
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus className="size-4" /> Add Testimonial
            </Button>
          </>
        }
      />

      <DataTable
        rows={stories}
        columns={columns}
        selectable={false}
        loading={loading}
        emptyTitle="No testimonials found"
        emptyDescription="Add a testimonial to show it on the public Journal."
        rowActions={(row) => [
          {
            label: "Edit",
            onSelect: (r: AdminJournalStory) => {
              setEditing(r);
              setOpen(true);
            },
          },
          {
            label: row.status === "PUBLISHED" ? "Unpublish" : "Publish",
            onSelect: toggleStatus,
          },
          { label: "Delete", destructive: true, onSelect: (r: AdminJournalStory) => setDeleteId(r.id) },
        ]}
      />

      <JournalFormDialog open={open} onOpenChange={setOpen} story={editing} onSaved={() => void load()} />

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete testimonial?"
        description="It will be removed from the public Journal."
        destructive
        confirmLabel="Delete"
        onConfirm={remove}
      />
    </>
  );
}
