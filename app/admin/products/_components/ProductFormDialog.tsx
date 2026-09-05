"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChipInput } from "@/app/admin/_components/ChipInput";
import { ImageUploader } from "@/app/admin/_components/ImageUploader";
import { useAdmin } from "@/lib/admin/store";
import type { Product } from "@/lib/admin/types";

const CATEGORIES = ["Shampoo", "Conditioner", "Skincare", "Styling", "Fragrance"];
const MAX_IMAGES = 4;

type Draft = Omit<
  Product,
  "id" | "createdAt" | "updatedAt" | "ratingAvg" | "ratingCount"
>;

const EMPTY: Draft = {
  name: "",
  category: "Shampoo",
  description: "",
  info: "",
  price: 0,
  sku: "",
  stock: 0,
  lowStockThreshold: 5,
  badges: [],
  tags: [],
  infos: [],
  images: [],
  primaryImage: 0,
  status: "active",
  featured: false,
};

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}) {
  const { setProducts, pushActivity, uid } = useAdmin();
  const [draft, setDraft] = useState<Draft>(EMPTY);

  useEffect(() => {
    if (open) setDraft(product ? { ...product } : EMPTY);
  }, [open, product]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const addImages = (urls: string[]) => {
    const next = [...draft.images, ...urls].slice(0, MAX_IMAGES);
    set("images", next);
  };

  const removeImage = (index: number) => {
    const next = draft.images.filter((_, i) => i !== index);
    set("images", next);
    set("primaryImage", Math.min(draft.primaryImage, Math.max(0, next.length - 1)));
  };

  const handleSave = () => {
    if (!draft.name.trim()) return;
    const now = new Date().toISOString().slice(0, 10);

    if (product) {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, ...draft, updatedAt: now } : p)),
      );
      pushActivity({ kind: "restock", title: "Product Updated", body: draft.name });
    } else {
      const id = uid("p");
      setProducts((prev) => [
        {
          ...draft,
          id,
          ratingAvg: 0,
          ratingCount: 0,
          createdAt: now,
          updatedAt: now,
        },
        ...prev,
      ]);
      pushActivity({ kind: "restock", title: "Product Added", body: draft.name });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "New Product"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div>
            <Label>
              Images ({draft.images.length}/{MAX_IMAGES})
            </Label>
            <div className="mt-1.5">
              <ImageUploader
                images={draft.images}
                onChange={addImages}
                max={MAX_IMAGES}
              />
            </div>
            {draft.images.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-3">
                {draft.images.map((src, i) => (
                  <div
                    key={i}
                    className={`group relative overflow-hidden rounded-lg border-2 ${
                      i === draft.primaryImage ? "border-admin-sidebar" : "border-admin-line"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded URLs */}
                    <img src={src} alt="" className="size-24 object-cover" />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 px-2 py-1 text-[10px] text-white">
                      <button
                        type="button"
                        onClick={() => set("primaryImage", i)}
                        className="hover:underline"
                      >
                        {i === draft.primaryImage ? "Primary" : "Set primary"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="hover:text-admin-rose"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="p-name">Name</Label>
              <Input
                id="p-name"
                value={draft.name}
                onChange={(e) => set("name", e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="p-sku">SKU</Label>
              <Input
                id="p-sku"
                value={draft.sku}
                onChange={(e) => set("sku", e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Category</Label>
              <Select value={draft.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={draft.status}
                onValueChange={(v: "active" | "inactive") => set("status", v)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <Label htmlFor="p-price">Price ($)</Label>
              <Input
                id="p-price"
                type="number"
                value={draft.price}
                onChange={(e) => set("price", Number(e.target.value))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="p-sale-price">Sale price ($)</Label>
              <Input
                id="p-sale-price"
                type="number"
                value={draft.salePrice ?? ""}
                onChange={(e) =>
                  set("salePrice", e.target.value ? Number(e.target.value) : undefined)
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="p-stock">Stock</Label>
              <Input
                id="p-stock"
                type="number"
                value={draft.stock}
                onChange={(e) => set("stock", Number(e.target.value))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="p-low-stock">Low stock at</Label>
              <Input
                id="p-low-stock"
                type="number"
                value={draft.lowStockThreshold}
                onChange={(e) => set("lowStockThreshold", Number(e.target.value))}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="p-desc">Description</Label>
            <Textarea
              id="p-desc"
              rows={2}
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="p-info">Long-form Info</Label>
            <Textarea
              id="p-info"
              rows={3}
              value={draft.info}
              onChange={(e) => set("info", e.target.value)}
              placeholder="Detailed long-form product information…"
              className="mt-1.5"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label className="mb-2 block">Badges</Label>
              <ChipInput
                value={draft.badges}
                onChange={(v) => set("badges", v)}
                placeholder="e.g. New, Best Seller"
              />
            </div>
            <div>
              <Label className="mb-2 block">Tags</Label>
              <ChipInput
                value={draft.tags}
                onChange={(v) => set("tags", v)}
                placeholder="e.g. repair, hydration"
              />
            </div>
            <div>
              <Label className="mb-2 block">Quick Infos</Label>
              <ChipInput
                value={draft.infos}
                onChange={(v) => set("infos", v)}
                placeholder="e.g. 250ml, Cruelty-free"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 rounded-lg border border-admin-line p-4">
            <label className="flex items-center gap-2.5 text-sm">
              <Switch
                checked={draft.status === "active"}
                onCheckedChange={(v) => set("status", v ? "active" : "inactive")}
              />
              Active
            </label>
            <label className="flex items-center gap-2.5 text-sm">
              <Switch
                checked={draft.featured}
                onCheckedChange={(v) => set("featured", v)}
              />
              Featured
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!draft.name.trim()}>
            {product ? "Save Changes" : "Create Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
