"use client";

import { useEffect, useState } from "react";
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
import { useAdmin } from "@/lib/admin/store";
import type { PageRecord } from "@/lib/admin/types";

type Draft = Omit<PageRecord, "id" | "updatedAt">;

const EMPTY: Draft = {
  title: "",
  slug: "",
  status: "draft",
  metaTitle: "",
  metaDescription: "",
  content: "",
};

export function PageFormDialog({
  open,
  onOpenChange,
  page,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page: PageRecord | null;
}) {
  const { setPages, uid } = useAdmin();
  const [draft, setDraft] = useState<Draft>(EMPTY);

  useEffect(() => {
    if (open) setDraft(page ? { ...page } : EMPTY);
  }, [open, page]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const handleSave = () => {
    if (!draft.title.trim()) {
      toast.error("Title is required");
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const slug = draft.slug.trim() || draft.title.toLowerCase().replace(/\s+/g, "-");

    if (page) {
      setPages((prev) =>
        prev.map((p) => (p.id === page.id ? { ...p, ...draft, slug, updatedAt: today } : p)),
      );
    } else {
      setPages((prev) => [{ ...draft, slug, id: uid("pg"), updatedAt: today }, ...prev]);
    }
    toast.success("Saved");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {page ? "Edit Page" : "New Page"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div>
            <Label htmlFor="pg-title">Title</Label>
            <Input id="pg-title" value={draft.title} onChange={(e) => set("title", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="pg-slug">Slug</Label>
            <Input
              id="pg-slug"
              value={draft.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="auto-generated from title"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="pg-meta-title">Meta Title</Label>
            <Input id="pg-meta-title" value={draft.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={draft.status} onValueChange={(v) => set("status", v as PageRecord["status"])}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="pg-meta-desc">Meta Description</Label>
            <Textarea id="pg-meta-desc" rows={2} value={draft.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="pg-content">Content</Label>
            <Textarea id="pg-content" rows={8} value={draft.content} onChange={(e) => set("content", e.target.value)} className="mt-1.5" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-admin-sidebar text-white hover:bg-admin-sidebar/90">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
