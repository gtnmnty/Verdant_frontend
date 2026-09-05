"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, Plus, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ProductFormDialog } from "@/app/admin/products/_components/ProductFormDialog";
import { useAdmin } from "@/lib/admin/store";
import type { Product } from "@/lib/admin/types";

export function PriceDisplay({
  price,
  salePrice,
  size = "sm",
}: {
  price: number;
  salePrice?: number;
  size?: "sm" | "lg";
}) {
  const large = size === "lg";

  if (salePrice) {
    return (
      <div className={large ? "flex items-baseline gap-2" : "text-sm"}>
        <span
          className={
            large
              ? "font-display text-3xl font-semibold text-admin-rose"
              : "font-semibold text-admin-rose"
          }
        >
          ${salePrice}
        </span>
        <span
          className={
            large
              ? "text-base text-admin-muted line-through"
              : "ml-1 text-xs text-admin-muted line-through"
          }
        >
          ${price}
        </span>
      </div>
    );
  }

  return (
    <span className={large ? "font-display text-3xl font-semibold" : "font-semibold"}>
      ${price}
    </span>
  );
}

export function ProductsContent() {
  const { products, setProducts, pushActivity } = useAdmin();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (status !== "all" && p.status !== status) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      );
    });
  }, [products, search, category, status]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setFormOpen(true);
  };

  const toggleStatus = (p: Product) => {
    setProducts((prev) =>
      prev.map((row) =>
        row.id === p.id
          ? { ...row, status: row.status === "active" ? "inactive" : "active" }
          : row,
      ),
    );
    toast.success("Status updated.");
  };

  const confirmDelete = () => {
    if (!deleting) return;
    setProducts((prev) => prev.filter((p) => p.id !== deleting.id));
    pushActivity({ kind: "restock", title: "Product Removed", body: deleting.name });
    toast.success("Product deleted.");
    setDeleting(null);
  };

  const columns: Column<Product>[] = [
    {
      key: "name",
      header: "Product",
      sortable: true,
      sortValue: (p) => p.name,
      render: (p) => (
        <Link
          href={`/admin/products/${p.id}`}
          className="flex min-w-0 items-center gap-3 hover:underline"
        >
          {p.images[p.primaryImage] ? (
            // eslint-disable-next-line @next/next/no-img-element -- thumbnail sourced from arbitrary uploaded URLs
            <img
              src={p.images[p.primaryImage]}
              alt=""
              className="size-10 shrink-0 rounded-md object-cover"
            />
          ) : (
            <div className="grid size-10 shrink-0 place-items-center rounded-md bg-admin-cream text-xs text-admin-muted">
              IMG
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-medium">{p.name}</p>
            <p className="truncate text-xs text-admin-muted">{p.category}</p>
          </div>
        </Link>
      ),
    },
    {
      key: "sku",
      header: "SKU",
      render: (p) => <span className="font-mono text-xs">{p.sku}</span>,
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      sortValue: (p) => p.category,
      render: (p) => <span className="text-sm">{p.category}</span>,
    },
    {
      key: "price",
      header: "Price",
      sortable: true,
      sortValue: (p) => p.salePrice ?? p.price,
      render: (p) => <PriceDisplay price={p.price} salePrice={p.salePrice} />,
    },
    {
      key: "stock",
      header: "Stock",
      sortable: true,
      sortValue: (p) => p.stock,
      render: (p) => (
        <span className={p.stock <= p.lowStockThreshold ? "font-semibold text-admin-rose" : ""}>
          {p.stock}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p) => <StatusBadge status={p.status} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage retail inventory across all branches."
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-1.5 size-4" /> Add Product
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-admin-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
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
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-36 border-admin-line bg-admin-surface">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast("Refreshed")}
          className="border-admin-line"
        >
          <RefreshCw className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast("Exported CSV")}
          className="border-admin-line"
        >
          <Download className="size-4" /> Export
        </Button>
      </div>

      <DataTable
        rows={filtered}
        columns={columns}
        emptyTitle="No products found"
        emptyDescription="Try a different search or add a new product."
        bulkActions={(ids, clear) => (
          <Button
            size="sm"
            variant="ghost"
            className="text-admin-rose"
            onClick={() => {
              setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
              toast.success(`Deleted ${ids.length} products`);
              clear();
            }}
          >
            Delete selected
          </Button>
        )}
        rowActions={(p) => [
          { label: "Edit", onSelect: () => openEdit(p) },
          {
            label: p.status === "active" ? "Set inactive" : "Set active",
            onSelect: () => toggleStatus(p),
          },
          { label: "Delete", onSelect: () => setDeleting(p), destructive: true },
        ]}
      />

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editing} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete this product?"
        description={`"${deleting?.name}" will be permanently removed from inventory.`}
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
      />
    </div>
  );
}
