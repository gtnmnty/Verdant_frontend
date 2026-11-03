"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, Plus, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/app/admin/_components/DataTable";
import { PageHeader } from "@/app/admin/_components/PageHeader";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { ConfirmDialog } from "@/app/admin/_components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
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
  user: { id: string; fullName: string; email: string; phone: string | null; avatarUrl: string | null };
  service: { id: string } | null;
  serviceName: string;
  serviceType: string;
  stylist: { id: string; name: string } | null;
  branch: { name: string } | null;
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
                user { id fullName email phone avatarUrl }
                service { id }
                serviceName
                serviceType
                stylist { id name }
                branch { name }
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

const BRANCH_OPTIONS_QUERY = `
    query AppointmentBranchFilter {
        adminBranches(pageSize: 100) {
            items { id name }
        }
    }
`;

const APPROVE_APPOINTMENT_MUTATION = `
    mutation ApproveAppointment($id: ID!) {
        approveAppointment(id: $id) { id status }
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

const DELETE_APPOINTMENTS_MUTATION = `
    mutation DeleteAppointments($ids: [ID!]!) {
        deleteAppointments(ids: $ids) { id }
    }
`;

const STATUS_TO_BACKEND: Record<AppointmentStatus, string> = {
  pending: "PENDING", upcoming: "UPCOMING", completed: "COMPLETED", cancelled: "CANCELLED",
};

export function toAdminAppointment(a: BackendAdminAppointmentDto): AdminAppointment {
  return {
    id: a.id,
    appointmentCode: a.appointmentCode,
    userId: a.user.id,
    customer: a.user.fullName,
    customerAvatar: a.user.avatarUrl ?? "",
    phone: a.user.phone ?? "",
    email: a.user.email,
    address: a.homeAddress ? [a.homeAddress.line1, a.homeAddress.city].filter(Boolean).join(", ") : "",
    serviceType: SERVICE_TYPE_FROM_BACKEND[a.serviceType] ?? "in_salon",
    serviceId: a.service?.id ?? null,
    serviceName: a.serviceName,
    stylistId: a.stylist?.id ?? null,
    stylistName: a.stylist?.name ?? "Unassigned",
    branchName: a.branch?.name ?? "",
    startsAt: a.scheduledAt,
    durationMin: a.durationMinutes,
    guests: a.guests,
    notes: a.notes ?? "",
    status: STATUS_FROM_BACKEND[a.status] ?? "pending",
  };
}

export function CustomerAvatar({ name, src, className = "size-9" }: { name: string; src: string; className?: string }) {
  return (
    <div className={`${className} shrink-0 overflow-hidden rounded-full`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded avatar URLs
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <ImagePlaceholder name={name} kind="stylist" compact />
      )}
    </div>
  );
}

export function AppointmentsContent() {
  const { perms, role } = useRole();
  const canCreate = perms.caps.createAppointment;
  // A stylist only sees their own appointments, read-only (no detail page, approvals or deletes).
  const readOnly = role === "stylist";
  const router = useRouter();

  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AppointmentStatus>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [sort, setSort] = useState<"NEWEST" | "SCHEDULED_SOONEST" | "SCHEDULED_LATEST">("NEWEST");
  const [branchOptions, setBranchOptions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminAppointment | null>(null);
  const [deletingIds, setDeletingIds] = useState<string[] | null>(null);

  // Replies can arrive out of order (typing "22" sends "2" then "22"); only the latest request may update the list.
  const requestId = useRef(0);

  const fetchAppointments = () => {
    const id = ++requestId.current;
    setLoading(true);
    gqlRequest<{ adminAppointments: AdminAppointmentPage }>(ADMIN_APPOINTMENTS_QUERY, {
      status: statusFilter === "all" ? undefined : STATUS_TO_BACKEND[statusFilter],
      branch: branchFilter === "all" ? undefined : branchFilter,
      search: q.trim() || undefined,
      sort,
      page: 1,
      pageSize: 100,
    })
      .then((res) => {
        if (id === requestId.current) setAppointments(res.adminAppointments.items.map(toAdminAppointment));
      })
      .catch((err) => {
        if (id === requestId.current) toast.error(err instanceof Error ? err.message : "Failed to load appointments.");
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
  };

  // Typing is debounced so a search doesn't fire a request per keystroke; other filters apply immediately.
  useEffect(() => {
    const t = setTimeout(fetchAppointments, q ? 300 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchAppointments reads the same state listed here
  }, [q, statusFilter, branchFilter, sort]);

  // Live branch list for the filter (not derived from the loaded rows, so it never shrinks to the current pick).
  useEffect(() => {
    gqlRequest<{ adminBranches: { items: { id: string; name: string }[] } }>(BRANCH_OPTIONS_QUERY)
      .then((res) => setBranchOptions(res.adminBranches.items.map((b) => b.name)))
      .catch(() => { /* filter is supplementary — fail quietly */ });
  }, []);

  const approve = (a: AdminAppointment) => {
    gqlRequest(APPROVE_APPOINTMENT_MUTATION, { id: a.id })
      .then(() => { toast.success("Appointment approved"); fetchAppointments(); })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to approve appointment."));
  };

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

  const confirmBulkDelete = () => {
    if (!deletingIds) return;
    gqlRequest(DELETE_APPOINTMENTS_MUTATION, { ids: deletingIds })
      .then(() => {
        toast.success(`Deleted ${deletingIds.length} appointments`);
        setDeletingIds(null);
        fetchAppointments();
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to delete appointments."));
  };

  const columns: Column<AdminAppointment>[] = [
    {
      key: "customer",
      header: "Client",
      sortable: true,
      sortValue: (a) => a.customer,
      render: (a) => (
        <div className="flex min-w-0 items-center gap-3">
          <CustomerAvatar name={a.customer} src={a.customerAvatar} />
          <div className="min-w-0">
            <p className="truncate font-medium">{a.customer}</p>
            <p className="truncate font-mono text-xs text-admin-muted">{a.appointmentCode}</p>
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
    <div>
      <PageHeader title="Appointments" description="Review, approve and manage salon bookings." />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-50 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-admin-muted" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search appointments…"
            className="border-admin-line bg-admin-surface pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | AppointmentStatus)}>
          <SelectTrigger className="w-40 border-admin-line bg-admin-surface">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {(["pending", "upcoming", "completed", "cancelled"] as const).map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={branchFilter} onValueChange={setBranchFilter}>
          <SelectTrigger className="w-44 border-admin-line bg-admin-surface">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {branchOptions.map((b) => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger className="w-48 border-admin-line bg-admin-surface">
            <ArrowUpDown className="size-4 text-admin-muted" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NEWEST">Recently added</SelectItem>
            <SelectItem value="SCHEDULED_SOONEST">Date: Earliest first</SelectItem>
            <SelectItem value="SCHEDULED_LATEST">Date: Latest first</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={fetchAppointments} className="border-admin-line">
          <RefreshCw className="size-4" />
        </Button>
        {canCreate ? (
          <Button onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="mr-1.5 size-4" /> New Appointment
          </Button>
        ) : null}
      </div>

      <DataTable
        rows={appointments}
        columns={columns}
        emptyTitle={loading ? "Loading…" : "No appointments found"}
        emptyDescription={loading ? "Fetching appointments from the server." : "Try a different search, status, or branch filter."}
        selectable={!readOnly}
        bulkActions={readOnly ? undefined : (ids, clear) => (
          <Button
            size="sm"
            variant="ghost"
            className="text-admin-rose"
            onClick={() => {
              setDeletingIds(ids);
              clear();
            }}
          >
            Delete selected
          </Button>
        )}
        rowActions={readOnly ? undefined : (a) => [
          {
            label: "View details",
            onSelect: (r: AdminAppointment) => router.push(`/admin/appointments/${r.id}`),
          },
          {
            label: "Edit",
            onSelect: (r: AdminAppointment) => { setEditing(r); setOpen(true); },
          },
          ...(a.status === "pending"
            ? [{ label: "Approve", onSelect: (r: AdminAppointment) => approve(r) }]
            : []),
          ...(a.status === "pending" || a.status === "upcoming"
            ? [{ label: "Mark completed", onSelect: (r: AdminAppointment) => complete(r) }]
            : []),
          ...(a.status === "pending" || a.status === "upcoming"
            ? [{ label: "Cancel", destructive: true, onSelect: (r: AdminAppointment) => cancel(r) }]
            : []),
        ]}
      />

      <AppointmentFormDialog
        open={open}
        onOpenChange={setOpen}
        appointment={editing}
        onSaved={fetchAppointments}
      />
      <ConfirmDialog
        open={!!deletingIds}
        onOpenChange={(o) => !o && setDeletingIds(null)}
        title={`Delete ${deletingIds?.length ?? 0} appointments?`}
        confirmLabel="Delete"
        destructive
        onConfirm={confirmBulkDelete}
      />
    </div>
  );
}
