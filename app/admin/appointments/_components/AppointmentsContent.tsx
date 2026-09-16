"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/app/admin/_components/DataTable";
import { PageHeader } from "@/app/admin/_components/PageHeader";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppointmentFormDialog } from "@/app/admin/appointments/_components/AppointmentFormDialog";
import { useRole } from "@/lib/admin/role-context";
import { gqlRequest } from "@/utils/graphqlClient";
import {
  SERVICE_TYPE_FROM_BACKEND,
  STATUS_FROM_BACKEND,
  type AdminAppointment,
  type AppointmentStatus,
} from "@/app/admin/appointments/_components/types";

interface BackendAdminAppointmentDto {
  id: string;
  appointmentCode: string;
  user: { id: string; fullName: string; email: string; phone: string | null };
  service: { id: string } | null;
  serviceName: string;
  serviceType: string;
  stylist: { id: string; name: string } | null;
  branch: string | null;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  guests: number;
  homeAddress: { line1: string; city: string } | null;
  notes: string | null;
}

interface AdminAppointmentPage {
  items: BackendAdminAppointmentDto[];
  totalItems: number;
}

const ADMIN_APPOINTMENTS_QUERY = `
    query AdminAppointments($status: AppointmentStatus, $branch: String, $search: String, $sort: AdminAppointmentSort, $page: Int, $pageSize: Int) {
        adminAppointments(status: $status, branch: $branch, search: $search, sort: $sort, page: $page, pageSize: $pageSize) {
            items {
                id
                appointmentCode
                user { id fullName email phone }
                service { id }
                serviceName
                serviceType
                stylist { id name }
                branch
                scheduledAt
                durationMinutes
                status
                guests
                homeAddress { line1 city }
                notes
            }
            totalItems
        }
    }
`;

const COMPLETE_APPOINTMENT_MUTATION = `
    mutation CompleteAppointment($id: ID!) {
        completeAppointment(id: $id) { id status }
    }
`;

const CANCEL_APPOINTMENT_MUTATION = `
    mutation CancelAppointmentAdmin($id: ID!) {
        cancelAppointment(id: $id) { id status }
    }
`;

const FALLBACK_AVATAR = "https://picsum.photos/seed/appointment-admin/100/100";
const STATUS_TO_BACKEND: Record<AppointmentStatus, string> = {
  pending: "PENDING", upcoming: "UPCOMING", completed: "COMPLETED", cancelled: "CANCELLED",
};

function toAdminAppointment(a: BackendAdminAppointmentDto): AdminAppointment {
  return {
    id: a.id,
    appointmentCode: a.appointmentCode,
    userId: a.user.id,
    customer: a.user.fullName,
    customerAvatar: FALLBACK_AVATAR,
    phone: a.user.phone ?? "",
    email: a.user.email,
    address: a.homeAddress ? [a.homeAddress.line1, a.homeAddress.city].filter(Boolean).join(", ") : "",
    serviceType: SERVICE_TYPE_FROM_BACKEND[a.serviceType] ?? "in_salon",
    serviceId: a.service?.id ?? null,
    serviceName: a.serviceName,
    stylistId: a.stylist?.id ?? null,
    stylistName: a.stylist?.name ?? "Unassigned",
    branchName: a.branch ?? "",
    startsAt: a.scheduledAt,
    durationMin: a.durationMinutes,
    guests: a.guests,
    notes: a.notes ?? "",
    status: STATUS_FROM_BACKEND[a.status] ?? "pending",
  };
}

export function AppointmentsContent() {
  const { perms } = useRole();
  const canCreate = perms.caps.createAppointment;
  const router = useRouter();

  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AppointmentStatus>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [branchOptions, setBranchOptions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminAppointment | null>(null);

  const fetchAppointments = () => {
    setLoading(true);
    gqlRequest<{ adminAppointments: AdminAppointmentPage }>(ADMIN_APPOINTMENTS_QUERY, {
      status: statusFilter === "all" ? undefined : STATUS_TO_BACKEND[statusFilter],
      branch: branchFilter === "all" ? undefined : branchFilter,
      search: q.trim() || undefined,
      page: 1,
      pageSize: 100,
    })
      .then((res) => {
        const mapped = res.adminAppointments.items.map(toAdminAppointment);
        setAppointments(mapped);
        setBranchOptions((prev) =>
          Array.from(new Set([...prev, ...mapped.map((a) => a.branchName).filter(Boolean)])).sort(),
        );
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load appointments."))
      .finally(() => setLoading(false));
  };

  useEffect(fetchAppointments, [q, statusFilter, branchFilter]);

  const filtered = useMemo(() => appointments, [appointments]);

  const complete = (a: AdminAppointment) => {
    gqlRequest(COMPLETE_APPOINTMENT_MUTATION, { id: a.id })
      .then(() => { toast.success("Marked completed"); fetchAppointments(); })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to update appointment."));
  };

  const cancel = (a: AdminAppointment) => {
    gqlRequest(CANCEL_APPOINTMENT_MUTATION, { id: a.id })
      .then(() => { toast.success("Cancelled"); fetchAppointments(); })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to cancel appointment."));
  };

  const columns: Column<AdminAppointment>[] = [
    {
      key: "customer",
      header: "Client",
      sortable: true,
      sortValue: (a) => a.customer,
      render: (a) => (
        <div className="flex min-w-0 items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- no real avatar field on AdminAppointmentDto */}
          <img src={a.customerAvatar} alt="" className="size-9 shrink-0 rounded-full" />
          <div className="min-w-0">
            <p className="truncate font-medium">{a.customer}</p>
            <p className="truncate text-xs text-admin-muted">{a.serviceName}</p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (a) => (
        <span className="text-xs capitalize">{a.serviceType.replace("_", " ")}</span>
      ),
    },
    { key: "stylist", header: "Stylist", render: (a) => a.stylistName },
    {
      key: "where",
      header: "Where",
      render: (a) =>
        a.serviceType === "home_service" ? (
          <span className="text-xs">{a.address || "—"}</span>
        ) : (
          a.branchName || "—"
        ),
    },
    {
      key: "when",
      header: "When",
      sortable: true,
      sortValue: (a) => a.startsAt,
      render: (a) => <span className="text-sm">{new Date(a.startsAt).toLocaleString()}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (a) => <StatusBadge status={a.status} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Appointments"
        actions={
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-admin-muted" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search"
                className="h-9 w-48 rounded-full border-admin-line bg-admin-surface pl-9 sm:w-64"
              />
            </div>
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="h-9 w-44 rounded-full border-admin-line bg-admin-surface">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All branches</SelectItem>
                {branchOptions.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {canCreate ? (
              <Button
                size="sm"
                className="rounded-full bg-admin-sidebar text-white"
                onClick={() => { setEditing(null); setOpen(true); }}
              >
                <Plus className="size-4" /> New Appointment
              </Button>
            ) : null}
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "pending", "upcoming", "completed", "cancelled"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setStatusFilter(k as typeof statusFilter)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium capitalize ${
              statusFilter === k
                ? "border-admin-sidebar bg-admin-sidebar text-white"
                : "border-admin-line bg-admin-surface text-admin-muted hover:text-admin-ink"
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      <DataTable
        rows={filtered}
        columns={columns}
        emptyTitle={loading ? "Loading…" : "No appointments found"}
        emptyDescription={loading ? "Fetching appointments from the server." : "Try a different search, status, or branch filter."}
        rowActions={() => [
          {
            label: "View details",
            onSelect: (r: AdminAppointment) => router.push(`/admin/appointments/${r.id}`),
          },
          {
            label: "Edit",
            onSelect: (r: AdminAppointment) => { setEditing(r); setOpen(true); },
          },
          // "Approve" (pending -> upcoming) was dropped: the backend has no
          // status-only mutation and no dedicated approve endpoint — only
          // completeAppointment/cancelAppointment/rescheduleAppointment/
          // updateAppointmentRequest exist, none of which can flip a
          // PENDING appointment to UPCOMING directly.
          { label: "Mark completed", onSelect: (r: AdminAppointment) => complete(r) },
          { label: "Cancel", destructive: true, onSelect: (r: AdminAppointment) => cancel(r) },
        ]}
      />

      <AppointmentFormDialog
        open={open}
        onOpenChange={setOpen}
        appointment={editing}
        onSaved={fetchAppointments}
      />
    </>
  );
}
