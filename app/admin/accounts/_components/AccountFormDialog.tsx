"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { Account } from "@/lib/admin/types";

const PERMISSIONS = [
  "dashboard",
  "products",
  "services",
  "stylists",
  "appointments",
  "reports",
  "clients",
  "settings",
];

export const EMPTY_ACCOUNT: Account = {
  id: "",
  name: "",
  email: "",
  phone: "",
  address: "",
  avatar: "",
  role: "stylist",
  status: "active",
  permissions: [],
  createdAt: new Date().toISOString().slice(0, 10),
};

export function AccountFormDialog({
  open,
  onOpenChange,
  editing,
  onEditingChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Account | null;
  onEditingChange: (a: Account) => void;
  onSave: (a: Account) => void;
}) {
  const save = () => {
    if (!editing) return;
    if (!editing.name.trim() || !editing.email.includes("@")) {
      toast.error("Valid name & email required");
      return;
    }
    onSave(editing);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {editing?.id ? "Edit" : "New"} account
          </DialogTitle>
        </DialogHeader>

        {editing ? (
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Avatar</Label>
              <ImageUploader
                images={editing.avatar ? [editing.avatar] : []}
                onChange={(next) => onEditingChange({ ...editing, avatar: next[0] ?? "" })}
                max={1}
              />
            </div>
            <div>
              <Label>Name</Label>
              <Input
                value={editing.name}
                onChange={(e) => onEditingChange({ ...editing, name: e.target.value })}
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
              <Label>Phone number</Label>
              <Input
                value={editing.phone}
                onChange={(e) => onEditingChange({ ...editing, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={editing.address}
                onChange={(e) => onEditingChange({ ...editing, address: e.target.value })}
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select
                value={editing.role}
                onValueChange={(v: Account["role"]) => onEditingChange({ ...editing, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="stylist">Stylist</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={editing.status}
                onValueChange={(v: Account["status"]) =>
                  onEditingChange({ ...editing, status: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Permissions</Label>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {PERMISSIONS.map((perm) => (
                  <label
                    key={perm}
                    className="flex items-center gap-2 rounded-md border border-admin-line p-2 text-sm"
                  >
                    <Checkbox
                      checked={editing.permissions.includes(perm)}
                      onCheckedChange={(checked) => {
                        const on = Boolean(checked);
                        onEditingChange({
                          ...editing,
                          permissions: on
                            ? [...editing.permissions, perm]
                            : editing.permissions.filter((p) => p !== perm),
                        });
                      }}
                    />
                    <span className="capitalize">{perm}</span>
                  </label>
                ))}
              </div>
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
