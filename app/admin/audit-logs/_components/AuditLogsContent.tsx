"use client";

import {useEffect, useMemo, useState} from "react";
import {Search, ShieldCheck, X} from "lucide-react";
import {toast} from "sonner";
import {PageHeader} from "@/app/admin/_components/PageHeader";
import {AccessDenied} from "@/app/admin/AccessDenied";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {useRole} from "@/lib/admin/role-context";
import {gqlRequest} from "@/utils/graphqlClient";
import {dayLabel, groupByDay} from "@/app/(site)/notifications/_components/data";

type ActionType =
    | "CREATED" | "BOOKED" | "RESTOCKED" | "FAVORITE" | "UPDATED" | "CANCELLED"
    | "DELETED" | "SECURITY" | "ADMINISTRATIVE" | "STOCK_ADJUSTED"
    | "PAYMENT_INITIATED" | "PAYMENT_SUCCEEDED" | "PAYMENT_FAILED" | "PAYMENT_REFUNDED"
    | "UNFAVORITED" | "RESCHEDULED" | "APPROVED" | "REJECTED" | "COMPLETED"
    | "REVIEWED" | "IMAGE_UPDATED" | "STATUS_CHANGED" | "ASSIGNED"
    | "BULK_CANCELLED" | "BULK_DELETED";

interface LogEntry {
    id: string;
    action: ActionType;
    target: string;
    description: string;
    actorLabel: string;
    selfService: boolean;
    createdAt: string;
    level: "success" | "warning";
}

interface BackendAuditLogEntry {
    id: string;
    actionType: ActionType;
    title: string;
    detail: string | null;
    actorLabel: string | null;
    selfService: boolean;
    createdAt: string;
}

interface AuditLogPage {
    content: BackendAuditLogEntry[];
    totalElements: number;
    hasNext: boolean;
}

const AUDIT_DASHBOARD_FEED_QUERY = `
    query AuditDashboardFeed($page: Int, $size: Int) {
        auditDashboardFeed(page: $page, size: $size) {
            content {
                id
                actionType
                title
                detail
                actorLabel
                selfService
                createdAt
            }
            totalElements
            hasNext
        }
    }
`;

// The backend has no explicit success/warning flag — derive it from the
// action type. Actions that represent something going wrong or being
// removed/rejected are treated as warnings.
const WARNING_ACTIONS = new Set<ActionType>([
    "CANCELLED", "DELETED", "REJECTED", "PAYMENT_FAILED", "PAYMENT_REFUNDED",
    "BULK_CANCELLED", "BULK_DELETED", "SECURITY",
]);

const ACTION_BADGE: Record<ActionType, string> = {
    CREATED: "bg-emerald-500/12 text-emerald-700 border-emerald-500/25",
    BOOKED: "bg-emerald-500/12 text-emerald-700 border-emerald-500/25",
    RESTOCKED: "bg-emerald-500/12 text-emerald-700 border-emerald-500/25",
    FAVORITE: "bg-emerald-500/12 text-emerald-700 border-emerald-500/25",
    APPROVED: "bg-emerald-500/12 text-emerald-700 border-emerald-500/25",
    COMPLETED: "bg-emerald-500/12 text-emerald-700 border-emerald-500/25",
    REVIEWED: "bg-emerald-500/12 text-emerald-700 border-emerald-500/25",
    ASSIGNED: "bg-emerald-500/12 text-emerald-700 border-emerald-500/25",

    UPDATED: "bg-sky-500/12 text-sky-700 border-sky-500/25",
    RESCHEDULED: "bg-sky-500/12 text-sky-700 border-sky-500/25",
    STATUS_CHANGED: "bg-sky-500/12 text-sky-700 border-sky-500/25",
    STOCK_ADJUSTED: "bg-sky-500/12 text-sky-700 border-sky-500/25",
    IMAGE_UPDATED: "bg-sky-500/12 text-sky-700 border-sky-500/25",
    ADMINISTRATIVE: "bg-sky-500/12 text-sky-700 border-sky-500/25",
    PAYMENT_INITIATED: "bg-sky-500/12 text-sky-700 border-sky-500/25",
    PAYMENT_SUCCEEDED: "bg-sky-500/12 text-sky-700 border-sky-500/25",

    DELETED: "bg-rose-500/12 text-rose-700 border-rose-500/25",
    CANCELLED: "bg-rose-500/12 text-rose-700 border-rose-500/25",
    BULK_CANCELLED: "bg-rose-500/12 text-rose-700 border-rose-500/25",
    BULK_DELETED: "bg-rose-500/12 text-rose-700 border-rose-500/25",
    REJECTED: "bg-rose-500/12 text-rose-700 border-rose-500/25",
    UNFAVORITED: "bg-rose-500/12 text-rose-700 border-rose-500/25",
    PAYMENT_FAILED: "bg-rose-500/12 text-rose-700 border-rose-500/25",
    PAYMENT_REFUNDED: "bg-rose-500/12 text-rose-700 border-rose-500/25",

    SECURITY: "bg-violet-500/12 text-violet-700 border-violet-500/25",
};

const PAGE = 8;

function toLogEntry(e: BackendAuditLogEntry): LogEntry {
    return {
        id: e.id,
        action: e.actionType,
        target: e.title,
        description: e.detail ?? "",
        actorLabel: e.actorLabel ?? "System",
        selfService: e.selfService,
        createdAt: e.createdAt,
        level: WARNING_ACTIONS.has(e.actionType) ? "warning" : "success",
    };
}

export function AuditLogsContent() {
    const {perms, role} = useRole();
    const allowed = role === "admin" || role === "manager";

    const [entries, setEntries] = useState<LogEntry[]>([]);
    const [hasNext, setHasNext] = useState(false);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [level, setLevel] = useState<"all" | "success" | "warning">("all");
    const [query, setQuery] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [visible, setVisible] = useState(PAGE);

    // The backend query has no search/date-range params, and pagination is
    // page/size rather than cursor-based — simplest approach here is to
    // re-fetch a single growing page (size = `visible`) each time "View more"
    // is clicked, and do search/date filtering client-side over what's loaded.
    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        gqlRequest<{ auditDashboardFeed: AuditLogPage }>(AUDIT_DASHBOARD_FEED_QUERY, {
            page: 0,
            size: visible,
        })
            .then((res) => {
                if (cancelled) return;
                setEntries(res.auditDashboardFeed.content.map(toLogEntry));
                setHasNext(res.auditDashboardFeed.hasNext);
                setTotalElements(res.auditDashboardFeed.totalElements);
            })
            .catch((err) => {
                if (!cancelled) toast.error(err instanceof Error ? err.message : "Failed to load audit log.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [visible]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        const fromTs = from ? new Date(`${from}T00:00:00`).getTime() : null;
        const toTs = to ? new Date(`${to}T23:59:59`).getTime() : null;
        return entries
            .filter((e) => (level === "all" ? true : e.level === level))
            .filter((e) =>
                q
                    ? e.actorLabel.toLowerCase().includes(q) ||
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

    const groups = useMemo(
        () =>
            groupByDay(
                filtered.map((e) => ({
                    id: e.id,
                    category: "system" as const,
                    title: e.target,
                    body: e.description,
                    createdAt: e.createdAt,
                    read: true,
                    priority: "normal" as const,
                })),
            ),
        [filtered],
    );
    const byId =
        useMemo(() => new Map(filtered.map((e) => [e.id, e])), [filtered]);
    const filtersActive = Boolean(query || from || to || level !== "all");

    if (!allowed || !perms.caps.viewAuditLog) return <AccessDenied resource="Audit Logs"/>;

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
                                className={`rounded-full px-3 py-1.5 text-[11px] 
                                font-medium capitalize transition-colors ${
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
                        <Search
                            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-admin-muted"/>
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
                        className="h-10 w-38 rounded-full border-admin-line bg-admin-bg text-xs"
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
                            <X className="size-3.5"/> Reset
                        </Button>
                    ) : null}
                </div>
                <p className="mt-3 border-t border-admin-line pt-3 text-xs text-admin-muted">
                    {loading
                        ? "Loading…"
                        : `${filtered.length} ${filtered.length === 1 ? "entry" : "entries"}${
                            filtersActive ? " matching your filters" : ` of ${totalElements} loaded`
                        }`}
                </p>
            </section>

            {!loading && groups.length === 0 ? (
                <div
                    className="grid place-items-center gap-2 rounded-lg border border-admin-line bg-admin-surface px-6 py-14 text-center">
                    <ShieldCheck className="size-6 text-admin-muted"/>
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
                                            <span
                                                className="rounded-full border border-admin-line
                                                bg-admin-cream px-2 py-0.5 text-[10px]
                                                font-semibold uppercase tracking-wide">
                                              {e.selfService ? "Self-Service" : "Staff Action"}
                                            </span>
                                                <span
                                                    className={`rounded-full border px-2 py-0.5 text-[10px] 
                                                    font-semibold uppercase tracking-wide ${ACTION_BADGE[e.action]}`}
                                                >
                                                  {e.action.replaceAll("_", " ")}
                                                </span>
                                                <span className="truncate text-sm font-medium">{e.target}</span>
                                                <span className="ml-auto shrink-0 text-[11px] text-admin-muted">
                                                  {dayLabel(e.createdAt)} · {time}
                                                </span>
                                            </div>
                                            <p className="mt-1.5 text-sm text-admin-muted">{e.description}</p>
                                            <p className="mt-1 text-[11px] text-admin-muted/80">by {e.actorLabel}</p>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}

                    {hasNext && !filtersActive ? (
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
                        <p className="text-center text-[11px] uppercase
                        tracking-wider text-admin-muted">
                            End of log
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
