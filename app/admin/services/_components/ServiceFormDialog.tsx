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
import type { Service } from "@/lib/admin/types";

const CATEGORIES = ["Color", "Cut", "Treatment", "Styling"];

type Draft = Omit<Service, "id" | "createdAt" | "updatedAt">;

const EMPTY: Draft = {
  name: "",
  subName: "",
  description: "",
  info: "",
  category: "Color",
  duration: 60,
  price: 0,
  stylistIds: [],
  image: "",
  active: true,
  homeService: false,
  featured: false,
  badges: [],
  tags: [],
  infos: [],
};

export function ServiceFormDialog({
  open,
  onOpenChange,
  service,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
}) {
  const { stylists, setServices, pushActivity, uid } = useAdmin();
  const [draft, setDraft] = useState<Draft>(EMPTY);

  useEffect(() => {
    if (open) setDraft(service ? { ...service } : EMPTY);
  }, [open, service]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const toggleStylist = (id: string) => {
    set(
      "stylistIds",
      draft.stylistIds.includes(id)
        ? draft.stylistIds.filter((s) => s !== id)
        : [...draft.stylistIds, id],
    );
  };

  const handleSave = () => {
    if (!draft.name.trim()) return;
    const now = new Date().toISOString();

    if (service) {
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, ...draft, updatedAt: now } : s)),
      );
      pushActivity({ kind: "shift", title: "Service Updated", body: draft.name });
    } else {
      const id = uid("sv");
      setServices((prev) => [
        { ...draft, id, createdAt: now, updatedAt: now },
        ...prev,
      ]);
      pushActivity({ kind: "shift", title: "Service Created", body: draft.name });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{service ? "Edit Service" : "New Service"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div>
            <Label>Cover Image</Label>
            <div className="mt-1.5">
              <ImageUploader
                images={draft.image ? [draft.image] : []}
                onChange={(imgs) => set("image", imgs[0] ?? "")}
                max={1}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="sv-name">Name</Label>
              <Input id="sv-name" value={draft.name} onChange={(e) => set("name", e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="sv-subname">Tagline</Label>
              <Input id="sv-subname" value={draft.subName} onChange={(e) => set("subName", e.target.value)} className="mt-1.5" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Category</Label>
              <Select value={draft.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sv-duration">Duration (min)</Label>
              <Input
                id="sv-duration"
                type="number"
                value={draft.duration}
                onChange={(e) => set("duration", Number(e.target.value))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="sv-price">Price ($)</Label>
              <Input
                id="sv-price"
                type="number"
                value={draft.price}
                onChange={(e) => set("price", Number(e.target.value))}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="sv-desc">Description</Label>
            <Textarea id="sv-desc" rows={2} value={draft.description} onChange={(e) => set("description", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="sv-info">Long-form Info</Label>
            <Textarea id="sv-info" rows={3} value={draft.info} onChange={(e) => set("info", e.target.value)} className="mt-1.5" />
          </div>

          <div>
            <Label>Assigned Stylists</Label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {stylists.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleStylist(s.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    draft.stylistIds.includes(s.id)
                      ? "border-admin-sidebar bg-admin-sidebar text-white"
                      : "border-admin-line text-admin-muted hover:text-admin-ink"
                  }`}
                >
                  {s.fullName}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label className="mb-2 block">Badges</Label>
              <ChipInput value={draft.badges} onChange={(v) => set("badges", v)} placeholder="Signature…" />
            </div>
            <div>
              <Label className="mb-2 block">Tags</Label>
              <ChipInput value={draft.tags} onChange={(v) => set("tags", v)} placeholder="color…" />
            </div>
            <div>
              <Label className="mb-2 block">Quick Infos</Label>
              <ChipInput value={draft.infos} onChange={(v) => set("infos", v)} placeholder="Includes gloss…" />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 rounded-lg border border-admin-line p-4">
            <label className="flex items-center gap-2.5 text-sm">
              <Switch checked={draft.active} onCheckedChange={(v) => set("active", v)} />
              Active
            </label>
            <label className="flex items-center gap-2.5 text-sm">
              <Switch checked={draft.homeService} onCheckedChange={(v) => set("homeService", v)} />
              Home Service Available
            </label>
            <label className="flex items-center gap-2.5 text-sm">
              <Switch checked={draft.featured} onCheckedChange={(v) => set("featured", v)} />
              Featured
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!draft.name.trim()}>
            {service ? "Save Changes" : "Create Service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
