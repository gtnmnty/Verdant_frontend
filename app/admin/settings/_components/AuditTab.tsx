"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type Column } from "@/app/admin/_components/DataTable";
import { SettingsCard } from "@/app/admin/settings/_components/SettingsCard";
import { AUDIT, AUDIT_MODULES, type AuditRow } from "@/app/admin/settings/_components/data";

export function AuditTab() {
  const [search, setSearch] = useState("");
  const [module, setModule] = useState("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return AUDIT.filter((row) => {
      if (module !== "all" && row.module !== module) return false;
      if (!q) return true;
      return row.user.toLowerCase().includes(q) || row.action.toLowerCase().includes(q);
    });
  }, [search, module]);

  const columns: Column<AuditRow>[] = [
    { key: "timestamp", header: "Timestamp", sortable: true, sortValue: (r) => r.timestamp, render: (r) => r.timestamp },
    { key: "user", header: "User", sortable: true, sortValue: (r) => r.user, render: (r) => r.user },
    { key: "role", header: "Role", render: (r) => r.role },
    { key: "action", header: "Action", render: (r) => r.action },
    { key: "module", header: "Module", render: (r) => r.module },
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
          <Select value={module} onValueChange={setModule}>
            <SelectTrigger className="w-44 border-admin-line bg-admin-bg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              {AUDIT_MODULES.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DataTable
          rows={filtered}
          columns={columns}
          pageSize={10}
          emptyTitle="No matching entries"
        />
      </SettingsCard>
    </div>
  );
}
