"use client";

import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Product, Review, Service } from "@/lib/admin/types";

export const EMPTY_REVIEW: Review = {
  id: "",
  customer: "",
  customerAvatar: "",
  rating: 5,
  content: "",
  itemType: "service",
  itemId: "",
  itemName: "",
  serviceName: "",
  featured: false,
  approval: "approved",
  reviewDate: new Date().toISOString().slice(0, 10),
  createdAt: new Date().toISOString().slice(0, 10),
};

export function ReviewFormDialog({
  open,
  onOpenChange,
  editing,
  onEditingChange,
  products,
  services,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Review | null;
  onEditingChange: (r: Review) => void;
  products: Product[];
  services: Service[];
  onSave: (r: Review) => void;
}) {
  const save = () => {
    if (!editing) return;
    if (!editing.customer.trim()) {
      toast.error("Customer required");
      return;
    }
    onSave(editing);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {editing?.id ? "Edit" : "New"} review
          </DialogTitle>
        </DialogHeader>

        {editing ? (
          <div className="grid gap-4 py-2">
            <div>
              <Label>Customer</Label>
              <Input
                value={editing.customer}
                onChange={(e) => onEditingChange({ ...editing, customer: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Item Type</Label>
                <Select
                  value={editing.itemType}
                  onValueChange={(v: string) =>
                    onEditingChange({
                      ...editing,
                      itemType: v as Review["itemType"],
                      itemId: "",
                      itemName: "",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Item</Label>
                <Select
                  value={editing.itemId}
                  onValueChange={(v) => {
                    const item =
                      editing.itemType === "product"
                        ? products.find((p) => p.id === v)
                        : services.find((s) => s.id === v);
                    onEditingChange({
                      ...editing,
                      itemId: v,
                      itemName: item?.name ?? "",
                      serviceName: item?.name ?? "",
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    {(editing.itemType === "product" ? products : services).map((it) => (
                      <SelectItem key={it.id} value={it.id}>
                        {it.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Rating</Label>
              <Select
                value={String(editing.rating)}
                onValueChange={(v) => onEditingChange({ ...editing, rating: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} star{n > 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Review date</Label>
              <Input
                type="date"
                value={editing.reviewDate}
                onChange={(e) => onEditingChange({ ...editing, reviewDate: e.target.value })}
              />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                rows={4}
                value={editing.content}
                onChange={(e) => onEditingChange({ ...editing, content: e.target.value })}
              />
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="bg-admin-sidebar text-white" onClick={save}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
