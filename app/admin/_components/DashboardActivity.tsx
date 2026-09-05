import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ACTIVITY_TONE, DASHBOARD_ACTIVITY } from "@/app/admin/_components/data";

export function DashboardActivity() {
  return (
    <section className="flex flex-col rounded-2xl bg-admin-surface p-5 shadow-sm">
      <h2 className="font-display text-xl sm:text-2xl">Recent Activity</h2>
      <ul className="mt-4 flex-1 space-y-4">
        {DASHBOARD_ACTIVITY.map((a) => (
          <li key={a.id} className="flex gap-3">
            <span
              className={`mt-1 h-12 w-1 shrink-0 rounded-full ${ACTIVITY_TONE[a.kind] ?? "bg-admin-line"}`}
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold">{a.title}</p>
              <p className="truncate text-sm text-admin-muted">{a.body}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-admin-muted">
                {a.at}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <Button asChild variant="outline" className="mt-4 rounded-full border-admin-line">
        <Link href="/admin/audit-logs">View Audit Log</Link>
      </Button>
    </section>
  );
}
