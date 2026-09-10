"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DetailCard,
  DetailGrid,
  DetailHeader,
  FieldRow,
} from "@/app/admin/_components/Detail";
import { EmptyState } from "@/app/admin/_components/EmptyState";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { gqlRequest } from "@/utils/graphqlClient";
import {
  SERVICE_TYPE_FROM_BACKEND,
  STATUS_FROM_BACKEND,
  type AdminAppointment,
} from "@/app/admin/appointments/_components/types";

interface BackendAdminAppointmentDetail {
  id: string;
  appointmentCode: string;
  user: { id: string; fullName: string; email: string; phone: string | null };
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

const ADMIN_APPOINTMENT_DETAIL_QUERY = `
    query AdminAppointmentDetail($id: ID!) {
        adminAppointment(id: $id) {
            id
            appointmentCode
            user { id fullName email phone }
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
    }
`;

const COMPLETE_APPOINTMENT_MUTATION = `
    mutation CompleteAppointmentDetail($id: ID!) {
        completeAppointment(id: $id) { id status }
    }
`;

const CANCEL_APPOINTMENT_MUTATION = `
    mutation CancelAppointmentDetail($id: ID!) {
        cancelAppointment(id: $id) { id status }
    }
`;

const FALLBACK_AVATAR = "https://picsum.photos/seed/appointment-admin/100/100";

function toAdminAppointment(a: BackendAdminAppointmentDetail): AdminAppointment {
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
    serviceId: null,
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

export function AppointmentDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [a, setA] = useState<AdminAppointment | null | undefined>(undefined);

  const fetchAppointment = () => {
    gqlRequest<{ adminAppointment: BackendAdminAppointmentDetail | null }>(ADMIN_APPOINTMENT_DETAIL_QUERY, { id: params.id })
      .then((res) => setA(res.adminAppointment ? toAdminAppointment(res.adminAppointment) : null))
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to load appointment.");
        setA(null);
      });
  };

  useEffect(fetchAppointment, [params.id]);

  if (a === undefined) {
    return <p className="py-16 text-center text-sm text-admin-muted">Loading…</p>;
  }

  if (!a) {
    return (
      <EmptyState
        title="Appointment not found"
        description="It may have been removed. Return to the appointments list."
        action={
          <Button onClick={() => router.push("/admin/appointments")}>
            Back to Appointments
          </Button>
        }
      />
    );
  }

  const complete = () => {
    gqlRequest(COMPLETE_APPOINTMENT_MUTATION, { id: a.id })
      .then(() => { toast.success("Marked completed"); fetchAppointment(); })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to update appointment."));
  };
  const cancel = () => {
    gqlRequest(CANCEL_APPOINTMENT_MUTATION, { id: a.id })
      .then(() => { toast.success("Cancelled"); fetchAppointment(); })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to cancel appointment."));
  };

  return (
    <>
      <DetailHeader
        backHref="/admin/appointments"
        backLabel="Back to Appointments"
        title={a.customer}
        actions={
          <>
            {/* "Approve" (pending -> upcoming) was dropped: no backend
                mutation exists to flip status without also cancelling or
                completing. See AppointmentsContent.tsx for details. */}
            <Button variant="outline" onClick={complete} disabled={a.status === "completed"}>
              Mark completed
            </Button>
            <Button
              className="bg-admin-rose text-white hover:bg-admin-rose/90"
              onClick={cancel}
              disabled={a.status === "cancelled"}
            >
              Cancel
            </Button>
          </>
        }
      />
      <DetailGrid>
        <DetailCard>
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- no real avatar field on AdminAppointmentDto */}
            <img src={a.customerAvatar} alt="" className="size-16 rounded-full" />
            <div>
              <StatusBadge status={a.status} />
              <h2 className="mt-2 font-display text-2xl">{a.customer}</h2>
              <p className="text-sm text-admin-muted">
                {a.serviceName} • {a.durationMin} min
              </p>
            </div>
          </div>
        </DetailCard>
        <DetailCard title="Details">
          <dl>
            <FieldRow label="Reference" value={<span className="font-mono">{a.appointmentCode}</span>} />
            <FieldRow label="Service Name" value={a.serviceName} />
            <FieldRow
              label="Service Type"
              value={<span className="capitalize">{a.serviceType.replace("_", " ")}</span>}
            />
            <FieldRow label="Stylist" value={a.stylistName} />
            {a.serviceType === "home_service" ? (
              <FieldRow label="Address" value={a.address || "—"} />
            ) : (
              <FieldRow label="Branch" value={a.branchName || "—"} />
            )}
            <FieldRow label="Phone" value={a.phone || "—"} />
            <FieldRow label="Email" value={a.email || "—"} />
            <FieldRow label="Guests" value={a.guests} />
            <FieldRow label="Starts" value={new Date(a.startsAt).toLocaleString()} />
            <FieldRow label="Duration" value={`${a.durationMin} min`} />
            <FieldRow label="Notes" value={a.notes || "—"} />
          </dl>
        </DetailCard>
      </DetailGrid>
    </>
  );
}
