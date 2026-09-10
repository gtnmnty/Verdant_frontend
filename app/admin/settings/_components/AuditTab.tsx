"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { DataTable, type Column } from "@/app/admin/_components/DataTable";
import { SettingsCard } from "@/app/admin/settings/_components/SettingsCard";
import { gqlRequest } from "@/utils/graphqlClient";

interface AuditRow {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  detail: string;
}

interface BackendAuditEntry {
  id: string;
  actionType: string;
  title: string;
  detail: string | null;
  actorLabel: string | null;
  createdAt: string;
}

// Same underlying feed as the standalone Audit Logs page — this is a
// smaller, embedded view of it. The old mock had a "module" filter
// (Products/Orders/Staff…) with no backend equivalent — AuditFeedEntry has
// no entity-type field to group by, so that filter was dropped, keeping
// just search.
const AUDIT_FEED_QUERY = `
    query SettingsAuditFeed($size: Int) {
        auditDashboardFeed(page: 0, size: $size) {
            content { id actionType title detail actorLabel createdAt }
        }
    }
`;

function toRow(e: BackendAuditEntry): AuditRow {
  return {
    id: e.id,
    timestamp: new Date(e.createdAt).toLocaleString(),
    user: e.actorLabel ?? "System",
    action: e.title,
    detail: e.detail ?? "",
  };
}

export function AuditTab() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    gqlRequest<{ auditDashboardFeed: { content: BackendAuditEntry[] } }>(AUDIT_FEED_QUERY, { size: 50 })
      .then((res) => setRows(res.auditDashboardFeed.content.map(toRow)))
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load audit log."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = rows.filter((row) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return row.user.toLowerCase().includes(q) || row.action.toLowerCase().includes(q);
  });

  const columns: Column<AuditRow>[] = [
    { key: "timestamp", header: "Timestamp", sortable: true, sortValue: (r) => r.timestamp, render: (r) => r.timestamp },
    { key: "user", header: "User", sortable: true, sortValue: (r) => r.user, render: (r) => r.user },
    { key: "action", header: "Action", render: (r) => r.action },
    { key: "detail", header: "Detail", render: (r) => <span className="text-admin-muted">{r.detail}</span> },
  ];

  return (
    <div className="space-y-5">
      <SettingsCard title="Audit log" description="A record of admin actions across the dashboard.">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-admin-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user or action…"
              className="border-admin-line bg-admin-bg pl-9"
            />
          </div>
        </div>
        <DataTable
          rows={filtered}
          columns={columns}
          pageSize={10}
          emptyTitle={loading ? "Loading…" : "No matching entries"}
        />
      </SettingsCard>
    </div>
  );
}
