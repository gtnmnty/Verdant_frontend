"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DetailHeader,
  DetailGrid,
  DetailCard,
  FieldRow,
} from "@/app/admin/_components/Detail";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { ConfirmDialog } from "@/app/admin/_components/ConfirmDialog";
import { EmptyState } from "@/app/admin/_components/EmptyState";
import { StylistFormDialog } from "@/app/admin/stylists/_components/StylistFormDialog";
import { useAdmin } from "@/lib/admin/store";

export function StylistDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { stylists, setStylists, branches, services, appointments, pushActivity } = useAdmin();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const stylist = stylists.find((s) => s.id === params.id);

  if (!stylist) {
    return (
      <EmptyState
        title="Stylist not found"
        description="They may have been removed. Return to the stylists list."
        action={<Button onClick={() => router.push("/admin/stylists")}>Back to Stylists</Button>}
      />
    );
  }

  const branch = branches.find((b) => b.id === stylist.branchId);
  const offered = services.filter((sv) => stylist.serviceIds.includes(sv.id));
  const upcoming = appointments.filter((a) => a.stylistName === stylist.fullName);

  const handleDelete = () => {
    setStylists((prev) => prev.filter((s) => s.id !== stylist.id));
    pushActivity({ kind: "shift", title: "Stylist Removed", body: stylist.fullName });
    toast.success("Stylist deleted");
    router.push("/admin/stylists");
  };

  return (
    <div>
      <DetailHeader
        backHref="/admin/stylists"
        backLabel="Back to Stylists"
        title={stylist.fullName}
        subtitle={stylist.specialties.join(" · ")}
        status={<StatusBadge status={stylist.status} />}
        actions={
          <>
            <Button variant="outline" onClick={() => setEditOpen(true)} className="border-admin-line">
              <Pencil className="mr-1.5 size-4" /> Edit
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(true)}
              className="border-admin-line text-admin-rose hover:text-admin-rose"
            >
              <Trash2 className="mr-1.5 size-4" /> Delete
            </Button>
          </>
        }
      />

      <DetailGrid>
        <div className="space-y-4">
          <DetailCard>
            <div className="flex flex-wrap items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- dicebear returns SVG, next/image blocks SVG by default */}
              <img src={stylist.photo} alt="" className="size-24 rounded-2xl" />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-relaxed text-admin-muted">{stylist.bio}</p>
              </div>
            </div>
          </DetailCard>

          <DetailCard title="Offered Services">
            {offered.length === 0 ? (
              <p className="text-sm text-admin-muted">No services assigned yet.</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {offered.map((sv) => (
                  <li key={sv.id} className="rounded-lg border border-admin-line p-3">
                    <p className="font-medium">{sv.name}</p>
                    <p className="text-xs text-admin-muted">{sv.duration} min · ${sv.price}</p>
                  </li>
                ))}
              </ul>
            )}
          </DetailCard>
        </div>

        <div className="space-y-4">
          <DetailCard title="Contact">
            <dl>
              <FieldRow label="Email" value={stylist.email} />
              <FieldRow label="Phone" value={stylist.phone} />
              <FieldRow label="Branch" value={branch?.name ?? "—"} />
              <FieldRow label="Working Hours" value={stylist.workingHours || "—"} />
            </dl>
          </DetailCard>

          <DetailCard title="Upcoming Appointments">
            {upcoming.length === 0 ? (
              <p className="text-sm text-admin-muted">None scheduled.</p>
            ) : (
              <ul className="space-y-2">
                {upcoming.map((a) => (
                  <li key={a.id} className="rounded-lg border border-admin-line p-3 text-sm">
                    <p className="font-semibold">{a.customer}</p>
                    <p className="text-xs text-admin-muted">
                      {new Date(a.startsAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </DetailCard>
        </div>
      </DetailGrid>

      <StylistFormDialog open={editOpen} onOpenChange={setEditOpen} stylist={stylist} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this stylist?"
        description={`"${stylist.fullName}" will be permanently removed.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
