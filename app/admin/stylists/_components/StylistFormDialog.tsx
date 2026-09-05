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
import { ChipInput } from "@/app/admin/_components/ChipInput";
import { ImageUploader } from "@/app/admin/_components/ImageUploader";
import { useAdmin } from "@/lib/admin/store";
import type { Stylist } from "@/lib/admin/types";

type Draft = Omit<Stylist, "id" | "createdAt">;

const EMPTY: Draft = {
  fullName: "",
  photo: "",
  bio: "",
  specialties: [],
  branchId: "",
  workingHours: "",
  serviceIds: [],
  status: "active",
  email: "",
  phone: "",
};

export function StylistFormDialog({
  open,
  onOpenChange,
  stylist,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stylist: Stylist | null;
}) {
  const { branches, services, setStylists, pushActivity, uid } = useAdmin();
  const [draft, setDraft] = useState<Draft>(EMPTY);

  useEffect(() => {
    if (open) setDraft(stylist ? { ...stylist } : { ...EMPTY, branchId: branches[0]?.id ?? "" });
  }, [open, stylist, branches]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const toggleService = (id: string) =>
    set(
      "serviceIds",
      draft.serviceIds.includes(id)
        ? draft.serviceIds.filter((s) => s !== id)
        : [...draft.serviceIds, id],
    );

  const handleSave = () => {
    if (!draft.fullName.trim()) {
      toast.error("Name is required");
      return;
    }

    if (stylist) {
      setStylists((prev) => prev.map((s) => (s.id === stylist.id ? { ...s, ...draft } : s)));
      pushActivity({ kind: "shift", title: "Stylist Updated", body: draft.fullName });
    } else {
      const id = uid("s");
      setStylists((prev) => [
        { ...draft, id, createdAt: new Date().toISOString().slice(0, 10) },
        ...prev,
      ]);
      pushActivity({ kind: "shift", title: "Stylist Added", body: draft.fullName });
    }
    toast.success("Saved");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{stylist ? "Edit Stylist" : "New Stylist"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div>
            <Label>Profile Photo</Label>
            <div className="mt-1.5">
              <ImageUploader
                images={draft.photo ? [draft.photo] : []}
                onChange={(imgs) => set("photo", imgs[0] ?? "")}
                max={1}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="st-name">Full Name</Label>
              <Input id="st-name" value={draft.fullName} onChange={(e) => set("fullName", e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="st-email">Email</Label>
              <Input id="st-email" value={draft.email} onChange={(e) => set("email", e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="st-phone">Phone</Label>
              <Input id="st-phone" value={draft.phone} onChange={(e) => set("phone", e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="st-hours">Working Hours</Label>
              <Input id="st-hours" value={draft.workingHours} onChange={(e) => set("workingHours", e.target.value)} placeholder="Tue–Sat 10–19" className="mt-1.5" />
            </div>
          </div>

          <div>
            <Label htmlFor="st-bio">Bio</Label>
            <Textarea id="st-bio" rows={3} value={draft.bio} onChange={(e) => set("bio", e.target.value)} className="mt-1.5" />
          </div>

          <div>
            <Label className="mb-2 block">Specialties</Label>
            <ChipInput value={draft.specialties} onChange={(v) => set("specialties", v)} placeholder="Balayage…" />
          </div>

          <div>
            <Label>Branch</Label>
            <Select value={draft.branchId} onValueChange={(v) => set("branchId", v)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Offered Services</Label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {services.map((sv) => {
                const on = draft.serviceIds.includes(sv.id);
                return (
                  <button
                    key={sv.id}
                    type="button"
                    onClick={() => toggleService(sv.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      on
                        ? "border-admin-sidebar bg-admin-sidebar text-white"
                        : "border-admin-line text-admin-muted hover:text-admin-ink"
                    }`}
                  >
                    {sv.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label>Status</Label>
            <Select value={draft.status} onValueChange={(v) => set("status", v as Stylist["status"])}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!draft.fullName.trim()}>
            {stylist ? "Save Changes" : "Add Stylist"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
