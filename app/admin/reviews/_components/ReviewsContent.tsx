"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Star } from "lucide-react";
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
import { ReviewFormDialog, EMPTY_REVIEW } from "@/app/admin/reviews/_components/ReviewFormDialog";
import { Stars } from "@/app/admin/reviews/_components/Stars";
import { useRole } from "@/lib/admin/role-context";
import { useAdmin } from "@/lib/admin/store";
import type { Review } from "@/lib/admin/types";

export function ReviewsContent() {
  const { reviews, setReviews, uid, products, services } = useAdmin();
  const { perms } = useRole();
  const canModerate = perms.caps.moderateReviews;
  const router = useRouter();
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "product" | "service">("all");
  const [starFilter, setStarFilter] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [editing, setEditing] = useState<Review | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      reviews.filter((r) => {
        if (typeFilter !== "all" && r.itemType !== typeFilter) return false;
        if (starFilter !== 0 && r.rating !== starFilter) return false;
        if (
          q &&
          !`${r.customer} ${r.content} ${r.itemName}`.toLowerCase().includes(q.toLowerCase())
        ) {
          return false;
        }
        return true;
      }),
    [reviews, q, typeFilter, starFilter],
  );

  const columns: Column<Review>[] = [
    {
      key: "customer",
      header: "Customer",
      sortable: true,
      sortValue: (r) => r.customer,
      render: (r) => (
        <div className="flex min-w-0 items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded/dicebear avatar URLs */}
          <img src={r.customerAvatar} alt="" className="size-9 shrink-0 rounded-full" />
          <div className="min-w-0">
            <p className="truncate font-medium">{r.customer}</p>
            <p className="truncate text-xs text-admin-muted">{r.itemName || r.serviceName}</p>
          </div>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      sortable: true,
      sortValue: (r) => r.rating,
      render: (r) => <Stars value={r.rating} />,
    },
    {
      key: "content",
      header: "Review",
      render: (r) => <p className="line-clamp-2 max-w-xs text-sm">{r.content}</p>,
    },
    {
      key: "date",
      header: "Date",
      sortable: true,
      sortValue: (r) => r.reviewDate,
      render: (r) => <span className="text-xs text-admin-muted">{r.reviewDate}</span>,
    },
    {
      key: "type",
      header: "Item Type",
      render: (r) => <StatusBadge status={r.itemType} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Reviews"
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
            <Select
              value={typeFilter}
              onValueChange={(v: string) => setTypeFilter(v as typeof typeFilter)}
            >
              <SelectTrigger className="h-9 w-32 rounded-full border-admin-line bg-admin-surface">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="service">Service</SelectItem>
              </SelectContent>
            </Select>
            {canModerate ? (
              <Button
                size="sm"
                className="rounded-full bg-admin-sidebar text-white"
                onClick={() => {
                  setEditing({ ...EMPTY_REVIEW });
                  setOpen(true);
                }}
              >
                <Plus className="size-4" /> Add Review
              </Button>
            ) : null}
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {[0, 5, 4, 3, 2, 1].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setStarFilter(n as typeof starFilter)}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium ${
              starFilter === n
                ? "border-admin-sidebar bg-admin-sidebar text-white"
                : "border-admin-line bg-admin-surface text-admin-muted hover:text-admin-ink"
            }`}
          >
            {n === 0 ? (
              "All ratings"
            ) : (
              <>
                <span>{n}</span>
                <Star className="size-3 fill-current" />
              </>
            )}
          </button>
        ))}
      </div>

      <DataTable
        rows={filtered}
        columns={columns}
        emptyTitle="No reviews found"
        emptyDescription="Try a different search, rating, or item type filter."
        rowActions={(row) =>
          canModerate
            ? [
                {
                  label: "View details",
                  onSelect: (r: Review) => router.push(`/admin/reviews/${r.id}`),
                },
                {
                  label: "Edit",
                  onSelect: (r: Review) => {
                    setEditing({ ...r });
                    setOpen(true);
                  },
                },
                { label: "Delete", destructive: true, onSelect: (r: Review) => setDeleteId(r.id) },
              ]
            : [
                {
                  label: "View details",
                  onSelect: (r: Review) => router.push(`/admin/reviews/${r.id}`),
                },
              ]
        }
      />

      <ReviewFormDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        onEditingChange={setEditing}
        products={products}
        services={services}
        onSave={(r) => {
          if (r.id) setReviews((prev) => prev.map((row) => (row.id === r.id ? r : row)));
          else setReviews((prev) => [{ ...r, id: uid("r") }, ...prev]);
          toast.success("Saved");
          setOpen(false);
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete review?"
        destructive
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteId) {
            setReviews((prev) => prev.filter((r) => r.id !== deleteId));
            toast.success("Deleted");
            setDeleteId(null);
          }
        }}
      />
    </>
  );
}
