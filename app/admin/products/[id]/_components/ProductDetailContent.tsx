"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Pencil, Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DetailHeader,
  DetailGrid,
  DetailCard,
  FieldRow,
} from "@/app/admin/_components/Detail";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { ConfirmDialog } from "@/app/admin/_components/ConfirmDialog";
import { EmptyState } from "@/app/admin/_components/EmptyState";
import { ProductFormDialog } from "@/app/admin/products/_components/ProductFormDialog";
import { PriceDisplay } from "@/app/admin/products/_components/ProductsContent";
import { useAdmin } from "@/lib/admin/store";

export function ProductDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { products, setProducts, pushActivity } = useAdmin();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const product = products.find((p) => p.id === params.id);

  if (!product) {
    return (
      <EmptyState
        title="Product not found"
        description="It may have been removed. Return to the products list."
        action={
          <Button onClick={() => router.push("/admin/products")}>
            Back to Products
          </Button>
        }
      />
    );
  }

  const toggleStatus = () => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id
          ? { ...p, status: p.status === "active" ? "inactive" : "active" }
          : p,
      ),
    );
  };

  const handleDelete = () => {
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    pushActivity({ kind: "restock", title: "Product Removed", body: product.name });
    toast.success("Product deleted.");
    router.push("/admin/products");
  };

  return (
    <div>
      <DetailHeader
        backHref="/admin/products"
        backLabel="Back to Products"
        title={product.name}
        subtitle={product.sku}
        status={<StatusBadge status={product.status} />}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setEditOpen(true)}
              className="border-admin-line"
            >
              <Pencil className="mr-1.5 size-4" /> Edit
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(true)}
              className="border-admin-line text-admin-rose hover:text-admin-rose"
            >
              <Trash2 className="mr-1.5 size-4" /> Delete
            </Button>
          </>
        }
      />

      <DetailGrid>
        <div className="space-y-4">
          <DetailCard>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {product.images.length > 0 ? (
                product.images.map((src, i) => (
                  <div
                    key={i}
                    className={`relative aspect-square overflow-hidden rounded-xl bg-admin-cream ${
                      i === product.primaryImage ? "ring-2 ring-admin-sidebar" : ""
                    }`}
                  >
                    <Image
                      src={src}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 45vw, 200px"
                      className="object-cover"
                    />
                  </div>
                ))
              ) : (
                <div className="relative aspect-square overflow-hidden rounded-xl bg-admin-cream sm:col-span-2" />
              )}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-admin-muted">
              {product.description}
            </p>
            {product.info ? (
              <p className="mt-2 text-sm leading-relaxed text-admin-muted">
                {product.info}
              </p>
            ) : null}

            {product.badges.length || product.tags.length ? (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {product.badges.map((b) => (
                  <Badge
                    key={b}
                    className="bg-admin-amber/25 text-admin-ink hover:bg-admin-amber/25"
                  >
                    {b}
                  </Badge>
                ))}
                {product.tags.map((t) => (
                  <Badge
                    key={t}
                    variant="outline"
                    className="border-admin-line text-admin-muted"
                  >
                    #{t}
                  </Badge>
                ))}
              </div>
            ) : null}

            {product.infos.length > 0 ? (
              <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
                {product.infos.map((i) => (
                  <li key={i} className="text-sm text-admin-muted">
                    ✦ {i}
                  </li>
                ))}
              </ul>
            ) : null}
          </DetailCard>

          <DetailCard title="Rating">
            <div className="flex items-center gap-2">
              <Star className="size-4 fill-admin-amber text-admin-amber" />
              <span className="text-sm font-medium">
                {product.ratingAvg.toFixed(1)}
              </span>
              <span className="text-sm text-admin-muted">
                ({product.ratingCount} reviews)
              </span>
            </div>
          </DetailCard>
        </div>

        <div className="space-y-4">
          <DetailCard title="Pricing">
            <PriceDisplay price={product.price} salePrice={product.salePrice} size="lg" />
          </DetailCard>

          <DetailCard title="Details">
            <dl>
              <FieldRow label="Category" value={product.category} />
              <FieldRow label="SKU" value={product.sku} />
              <FieldRow
                label="Stock"
                value={`${product.stock} (low at ${product.lowStockThreshold})`}
              />
              <FieldRow label="Featured" value={product.featured ? "Yes" : "No"} />
              <FieldRow
                label="Created"
                value={new Date(product.createdAt).toLocaleDateString()}
              />
              <FieldRow
                label="Updated"
                value={new Date(product.updatedAt).toLocaleDateString()}
              />
            </dl>
          </DetailCard>

          <DetailCard title="Visibility">
            <label className="flex items-center justify-between">
              <span className="text-sm">Active on storefront</span>
              <Switch
                checked={product.status === "active"}
                onCheckedChange={toggleStatus}
              />
            </label>
          </DetailCard>
        </div>
      </DetailGrid>

      <ProductFormDialog open={editOpen} onOpenChange={setEditOpen} product={product} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this product?"
        description={`"${product.name}" will be permanently removed from inventory.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
