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

const AUDIT: Array<{ kind: string; title: string; body: string; at: string; tone: string }> = [
  {
    kind: "favorites",
    title: "Added to favorites",
    body: "Verdant Botanical Mask",
    at: "2 hours ago",
    tone: "bg-admin-blush",
  },
  {
    kind: "account",
    title: "Account details updated",
    body: "Phone number changed",
    at: "1 day ago",
    tone: "bg-admin-sage",
  },
  {
    kind: "order",
    title: "Order placed",
    body: "VS-10231 · $124",
    at: "3 days ago",
    tone: "bg-admin-sidebar",
  },
  {
    kind: "appointment",
    title: "Appointment booked",
    body: "Balayage & Cut · Sophie Laurent",
    at: "5 days ago",
    tone: "bg-admin-sage-deep",
  },
  {
    kind: "account",
    title: "Password reset",
    body: "Requested self-service reset",
    at: "2 weeks ago",
    tone: "bg-admin-amber",
  },
];

export function AccountDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { accounts, setAccounts } = useAdmin();
  const a = accounts.find((x) => x.id === params.id);

  if (!a) {
    return (
      <EmptyState
        title="Account not found"
        description="It may have been removed. Return to the accounts list."
        action={
          <Button onClick={() => router.push("/admin/accounts")}>
            Back to Accounts
          </Button>
        }
      />
    );
  }

  const isCustomer = a.role === "customer";
  const suspend = () => {
    setAccounts((prev) =>
      prev.map((x) =>
        x.id === a.id ? { ...x, status: x.status === "active" ? "suspended" : "active" } : x,
      ),
    );
    toast.success("Status updated");
  };

  return (
    <>
      <DetailHeader
        backHref="/admin/accounts"
        backLabel="Back to Accounts"
        title={a.name}
        actions={
          <>
            <Button variant="outline" onClick={() => toast.success("Reset link sent")}>
              Reset password
            </Button>
            <Button variant="outline" onClick={suspend}>
              {a.status === "active" ? "Suspend" : "Restore"}
            </Button>
          </>
        }
      />
      <DetailGrid>
        <div className="space-y-5">
          <DetailCard>
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded/dicebear avatar URLs */}
              <img src={a.avatar} alt="" className="size-20 rounded-2xl" />
              <div>
                <StatusBadge status={a.status} />
                <h2 className="mt-2 font-display text-2xl">{a.name}</h2>
                <p className="text-sm text-admin-muted">{a.email}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-admin-muted">
                  {a.role}
                </p>
              </div>
            </div>
          </DetailCard>

          <DetailCard title="Profile">
            <dl>
              <FieldRow label="Email" value={a.email} />
              <FieldRow label="Contact number" value={a.phone || "—"} />
              <FieldRow label="Address" value={a.address || "—"} />
              <FieldRow label="Role" value={<span className="capitalize">{a.role}</span>} />
              <FieldRow label="Status" value={<StatusBadge status={a.status} />} />
              <FieldRow label="Created" value={a.createdAt} />
            </dl>
          </DetailCard>

          <DetailCard title="Audit log">
            <ul className="space-y-4">
              {AUDIT.map((row, i) => (
                <li key={i} className="flex gap-3">
                  <span className={`mt-1 h-12 w-1 shrink-0 rounded-full ${row.tone}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{row.title}</p>
                    <p className="truncate text-sm text-admin-muted">{row.body}</p>
                    <p className="mt-0.5 text-[11px] uppercase tracking-wide text-admin-muted">
                      {row.at}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </DetailCard>
        </div>

        <DetailCard title="Permissions">
          {isCustomer ? (
            <p className="text-sm text-admin-muted">Customers don&apos;t have staff permissions.</p>
          ) : a.permissions.length === 0 ? (
            <p className="text-sm text-admin-muted">No permissions assigned.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {a.permissions.map((p) => (
                <li key={p} className="rounded-full bg-admin-cream px-3 py-1 text-xs capitalize">
                  {p}
                </li>
              ))}
            </ul>
          )}
        </DetailCard>
      </DetailGrid>
    </>
  );
}
