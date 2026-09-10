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
import { gqlRequest } from "@/utils/graphqlClient";
import {
  SERVICE_TYPE_TO_BACKEND,
  type AdminAppointment,
  type ServiceType,
} from "@/app/admin/appointments/_components/types";

interface CustomerOption { id: string; fullName: string; phone: string | null; email: string }
interface ServiceOption { id: string; name: string; durationInMinutes: number }
interface StylistOption { id: string; name: string }
interface BranchOption { id: string; name: string }

const FORM_OPTIONS_QUERY = `
    query AppointmentFormOptions {
        accounts(filter: { role: CUSTOMER }, page: 1, pageSize: 200) {
            content { id fullName phone email }
        }
        adminServices(pageSize: 100) {
            items { id name durationInMinutes }
        }
        adminStylists(pageSize: 100) {
            items { id name }
        }
        adminBranches(pageSize: 100) {
            items { id name }
        }
    }
`;

const BOOK_APPOINTMENT_MUTATION = `
    mutation AdminBookAppointment($input: CreateAppointmentInput!) {
        bookAppointment(input: $input) { id }
    }
`;

const UPDATE_APPOINTMENT_MUTATION = `
    mutation AdminUpdateAppointmentRequest($id: ID!, $input: UpdateAppointmentInput!) {
        updateAppointmentRequest(id: $id, input: $input) { id }
    }
`;

interface Draft {
  serviceType: ServiceType;
  userId: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  branchId: string;
  serviceId: string;
  stylistId: string;
  startsAt: string; // yyyy-MM-ddTHH:mm
  guests: number;
  notes: string;
}

const EMPTY: Draft = {
  serviceType: "in_salon",
  userId: "",
  customerName: "",
  phone: "",
  email: "",
  address: "",
  branchId: "",
  serviceId: "",
  stylistId: "",
  startsAt: new Date().toISOString().slice(0, 16),
  guests: 1,
  notes: "",
};

export function AppointmentFormDialog({
  open,
  onOpenChange,
  appointment,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: AdminAppointment | null;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [stylists, setStylists] = useState<StylistOption[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    gqlRequest<{
      accounts: { content: CustomerOption[] };
      adminServices: { items: ServiceOption[] };
      adminStylists: { items: StylistOption[] };
      adminBranches: { items: BranchOption[] };
    }>(FORM_OPTIONS_QUERY)
      .then((res) => {
        setCustomers(res.accounts.content);
        setServices(res.adminServices.items);
        setStylists(res.adminStylists.items);
        setBranches(res.adminBranches.items);

        if (appointment) {
          setDraft({
            serviceType: appointment.serviceType,
            userId: appointment.userId,
            customerName: appointment.customer,
            phone: appointment.phone,
            email: appointment.email,
            address: appointment.address,
            // AdminAppointmentDto only returns the branch's name, not id —
            // best-effort match back to a real branch by name.
            branchId: res.adminBranches.items.find((b) => b.name === appointment.branchName)?.id ?? "",
            serviceId: appointment.serviceId ?? res.adminServices.items[0]?.id ?? "",
            stylistId: appointment.stylistId ?? "",
            startsAt: appointment.startsAt.slice(0, 16),
            guests: appointment.guests,
            notes: appointment.notes,
          });
        } else {
          setDraft({
            ...EMPTY,
            serviceId: res.adminServices.items[0]?.id ?? "",
            stylistId: res.adminStylists.items[0]?.id ?? "",
            branchId: res.adminBranches.items[0]?.id ?? "",
          });
        }
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load form options."));
  }, [open, appointment]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const pickCustomer = (id: string) => {
    const c = customers.find((a) => a.id === id);
    setDraft((d) => ({
      ...d,
      userId: id,
      customerName: c?.fullName ?? d.customerName,
      phone: c?.phone ?? d.phone,
      email: c?.email ?? d.email,
    }));
  };

  const selectedService = services.find((s) => s.id === draft.serviceId);

  const save = () => {
    if (!draft.userId) {
      toast.error("Customer required");
      return;
    }
    if (!draft.serviceId || !draft.stylistId) {
      toast.error("Service and stylist are required");
      return;
    }

    const scheduledAt = new Date(draft.startsAt).toISOString();
    const shared = {
      userId: draft.userId,
      serviceId: draft.serviceId,
      stylistId: draft.stylistId,
      serviceType: SERVICE_TYPE_TO_BACKEND[draft.serviceType],
      branchId: draft.serviceType === "in_salon" ? draft.branchId || undefined : undefined,
      scheduledAt,
      guests: draft.guests,
      homeAddress: draft.serviceType === "home_service" && draft.address
        ? { line1: draft.address, city: "", state: "", postal: "", country: "" }
        : undefined,
      notes: draft.notes || undefined,
    };

    setSaving(true);
    const request = appointment
      ? gqlRequest(UPDATE_APPOINTMENT_MUTATION, { id: appointment.id, input: shared })
      : gqlRequest(BOOK_APPOINTMENT_MUTATION, { input: shared });

    request
      .then(() => {
        toast.success("Saved");
        onOpenChange(false);
        onSaved();
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to save appointment."))
      .finally(() => setSaving(false));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {appointment ? "Edit appointment" : "New appointment"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Service Type</Label>
            <div className="mt-1 flex gap-2">
              {(["in_salon", "home_service"] as ServiceType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set("serviceType", t)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium capitalize ${
                    draft.serviceType === t
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
            <Select value={draft.userId} onValueChange={pickCustomer}>
              <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={draft.phone} disabled className="bg-admin-cream" />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={draft.email} disabled className="bg-admin-cream" />
          </div>

          {draft.serviceType === "home_service" ? (
            <div className="sm:col-span-2">
              <Label>Complete Address</Label>
              <Input value={draft.address} onChange={(e) => set("address", e.target.value)} />
            </div>
          ) : (
            <div className="sm:col-span-2">
              <Label>Branch</Label>
              <Select value={draft.branchId} onValueChange={(v) => set("branchId", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="sm:col-span-2">
            <Label>Date & time</Label>
            <Input
              type="datetime-local"
              value={draft.startsAt}
              onChange={(e) => set("startsAt", e.target.value)}
            />
          </div>

          <div>
            <Label>Service</Label>
            <Select value={draft.serviceId} onValueChange={(v) => set("serviceId", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Stylist</Label>
            <Select value={draft.stylistId} onValueChange={(v) => set("stylistId", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {stylists.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Guests</Label>
            <Input
              type="number"
              min={1}
              value={draft.guests}
              onChange={(e) => set("guests", Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Duration</Label>
            {/* Derived from the selected service — durationMinutes isn't a
                field on CreateAppointmentInput/UpdateAppointmentInput, so
                it can't be set independently here. */}
            <Input value={selectedService ? `${selectedService.durationInMinutes} min` : "—"} disabled className="bg-admin-cream" />
          </div>
          <div className="sm:col-span-2">
            <Label>Notes</Label>
            <Textarea rows={3} value={draft.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="bg-admin-sidebar text-white" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
