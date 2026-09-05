"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DetailHeader,
  DetailGrid,
  DetailCard,
  FieldRow,
} from "@/app/admin/_components/Detail";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { ConfirmDialog } from "@/app/admin/_components/ConfirmDialog";
import { EmptyState } from "@/app/admin/_components/EmptyState";
import { ServiceFormDialog } from "@/app/admin/services/_components/ServiceFormDialog";
import { useAdmin } from "@/lib/admin/store";

export function ServiceDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { services, setServices, stylists, pushActivity } = useAdmin();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const service = services.find((s) => s.id === params.id);

  if (!service) {
    return (
      <EmptyState
        title="Service not found"
        description="It may have been removed. Return to the services list."
        action={
          <Button onClick={() => router.push("/admin/services")}>Back to Services</Button>
        }
      />
    );
  }

  const assignedStylists = stylists.filter((s) => service.stylistIds.includes(s.id));

  const toggleActive = () => {
    setServices((prev) =>
      prev.map((s) => (s.id === service.id ? { ...s, active: !s.active } : s)),
    );
  };

  const handleDelete = () => {
    setServices((prev) => prev.filter((s) => s.id !== service.id));
    pushActivity({ kind: "shift", title: "Service Removed", body: service.name });
    toast.success("Service deleted.");
    router.push("/admin/services");
  };

  return (
    <div>
      <DetailHeader
        backHref="/admin/services"
        backLabel="Back to Services"
        title={service.name}
        subtitle={service.subName}
        status={<StatusBadge status={service.active ? "active" : "inactive"} />}
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
            <div className="relative aspect-[16/7] w-full overflow-hidden rounded-xl bg-admin-cream">
              {service.image ? (
                <Image src={service.image} alt={service.name} fill sizes="800px" className="object-cover" />
              ) : null}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-admin-muted">{service.description}</p>
            {service.info ? (
              <p className="mt-2 text-sm leading-relaxed text-admin-muted">{service.info}</p>
            ) : null}

            {(service.badges.length || service.tags.length || service.infos.length) ? (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {service.badges.map((b) => (
                  <Badge key={b} className="bg-admin-amber/25 text-admin-ink hover:bg-admin-amber/25">{b}</Badge>
                ))}
                {service.tags.map((t) => (
                  <Badge key={t} variant="outline" className="border-admin-line text-admin-muted">#{t}</Badge>
                ))}
              </div>
            ) : null}

            {service.infos.length > 0 ? (
              <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
                {service.infos.map((i) => (
                  <li key={i} className="text-sm text-admin-muted">✦ {i}</li>
                ))}
              </ul>
            ) : null}
          </DetailCard>

          <DetailCard title="Assigned Stylists">
            {assignedStylists.length === 0 ? (
              <p className="text-sm text-admin-muted">No stylists assigned yet.</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {assignedStylists.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 rounded-lg border border-admin-line p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- dicebear returns SVG, next/image blocks SVG by default */}
                    <img src={s.photo} alt="" className="size-9 rounded-full" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{s.fullName}</p>
                      <p className="truncate text-xs text-admin-muted">{s.specialties.join(", ")}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </DetailCard>
        </div>

        <div className="space-y-4">
          <DetailCard title="Details">
            <dl>
              <FieldRow label="Category" value={service.category} />
              <FieldRow label="Duration" value={`${service.duration} min`} />
              <FieldRow label="Price" value={`$${service.price.toFixed(2)}`} />
              <FieldRow label="Home Service" value={service.homeService ? "Available" : "In-salon only"} />
              <FieldRow label="Featured" value={service.featured ? "Yes" : "No"} />
              <FieldRow label="Created" value={new Date(service.createdAt).toLocaleDateString()} />
              <FieldRow label="Updated" value={new Date(service.updatedAt).toLocaleDateString()} />
            </dl>
          </DetailCard>

          <DetailCard title="Visibility">
            <label className="flex items-center justify-between">
              <span className="text-sm">Active on storefront</span>
              <Switch checked={service.active} onCheckedChange={toggleActive} />
            </label>
          </DetailCard>
        </div>
      </DetailGrid>

      <ServiceFormDialog open={editOpen} onOpenChange={setEditOpen} service={service} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this service?"
        description={`"${service.name}" will be permanently removed from the catalog.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
