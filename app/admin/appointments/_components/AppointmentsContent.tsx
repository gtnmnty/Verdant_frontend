"use client";

import { useMemo, useState } from "react";
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
import { useAdmin } from "@/lib/admin/store";
import type { Appointment, AppointmentStatus } from "@/lib/admin/types";

export function AppointmentsContent() {
  const { appointments, setAppointments, stylists, services, branches, accounts, uid } =
    useAdmin();
  const { perms, currentStylistId } = useRole();
  const canCreate = perms.caps.createAppointment;
  const router = useRouter();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AppointmentStatus>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);

  const stylistName = useMemo(
    () => stylists.find((s) => s.id === currentStylistId)?.fullName ?? "",
    [stylists, currentStylistId],
  );

  const filtered = useMemo(
    () =>
      appointments.filter((a) => {
        if (!perms.caps.viewAllAppointments && stylistName && a.stylistName !== stylistName) {
          return false;
        }
        if (statusFilter !== "all" && a.status !== statusFilter) return false;
        if (branchFilter !== "all" && a.branchName !== branchFilter) return false;
        if (q && !`${a.customer} ${a.serviceName}`.toLowerCase().includes(q.toLowerCase())) {
          return false;
        }
        return true;
      }),
    [appointments, q, statusFilter, branchFilter, perms.caps.viewAllAppointments, stylistName],
  );

  const openNew = () => {
    setEditing({
      id: "",
      customer: "",
      customerAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=New",
      phone: "",
      email: "",
      address: "",
      serviceType: "in_salon",
      serviceName: services[0]?.name ?? "",
      stylistName: stylists[0]?.fullName ?? "",
      branchName: branches[0]?.name ?? "",
      startsAt: new Date().toISOString().slice(0, 16),
      durationMin: 60,
      guests: 1,
      notes: "",
      status: "upcoming",
    });
    setOpen(true);
  };

  const update = (a: Appointment, status: AppointmentStatus) => {
    setAppointments((prev) => prev.map((x) => (x.id === a.id ? { ...x, status } : x)));
    toast.success("Updated");
  };

  const columns: Column<Appointment>[] = [
    {
      key: "customer",
      header: "Client",
      sortable: true,
      sortValue: (a) => a.customer,
      render: (a) => (
        <div className="flex min-w-0 items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- dicebear/account avatar URLs */}
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
          a.branchName
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
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.name}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {canCreate ? (
              <Button
                size="sm"
                className="rounded-full bg-admin-sidebar text-white"
                onClick={openNew}
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
        emptyTitle="No appointments found"
        emptyDescription="Try a different search, status, or branch filter."
        rowActions={(row) => [
          {
            label: "View details",
            onSelect: (r) => router.push(`/admin/appointments/${r.id}`),
          },
          {
            label: "Edit",
            onSelect: (r) => {
              setEditing({ ...r });
              setOpen(true);
            },
          },
          ...(row.status === "pending"
            ? [{ label: "Approve", onSelect: (r: Appointment) => update(r, "upcoming") }]
            : []),
          { label: "Mark completed", onSelect: (r) => update(r, "completed") },
          { label: "Cancel", destructive: true, onSelect: (r) => update(r, "cancelled") },
        ]}
      />

      <AppointmentFormDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        onEditingChange={setEditing}
        services={services}
        stylists={stylists}
        branches={branches}
        accounts={accounts}
        onSave={(a) => {
          if (a.id) setAppointments((prev) => prev.map((x) => (x.id === a.id ? a : x)));
          else setAppointments((prev) => [{ ...a, id: uid("ap") }, ...prev]);
          toast.success("Saved");
          setOpen(false);
        }}
      />
    </>
  );
}
