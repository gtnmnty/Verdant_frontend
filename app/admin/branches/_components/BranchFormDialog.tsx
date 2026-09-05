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
import { ImageUploader } from "@/app/admin/_components/ImageUploader";
import type { Branch } from "@/lib/admin/types";

export const EMPTY_BRANCH: Branch = {
  id: "",
  name: "",
  address: "",
  phone: "",
  email: "",
  operatingHours: "",
  mapsUrl: "",
  image: "",
  status: "active",
  createdAt: new Date().toISOString().slice(0, 10),
};

export function BranchFormDialog({
  open,
  onOpenChange,
  editing,
  onEditingChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Branch | null;
  onEditingChange: (b: Branch) => void;
  onSave: (b: Branch) => void;
}) {
  const save = () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      toast.error("Name required");
      return;
    }
    onSave(editing);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {editing?.id ? "Edit" : "New"} branch
          </DialogTitle>
        </DialogHeader>

        {editing ? (
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Branch name</Label>
              <Input
                value={editing.name}
                onChange={(e) => onEditingChange({ ...editing, name: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Address</Label>
              <Input
                value={editing.address}
                onChange={(e) => onEditingChange({ ...editing, address: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={editing.phone}
                onChange={(e) => onEditingChange({ ...editing, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={editing.email}
                onChange={(e) => onEditingChange({ ...editing, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Operating hours</Label>
              <Input
                value={editing.operatingHours}
                onChange={(e) =>
                  onEditingChange({ ...editing, operatingHours: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Google Maps URL</Label>
              <Input
                value={editing.mapsUrl}
                onChange={(e) => onEditingChange({ ...editing, mapsUrl: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Branch image</Label>
              <ImageUploader
                images={editing.image ? [editing.image] : []}
                onChange={(next) => onEditingChange({ ...editing, image: next[0] ?? "" })}
                max={1}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Status</Label>
              <Select
                value={editing.status}
                onValueChange={(v: "active" | "inactive") =>
                  onEditingChange({ ...editing, status: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
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
