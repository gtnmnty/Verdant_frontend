"use client";

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
import { useAdmin } from "@/lib/admin/store";

export function AppointmentDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { appointments, setAppointments } = useAdmin();
  const a = appointments.find((x) => x.id === params.id);

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
    setAppointments((prev) =>
      prev.map((x) => (x.id === a.id ? { ...x, status: "completed" } : x)),
    );
    toast.success("Marked completed");
  };
  const cancel = () => {
    setAppointments((prev) =>
      prev.map((x) => (x.id === a.id ? { ...x, status: "cancelled" } : x)),
    );
    toast.success("Cancelled");
  };
  const approve = () => {
    setAppointments((prev) =>
      prev.map((x) => (x.id === a.id ? { ...x, status: "upcoming" } : x)),
    );
    toast.success("Approved");
  };

  return (
    <>
      <DetailHeader
        backHref="/admin/appointments"
        backLabel="Back to Appointments"
        title={a.customer}
        actions={
          <>
            {a.status === "pending" ? (
              <Button variant="outline" onClick={approve}>
                Approve
              </Button>
            ) : null}
            <Button variant="outline" onClick={complete}>
              Mark completed
            </Button>
            <Button
              className="bg-admin-rose text-white hover:bg-admin-rose/90"
              onClick={cancel}
            >
              Cancel
            </Button>
          </>
        }
      />
      <DetailGrid>
        <DetailCard>
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- dicebear/account avatar URLs */}
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
            <FieldRow label="Service Name" value={a.serviceName} />
            <FieldRow
              label="Service Type"
              value={<span className="capitalize">{a.serviceType.replace("_", " ")}</span>}
            />
            <FieldRow label="Stylist" value={a.stylistName} />
            {a.serviceType === "home_service" ? (
              <FieldRow label="Address" value={a.address || "—"} />
            ) : (
              <FieldRow label="Branch" value={a.branchName} />
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
