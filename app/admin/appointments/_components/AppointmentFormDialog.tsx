"use client";

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
import { toast } from "sonner";
import type {
  Account,
  Appointment,
  Branch,
  Service,
  ServiceType,
  Stylist,
} from "@/lib/admin/types";

export function AppointmentFormDialog({
  open,
  onOpenChange,
  editing,
  onEditingChange,
  services,
  stylists,
  branches,
  accounts,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Appointment | null;
  onEditingChange: (a: Appointment) => void;
  services: Service[];
  stylists: Stylist[];
  branches: Branch[];
  accounts: Account[];
  onSave: (a: Appointment) => void;
}) {
  const pickCustomer = (name: string) => {
    if (!editing) return;
    const acc = accounts.find((a) => a.name === name);
    onEditingChange({
      ...editing,
      customer: name,
      customerAvatar:
        acc?.avatar ?? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || "X")}`,
      phone: acc?.phone ?? editing.phone,
      email: acc?.email ?? editing.email,
      address: acc?.address ?? editing.address,
    });
  };

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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {editing?.id ? "Edit appointment" : "New appointment"}
          </DialogTitle>
        </DialogHeader>

        {editing ? (
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Service Type</Label>
              <div className="mt-1 flex gap-2">
                {(["in_salon", "home_service"] as ServiceType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onEditingChange({ ...editing, serviceType: t })}
                    className={`rounded-full border px-4 py-1.5 text-xs font-medium capitalize ${
                      editing.serviceType === t
                        ? "border-admin-sidebar bg-admin-sidebar text-white"
                        : "border-admin-line text-admin-muted hover:text-admin-ink"
                    }`}
                  >
                    {t.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <Label>Customer</Label>
              <Input
                list="ap-customers"
                value={editing.customer}
                onChange={(e) => pickCustomer(e.target.value)}
              />
              <datalist id="ap-customers">
                {accounts.map((a) => (
                  <option key={a.id} value={a.name} />
                ))}
              </datalist>
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

            {editing.serviceType === "home_service" ? (
              <div className="sm:col-span-2">
                <Label>Complete Address</Label>
                <Input
                  value={editing.address}
                  onChange={(e) => onEditingChange({ ...editing, address: e.target.value })}
                />
              </div>
            ) : (
              <div className="sm:col-span-2">
                <Label>Branch</Label>
                <Select
                  value={editing.branchName}
                  onValueChange={(v) => onEditingChange({ ...editing, branchName: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.name}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="sm:col-span-2">
              <Label>Date & time</Label>
              <Input
                type="datetime-local"
                value={editing.startsAt.slice(0, 16)}
                onChange={(e) => onEditingChange({ ...editing, startsAt: e.target.value })}
              />
            </div>

            <div>
              <Label>Service</Label>
              <Select
                value={editing.serviceName}
                onValueChange={(v) => onEditingChange({ ...editing, serviceName: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Stylist</Label>
              <Select
                value={editing.stylistName}
                onValueChange={(v) => onEditingChange({ ...editing, stylistName: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stylists.map((s) => (
                    <SelectItem key={s.id} value={s.fullName}>
                      {s.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Guests</Label>
              <Input
                type="number"
                min={1}
                value={editing.guests}
                onChange={(e) =>
                  onEditingChange({ ...editing, guests: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label>Duration (min)</Label>
              <Input
                type="number"
                value={editing.durationMin}
                onChange={(e) =>
                  onEditingChange({ ...editing, durationMin: Number(e.target.value) })
                }
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Notes</Label>
              <Textarea
                rows={3}
                value={editing.notes}
                onChange={(e) => onEditingChange({ ...editing, notes: e.target.value })}
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
