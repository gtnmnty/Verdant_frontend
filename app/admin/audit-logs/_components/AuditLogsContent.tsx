"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ShieldCheck, X } from "lucide-react";
import { PageHeader } from "@/app/admin/_components/PageHeader";
import { AccessDenied } from "@/app/admin/_components/AccessDenied";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRole } from "@/lib/admin/role-context";
import { dayLabel, groupByDay } from "@/app/notifications/_components/data";

type Actor = "Admin" | "Manager" | "Staff" | "System";
type ActionType = "CREATE" | "UPDATE" | "DELETE" | "AUTH";
type Level = "success" | "warning";

interface LogEntry {
  id: string;
  actor: Actor;
  actorName: string;
  action: ActionType;
  target: string;
  description: string;
  createdAt: string;
  level: Level;
}

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const SPECS: Omit<LogEntry, "id" | "createdAt">[] = [
  {
    actor: "Admin",
    actorName: "Elena Vance",
    action: "UPDATE",
    target: "Order #1024",
    description: "Marked order as In Transit and attached courier reference.",
    level: "success",
  },
  {
    actor: "Staff",
    actorName: "Rui Tanaka",
    action: "CREATE",
    target: "Appointment #A-2291",
    description: "Created in-salon booking for Aria Chen (Signature Facial).",
    level: "success",
  },
  {
    actor: "System",
    actorName: "Automation",
    action: "UPDATE",
    target: "Product #P-118",
    description: "Inventory adjusted to 4 units after fulfillment.",
    level: "warning",
  },
  {
    actor: "Manager",
    actorName: "Julian Rossi",
    action: "UPDATE",
    target: "User #45",
    description: "Elevated account privileges from Staff to Admin.",
    level: "success",
  },
  {
    actor: "Admin",
    actorName: "Elena Vance",
    action: "DELETE",
    target: "Review #R-88",
    description: "Removed review flagged as spam by moderation.",
    level: "success",
  },
  {
    actor: "System",
    actorName: "Automation",
    action: "AUTH",
    target: "Session #S-771",
    description: "Failed sign-in attempt — incorrect password (3rd try).",
    level: "warning",
  },
  {
    actor: "Staff",
    actorName: "Mira Lopez",
    action: "UPDATE",
    target: "Appointment #A-2280",
    description: "Rescheduled home-service visit to Saturday 11:00 AM.",
    level: "success",
  },
  {
    actor: "Manager",
    actorName: "Julian Rossi",
    action: "UPDATE",
    target: "Branch #B-02",
    description: "Updated operating hours for the Uptown atelier.",
    level: "success",
  },
  {
    actor: "Admin",
    actorName: "Elena Vance",
    action: "CREATE",
    target: "Service #S-41",
    description: "Published new Luxe Keratin Therapy service.",
    level: "success",
  },
  {
    actor: "System",
    actorName: "Automation",
    action: "UPDATE",
    target: "Order #1009",
    description: "Refund webhook retried after gateway timeout.",
    level: "warning",
  },
  {
    actor: "Admin",
    actorName: "Elena Vance",
    action: "AUTH",
    target: "Session #S-702",
    description: "Signed in from a new device (Manila, PH).",
    level: "success",
  },
  {
    actor: "Staff",
    actorName: "Rui Tanaka",
    action: "DELETE",
    target: "Cart #C-330",
    description: "Cleared abandoned cart at customer request.",
    level: "success",
  },
  {
    actor: "Manager",
    actorName: "Julian Rossi",
    action: "UPDATE",
    target: "Commission Plan",
    description: "Set stylist commission rate to 18% for colour services.",
    level: "success",
  },
  {
    actor: "System",
    actorName: "Automation",
    action: "UPDATE",
    target: "Backup",
    description: "Nightly database snapshot completed.",
    level: "success",
  },
];

const OFFSETS = [
  6 * MIN,
  40 * MIN,
  2 * HOUR,
  5 * HOUR,
  9 * HOUR,
  DAY + 2 * HOUR,
  DAY + 7 * HOUR,
  2 * DAY + 3 * HOUR,
  2 * DAY + 8 * HOUR,
  3 * DAY + 4 * HOUR,
  5 * DAY + 6 * HOUR,
  8 * DAY + 2 * HOUR,
  12 * DAY + 5 * HOUR,
  18 * DAY + 3 * HOUR,
];

const ACTION_BADGE: Record<ActionType, string> = {
  CREATE: "bg-emerald-500/12 text-emerald-700 border-emerald-500/25",
  UPDATE: "bg-sky-500/12 text-sky-700 border-sky-500/25",
  DELETE: "bg-rose-500/12 text-rose-700 border-rose-500/25",
  AUTH: "bg-violet-500/12 text-violet-700 border-violet-500/25",
};

const PAGE = 8;

export function AuditLogsContent() {
  const { perms, role } = useRole();
  const allowed = role === "admin" || role === "manager";

  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [level, setLevel] = useState<"all" | Level>("all");
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [visible, setVisible] = useState(PAGE);

  useEffect(() => {
    const now = Date.now();
    setEntries(
      SPECS.map((s, i) => ({
        ...s,
        id: `log-${i + 1}`,
        createdAt: new Date(now - (OFFSETS[i] ?? (i + 1) * HOUR)).toISOString(),
      })),
    );
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const fromTs = from ? new Date(`${from}T00:00:00`).getTime() : null;
    const toTs = to ? new Date(`${to}T23:59:59`).getTime() : null;
    return entries
      .filter((e) => (level === "all" ? true : e.level === level))
      .filter((e) =>
        q
          ? e.actorName.toLowerCase().includes(q) ||
            e.actor.toLowerCase().includes(q) ||
            e.target.toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q)
          : true,
      )
      .filter((e) => {
        const ts = new Date(e.createdAt).getTime();
        if (fromTs !== null && ts < fromTs) return false;
        if (toTs !== null && ts > toTs) return false;
        return true;
      })
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [entries, level, query, from, to]);

  useEffect(() => setVisible(PAGE), [level, query, from, to]);

  const shown = filtered.slice(0, visible);
  const groups = useMemo(
    () =>
      groupByDay(
        shown.map((e) => ({
          id: e.id,
          category: "system" as const,
          title: e.target,
          body: e.description,
          createdAt: e.createdAt,
          read: true,
          priority: "normal" as const,
        })),
      ),
    [shown],
  );
  const byId = useMemo(() => new Map(shown.map((e) => [e.id, e])), [shown]);
  const hasMore = filtered.length > shown.length;
  const filtersActive = Boolean(query || from || to || level !== "all");

  if (!allowed || !perms.caps.viewAuditLog) return <AccessDenied resource="Audit Logs" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Every privileged action across catalog, orders, staff and access control."
      />

      <section className="rounded-lg border border-admin-line bg-admin-surface p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-full border border-admin-line p-0.5">
            {(["all", "success", "warning"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLevel(l)}
                aria-pressed={level === l}
                className={`rounded-full px-3 py-1.5 text-[11px] font-medium capitalize transition-colors ${
                  level === l
                    ? "bg-admin-ink text-white"
                    : "text-admin-muted hover:text-admin-ink"
                }`}
              >
                {l === "warning" ? "Failure / Warning" : l}
              </button>
            ))}
          </div>

          <div className="relative min-w-0 flex-1 basis-48">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-admin-muted" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search actor, resource or description…"
              aria-label="Search audit logs"
              className="h-10 w-full rounded-full border-admin-line bg-admin-bg pl-9"
            />
          </div>

          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            aria-label="From date"
            className="h-10 w-[9.5rem] rounded-full border-admin-line bg-admin-bg text-xs"
          />
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            aria-label="To date"
            className="h-10 w-[9.5rem] rounded-full border-admin-line bg-admin-bg text-xs"
          />
          {filtersActive ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-1 text-xs"
              onClick={() => {
                setLevel("all");
                setQuery("");
                setFrom("");
                setTo("");
              }}
            >
              <X className="size-3.5" /> Reset
            </Button>
          ) : null}
        </div>
        <p className="mt-3 border-t border-admin-line pt-3 text-xs text-admin-muted">
          {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
          {filtersActive ? " matching your filters" : ""}
        </p>
      </section>

      {groups.length === 0 ? (
        <div className="grid place-items-center gap-2 rounded-lg border border-admin-line bg-admin-surface px-6 py-14 text-center">
          <ShieldCheck className="size-6 text-admin-muted" />
          <p className="text-sm font-medium">No log entries</p>
          <p className="text-xs text-admin-muted">Adjust your filters to widen the audit window.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <div key={g.key}>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-admin-muted">
                {g.label}
              </h3>
              <ul className="mt-2 space-y-2">
                {g.items.map((row) => {
                  const e = byId.get(row.id);
                  if (!e) return null;
                  const time = new Date(e.createdAt).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  });
                  return (
                    <li
                      key={e.id}
                      className="rounded-lg border border-admin-line bg-admin-surface p-3 sm:p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-admin-line bg-admin-cream px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                          {e.actor}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${ACTION_BADGE[e.action]}`}
                        >
                          {e.action}
                        </span>
                        <span className="truncate text-sm font-medium">{e.target}</span>
                        <span className="ml-auto shrink-0 text-[11px] text-admin-muted">
                          {dayLabel(e.createdAt)} · {time}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm text-admin-muted">{e.description}</p>
                      <p className="mt-1 text-[11px] text-admin-muted/80">by {e.actorName}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {hasMore ? (
            <div className="flex justify-center">
              <Button
                variant="outline"
                className="rounded-full border-admin-line px-6 text-xs"
                onClick={() => setVisible((v) => v + PAGE)}
              >
                View more
              </Button>
            </div>
          ) : (
            <p className="text-center text-[11px] uppercase tracking-wider text-admin-muted">
              End of log
            </p>
          )}
        </div>
      )}
    </div>
  );
}
