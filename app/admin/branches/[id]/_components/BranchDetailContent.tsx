"use client";

import { useRouter, useParams } from "next/navigation";
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

export function BranchDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { branches, stylists } = useAdmin();
  const b = branches.find((x) => x.id === params.id);

  if (!b) {
    return (
      <EmptyState
        title="Branch not found"
        description="It may have been removed. Return to the branches list."
        action={
          <Button onClick={() => router.push("/admin/branches")}>
            Back to Branches
          </Button>
        }
      />
    );
  }

  const team = stylists.filter((s) => s.branchId === b.id);

  return (
    <>
      <DetailHeader backHref="/admin/branches" backLabel="Back to Branches" title={b.name} />
      <DetailGrid>
        <div className="space-y-5">
          <DetailCard>
            {b.image ? (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded URLs
              <img
                src={b.image}
                alt=""
                className="mb-4 h-56 w-full rounded-xl object-cover"
              />
            ) : null}
            <StatusBadge status={b.status} />
            <h2 className="mt-2 font-display text-2xl">{b.name}</h2>
            <p className="mt-1 text-sm text-admin-muted">{b.address}</p>
          </DetailCard>
          <DetailCard title="Team">
            {team.length === 0 ? (
              <p className="text-sm text-admin-muted">No stylists.</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {team.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-3 rounded-lg border border-admin-line p-3"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded URLs */}
                    <img src={s.photo} alt="" className="size-10 rounded-full" />
                    <div>
                      <p className="text-sm font-semibold">{s.fullName}</p>
                      <p className="text-xs text-admin-muted">{s.workingHours}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </DetailCard>
        </div>
        <DetailCard title="Contact">
          <dl>
            <FieldRow label="Phone" value={b.phone} />
            <FieldRow label="Email" value={b.email} />
            <FieldRow label="Hours" value={b.operatingHours} />
            <FieldRow
              label="Maps"
              value={
                <a
                  className="text-admin-sidebar underline"
                  href={b.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open
                </a>
              }
            />
          </dl>
        </DetailCard>
      </DetailGrid>
    </>
  );
}
