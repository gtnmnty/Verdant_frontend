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
import { showSaveError } from "@/lib/admin/save-error";
import { isConcurrentModification } from "@/utils/graphqlClient";
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

// <input type="datetime-local"> works in the browser's local time, but the backend stores/returns UTC instants.
// Slicing the ISO string put UTC digits into the field, so every edit + save moved the time by the UTC offset.
function toLocalInput(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Select value meaning "no stylist yet" (the appointment stays unassigned / pending).
const NO_STYLIST = "none";

type Errors = Partial<Record<"customer" | "service" | "branch" | "address" | "startsAt" | "form", string>>;

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs text-admin-rose">{message}</p> : null;
}

// Typeable and selectable: typing filters the customer list, clicking a row picks that customer.
// Typing again after a pick clears it, so a free-typed name can never be saved as a real customer.
function CustomerCombobox({
  customers,
  value,
  selectedId,
  invalid,
  onType,
  onPick,
}: {
  customers: CustomerOption[];
  value: string;
  selectedId: string;
  invalid: boolean;
  onType: (text: string) => void;
  onPick: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const needle = value.trim().toLowerCase();
  const matches = (needle && !selectedId
    ? customers.filter((c) =>
        [c.fullName, c.email, c.phone ?? ""].some((f) => f.toLowerCase().includes(needle)))
    : customers
  ).slice(0, 50);

  return (
    <div className="relative">
      <Input
        value={value}
        placeholder="Type a name, email or phone — or pick from the list"
        aria-invalid={invalid}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onChange={(e) => {
          onType(e.target.value);
          setOpen(true);
        }}
      />
      {open ? (
        <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-admin-line bg-admin-surface p-1 shadow-md">
          {matches.length === 0 ? (
            <li className="px-3 py-2 text-xs text-admin-muted">No matching customers.</li>
          ) : (
            matches.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onPick(c.id);
                    setOpen(false);
                  }}
                  className="flex w-full flex-col rounded px-3 py-1.5 text-left text-sm hover:bg-admin-cream"
                >
                  <span className="font-medium">{c.fullName}</span>
                  <span className="text-xs text-admin-muted">{c.email}{c.phone ? ` · ${c.phone}` : ""}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}

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
  startsAt: toLocalInput(new Date()),
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
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
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
            startsAt: toLocalInput(appointment.startsAt),
            guests: appointment.guests,
            notes: appointment.notes,
          });
        } else {
          setDraft({
            ...EMPTY,
            serviceId: res.adminServices.items[0]?.id ?? "",
            stylistId: "",
            branchId: res.adminBranches.items[0]?.id ?? "",
          });
        }
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load form options."));
  }, [open, appointment]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, form: undefined }));
  };

  const typeCustomer = (text: string) => {
    setDraft((d) => ({ ...d, customerName: text, userId: "", phone: "", email: "" }));
    setErrors((e) => ({ ...e, customer: undefined, form: undefined }));
  };

  const pickCustomer = (id: string) => {
    const c = customers.find((a) => a.id === id);
    setDraft((d) => ({
      ...d,
      userId: id,
      customerName: c?.fullName ?? d.customerName,
      phone: c?.phone ?? d.phone,
      email: c?.email ?? d.email,
    }));
    setErrors((e) => ({ ...e, customer: undefined, form: undefined }));
  };

  const selectedService = services.find((s) => s.id === draft.serviceId);

  const save = () => {
    // Missing input is shown next to the field, not as a popup.
    const found: Errors = {};
    if (!draft.userId) {
      found.customer = draft.customerName.trim()
        ? "No customer with that name — pick one from the list."
        : "Please choose a customer.";
    }
    if (!draft.serviceId) found.service = "Please choose a service.";
    if (draft.serviceType === "in_salon" && !draft.branchId) found.branch = "Please choose a branch.";
    if (draft.serviceType === "home_service" && !draft.address.trim()) found.address = "Please enter the address.";
    if (!draft.startsAt) found.startsAt = "Please choose a date and time.";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const scheduledAt = new Date(draft.startsAt).toISOString();
    const shared = {
      userId: draft.userId,
      serviceId: draft.serviceId,
      stylistId: draft.stylistId || undefined, // optional; assigning one to a pending appointment approves it
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
      .catch((err) => {
        // Failures stay inline; a concurrent edit keeps its toast because that one carries the "Reload" action.
        if (isConcurrentModification(err)) {
          showSaveError(err, "Failed to save appointment.", () => {
            onOpenChange(false);
            onSaved();
          });
          return;
        }
        setErrors({ form: err instanceof Error ? err.message : "Failed to save appointment." });
      })
      .finally(() => setSaving(false));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-6 overflow-y-auto p-6 sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {appointment ? "Edit appointment" : "New appointment"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-5 sm:grid-cols-2 [&_label]:mb-1.5 [&_label]:block">
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
            <CustomerCombobox
              customers={customers}
              value={draft.customerName}
              selectedId={draft.userId}
              invalid={!!errors.customer}
              onType={typeCustomer}
              onPick={pickCustomer}
            />
            <FieldError message={errors.customer} />
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
              <Input value={draft.address} aria-invalid={!!errors.address} onChange={(e) => set("address", e.target.value)} />
              <FieldError message={errors.address} />
            </div>
          ) : (
            <div className="sm:col-span-2">
              <Label>Branch</Label>
              <Select value={draft.branchId} onValueChange={(v) => set("branchId", v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.branch} />
            </div>
          )}

          <div className="sm:col-span-2">
            <Label>Date & time</Label>
            <Input
              type="datetime-local"
              value={draft.startsAt}
              aria-invalid={!!errors.startsAt}
              onChange={(e) => set("startsAt", e.target.value)}
            />
            <FieldError message={errors.startsAt} />
          </div>

          <div>
            <Label>Service</Label>
            <Select value={draft.serviceId} onValueChange={(v) => set("serviceId", v)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={errors.service} />
          </div>
          <div>
            <Label>Stylist (optional)</Label>
            <Select
              value={draft.stylistId || NO_STYLIST}
              onValueChange={(v) => set("stylistId", v === NO_STYLIST ? "" : v)}
            >
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_STYLIST}>Unassigned</SelectItem>
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

        {errors.form ? (
          <p role="alert" className="rounded-lg border border-admin-rose/40 bg-admin-rose/10 px-3 py-2 text-sm text-admin-rose">
            {errors.form}
          </p>
        ) : null}

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
