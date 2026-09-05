"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import Link from "next/link";
import {
    AlertTriangle,
    ArrowRight,
    BellOff,
    Check,
    CheckCheck,
    Search,
    Trash2,
    X,
} from "lucide-react";
import {toast} from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {gqlRequest} from "@/utils/graphqlClient";
import {
    CATEGORY_BADGE,
    CATEGORY_LABEL,
    PRIORITY_LABEL,
    PRIORITY_PILL,
    groupByDay,
    mapNotification,
    stampLabel,
    type AppNotification,
    type GqlNotification,
    type NotifCategory,
} from "@/app/(site)/notifications/_components/data";

type StatusFilter = "all" | "read" | "unread";
type CategoryFilter = "all" | NotifCategory;
const PAGE = 8;
// How many notifications to pull from the server per fetch. Client-side
// filters (category/date/importance/search) run over whatever's loaded, so
// this stays generous; "View more" then just paginates within that set until
// it runs out, at which point we go back to the server for the next page.
const FETCH_SIZE = 50;

interface NotificationsResponse {
    notifications: {
        unreadCount: number;
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
        edges: { cursor: string; node: GqlNotification }[];
    };
}

const NOTIFICATIONS_QUERY = `
    query Notifications($first: Int!, $after: String) {
        notifications(first: $first, after: $after) {
            unreadCount
            pageInfo {
                hasNextPage
                endCursor
            }
            edges {
                cursor
                node {
                    id
                    type
                    title
                    message
                    referenceType
                    referenceId
                    isRead
                    priority
                    createdAt
                }
            }
        }
    }
`;

const MARK_READ_MUTATION = `
    mutation MarkNotificationAsRead($id: UUID!) {
        markNotificationAsRead(id: $id) { updatedIds }
    }
`;

const MARK_ALL_READ_MUTATION = `
    mutation MarkAllNotificationsAsRead {
        markAllNotificationsAsRead { updatedIds }
    }
`;

const DELETE_NOTIFICATION_MUTATION = `
    mutation DeleteNotification($id: UUID!) {
        deleteNotification(id: $id) { deletedIds }
    }
`;

const DELETE_NOTIFICATIONS_MUTATION = `
    mutation DeleteNotifications($ids: [UUID!]!) {
        deleteNotifications(ids: $ids) { deletedIds }
    }
`;

export function NotificationsFeed() {
    const [items, setItems] = useState<AppNotification[]>([]);
    const [ready, setReady] = useState(false);
    const [endCursor, setEndCursor] = useState<string | null>(null);
    const [serverHasMore, setServerHasMore] = useState(false);
    const [fetchingMore, setFetchingMore] = useState(false);

    const [status, setStatus] = useState<StatusFilter>("all");
    const [category, setCategory] = useState<CategoryFilter>("all");
    const [importantOnly, setImportantOnly] = useState(false);
    const [query, setQuery] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [visible, setVisible] = useState(PAGE);
    const sentinel = useRef<HTMLDivElement>(null);

    // Initial load from the notification backend.
    useEffect(() => {
        let cancelled = false;

        gqlRequest<NotificationsResponse>(NOTIFICATIONS_QUERY, {
            first: FETCH_SIZE,
            after: null,
        })
            .then((res) => {
                if (cancelled) return;
                const {edges, pageInfo} = res.notifications;
                setItems(edges.map((e) => mapNotification(e.node)));
                setEndCursor(pageInfo.endCursor);
                setServerHasMore(pageInfo.hasNextPage);
            })
            .catch((err) => {
                if (!cancelled) toast.error(err instanceof Error ? err.message : "Failed to load notifications.");
            })
            .finally(() => {
                if (!cancelled) setReady(true);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    // Pulls the next server page and appends it once the locally-loaded set
    // runs out (see the `hasMore`/IntersectionObserver logic below).
    const fetchNextPage = useCallback(() => {
        if (!serverHasMore || fetchingMore) return;
        setFetchingMore(true);
        gqlRequest<NotificationsResponse>(NOTIFICATIONS_QUERY, {
            first: FETCH_SIZE,
            after: endCursor,
        })
            .then((res) => {
                const {edges, pageInfo} = res.notifications;
                setItems((p) => [...p, ...edges.map((e) => mapNotification(e.node))]);
                setEndCursor(pageInfo.endCursor);
                setServerHasMore(pageInfo.hasNextPage);
            })
            .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load more notifications."))
            .finally(() => setFetchingMore(false));
    }, [serverHasMore, fetchingMore, endCursor]);

    const unread = items.filter((n) => !n.read).length;
    const urgentUnread = items.filter((n) => !n.read && n.priority !== "normal").length;
    const categories = useMemo(
        () =>
            Array.from(new Set(items.map((n) => n.category))).sort((a, b) =>
                CATEGORY_LABEL[a].localeCompare(CATEGORY_LABEL[b]),
            ),
        [items],
    );

    const markRead = (id: string) => {
        setItems((p) => p.map((n) => (n.id === id ? {...n, read: true} : n)));
        gqlRequest(MARK_READ_MUTATION, {id}).catch((err) => {
            toast.error(err instanceof Error ? err.message : "Failed to mark as read.");
            setItems((p) => p.map((n) => (n.id === id ? {...n, read: false} : n)));
        });
    };
    // The backend only exposes markNotificationAsRead/markAllNotificationsAsRead
    // (see notification.graphql) - there's no "mark unread" mutation, so this
    // stays a local-only toggle until that's added server-side.
    const markUnread = (id: string) =>
        setItems((p) => p.map((n) => (n.id === id ? {...n, read: false} : n)));
    const markAllRead = () => {
        const previouslyUnread = items.filter((n) => !n.read).map((n) => n.id);
        setItems((p) => p.map((n) => ({...n, read: true})));
        gqlRequest(MARK_ALL_READ_MUTATION, {}).catch((err) => {
            toast.error(err instanceof Error ? err.message : "Failed to mark all as read.");
            setItems((p) => p.map((n) => (previouslyUnread.includes(n.id) ? {...n, read: false} : n)));
        });
    };
    const dismiss = (id: string) => {
        setItems((p) => p.filter((n) => n.id !== id));
        gqlRequest(DELETE_NOTIFICATION_MUTATION, {id}).catch((err) =>
            toast.error(err instanceof Error ? err.message : "Failed to delete notification."),
        );
    };
    const clearAll = () => {
        const ids = items.map((n) => n.id);
        setItems([]);
        if (ids.length === 0) return;
        gqlRequest(DELETE_NOTIFICATIONS_MUTATION, {ids}).catch((err) =>
            toast.error(err instanceof Error ? err.message : "Failed to clear notifications."),
        );
    };

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        const fromTs = from ? new Date(`${from}T00:00:00`).getTime() : null;
        const toTs = to ? new Date(`${to}T23:59:59`).getTime() : null;

        return items
            .filter((n) => (status === "all" ? true : status === "read" ? n.read : !n.read))
            .filter((n) => (category === "all" ? true : n.category === category))
            .filter((n) => (importantOnly ? n.priority !== "normal" : true))
            .filter((n) =>
                q ? n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q) : true,
            )
            .filter((n) => {
                const ts = new Date(n.createdAt).getTime();
                if (fromTs !== null && ts < fromTs) return false;
                return !(toTs !== null && ts > toTs);

            })
            .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }, [items, status, category, importantOnly, query, from, to]);

    useEffect(() => setVisible(PAGE), [status, category, importantOnly, query, from, to]);

    const shown = filtered.slice(0, visible);
    // "More to show" if there's another local page, or (once those run out)
    // the server still has further pages behind the cursor.
    const hasMore = filtered.length > shown.length || serverHasMore;
    const groups = useMemo(() => groupByDay(shown), [shown]);

    const loadMore = useCallback(() => {
        if (filtered.length > shown.length) setVisible((v) => v + PAGE);
        else fetchNextPage();
    }, [filtered.length, shown.length, fetchNextPage]);

    useEffect(() => {
        if (!hasMore) return;
        const el = sentinel.current;
        if (!el) return;
        const io = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting)) loadMore();
            },
            {rootMargin: "240px"},
        );
        io.observe(el);
        return () => io.disconnect();
    }, [hasMore, loadMore, shown.length]);

    const filtersActive = Boolean(
        query || from || to || status !== "all" || category !== "all" || importantOnly,
    );

    return (
        <div
            className={`
                mx-auto w-[min(90vw,1100px)]
                py-[clamp(2rem,5vw,3.5rem)]
            `}
        >
            <header className="text-center md:text-left">
                <p
                    className={`
                        text-[10px] font-semibold uppercase
                        tracking-[0.22em] text-soft-rose
                    `}
                >
                    Activity Feed
                </p>
                <h1
                    className={`
                        mt-2 font-display
                        text-[clamp(2rem,4.5vw,3.25rem)]
                        leading-tight tracking-tight text-primary
                    `}
                >
                    Notifications
                </h1>
                <p
                    className={`
                        mt-3 max-w-xl text-sm leading-relaxed
                        text-on-surface-variant
                    `}
                >
                    Every appointment confirmation,
                    order milestone and account change in
                    one refined timeline.
                </p>
                {urgentUnread > 0 ? (
                    <p
                        className={`
                            mt-3 inline-flex items-center gap-1.5
                            rounded-full border border-amber-500/40
                            bg-amber-500/12 px-3 py-1 text-[10px]
                            font-semibold uppercase tracking-[0.14em]
                            text-amber-700
                        `}
                    >
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {urgentUnread} priority {urgentUnread === 1 ? "alert" : "alerts"}
                    </p>
                ) : null}
            </header>

            {/* Filter + batch toolbar */}
            <section
                aria-label="Filters"
                className={`
                    mt-8 rounded-xl border border-blush/40
                    bg-surface-low p-3 sm:p-4
                `}
            >
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex rounded-full border border-blush/50 p-0.5">
                        {(["all", "unread", "read"] as StatusFilter[]).map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setStatus(s)}
                                aria-pressed={status === s}
                                className={`rounded-full px-3 py-1.5 text-[10px] 
                                font-semibold uppercase tracking-[0.14em] 
                                transition-colors ${
                                    status === s
                                        ? "bg-primary text-primary-foreground"
                                        : "text-on-surface-variant hover:text-primary"
                                }`}
                            >
                                {s === "all" ? `All (${items.length})` : s === "unread" ? `Unread (${unread})` : "Read"}
                            </button>
                        ))}
                    </div>

                    <div className="relative min-w-0 flex-1 basis-48">
                        <Search
                            className={`
                                pointer-events-none absolute left-3 top-1/2
                                h-4 w-4 -translate-y-1/2
                                text-on-surface-variant
                            `}
                        />
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search notifications…"
                            aria-label="Search notifications"
                            className="h-10 w-full pl-9 text-sm"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <label
                            className={`
                                flex items-center gap-1.5 text-[10px]
                                font-semibold uppercase tracking-[0.14em]
                                text-on-surface-variant
                            `}
                        >
                            From
                            <Input
                                type="date"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                className="h-10 w-38 text-xs"
                            />
                        </label>
                        <label
                            className={`
                                flex items-center gap-1.5 text-[10px]
                                font-semibold uppercase tracking-[0.14em]
                                text-on-surface-variant
                            `}
                        >
                            To
                            <Input
                                type="date"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                className="h-10 w-38 text-xs"
                            />
                        </label>
                    </div>
                </div>

                <div
                    className={`
                        mt-3 flex flex-wrap items-center gap-1.5
                        border-t border-blush/30 pt-3
                    `}
                >
                    {(["all", ...categories] as CategoryFilter[]).map((c) => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setCategory(c)}
                            aria-pressed={category === c}
                            className={`rounded-full border px-2.5 py-1 text-[10px] 
                            font-semibold uppercase tracking-[0.12em] 
                            transition-colors ${
                                category === c
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-blush/50 text-on-surface-variant " +
                                    "hover:text-primary"
                            }`}
                        >
                            {c === "all" ? "All categories" : CATEGORY_LABEL[c]}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => setImportantOnly((v) => !v)}
                        aria-pressed={importantOnly}
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 
                        text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                            importantOnly
                                ? "border-amber-500/60 bg-amber-500/15 text-amber-700"
                                : "border-blush/50 text-on-surface-variant hover:text-primary"
                        }`}
                    >
                        <AlertTriangle className="h-3 w-3" /> Priority
                    </button>
                </div>

                <div
                    className={`
                        mt-3 flex flex-wrap items-center
                        justify-between gap-2 border-t
                        border-blush/30 pt-3
                    `}
                >
                    <p className="text-xs text-on-surface-variant">
                        {filtered.length} {filtered.length === 1 ? "notification" : "notifications"}
                        {filtersActive ? " matching your filters" : ""}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                        {filtersActive ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1 text-xs"
                                onClick={() => {
                                    setStatus("all");
                                    setCategory("all");
                                    setImportantOnly(false);
                                    setQuery("");
                                    setFrom("");
                                    setTo("");
                                }}
                            >
                                <X className="h-3.5 w-3.5" /> Reset
                            </Button>
                        ) : null}
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 text-xs"
                            disabled={unread === 0}
                            onClick={() => {
                                markAllRead();
                                toast.success("All notifications marked as read");
                            }}
                        >
                            <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1 text-xs text-soft-rose"
                                    disabled={items.length === 0}
                                >
                                    <Trash2 className="h-3.5 w-3.5" /> Clear all
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This removes every notification from your feed. This cannot
                                        be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => {
                                            clearAll();
                                            toast.success("Notifications cleared");
                                        }}
                                    >
                                        Clear all
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </section>

            {/* Feed */}
            <section className="mt-8">
                {!ready ? (
                    <p className="py-16 text-center text-sm text-on-surface-variant">
                        Loading your feed…
                    </p>
                ) : groups.length === 0 ? (
                    <div
                        className={`
                            grid place-items-center gap-3 rounded-xl
                            border border-blush/40 bg-surface-low px-6
                            py-16 text-center
                        `}
                    >
                        <div
                            className={`
                                grid h-12 w-12 place-items-center
                                rounded-full bg-secondary
                            `}
                        >
                            <BellOff className="h-5 w-5 text-on-surface-variant" />
                        </div>
                        <p className="font-display text-xl text-primary">Nothing here</p>
                        <p className="max-w-sm text-sm text-on-surface-variant">
                            {filtersActive
                                ? "No notifications match your current filters."
                                : "New activity from your appointments and orders will appear here."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {groups.map((g) => (
                            <div key={g.key}>
                                <h2
                                    className={`
                                        sticky top-[clamp(56px,8vw,76px)] z-10 -mx-1
                                        bg-surface/95 px-1 py-2 text-[10px]
                                        font-semibold uppercase tracking-[0.22em]
                                        text-on-surface-variant backdrop-blur
                                    `}
                                >
                                    {g.label}
                                </h2>
                                <ul className="mt-2 space-y-3">
                                    {g.items.map((n) => (
                                        <li
                                            key={n.id}
                                            className={`rounded-xl border p-4 transition-colors ${
                                                n.read
                                                    ? "border-blush/30 bg-surface"
                                                    : "border-soft-rose/40 bg-surface-low"
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                                                    <span
                                                        className={`
                                                            shrink-0 rounded-full border px-2 py-0.5
                                                            text-[10px] font-semibold uppercase
                                                            tracking-[0.14em] ${CATEGORY_BADGE[n.category]}
                                                        `}
                                                    >
                                                        {CATEGORY_LABEL[n.category]}
                                                    </span>
                                                    {n.priority !== "normal" ? (
                                                        <span
                                                            className={`
                                                                inline-flex shrink-0 items-center gap-1
                                                                rounded-full border px-2 py-0.5 text-[10px]
                                                                font-semibold uppercase tracking-[0.14em]
                                                                ${PRIORITY_PILL[n.priority]}
                                                            `}
                                                        >
                                                            <AlertTriangle className="h-3 w-3" />
                                                            {PRIORITY_LABEL[n.priority]}
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`
                                                            text-right text-[11px]
                                                            text-on-surface-variant
                                                        `}
                                                    >
                                                        {stampLabel(n.createdAt)}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => dismiss(n.id)}
                                                        aria-label={`Dismiss ${n.title}`}
                                                        className={`
                                                            grid h-7 w-7 place-items-center rounded-full
                                                            text-on-surface-variant transition-colors
                                                            hover:bg-secondary hover:text-primary
                                                        `}
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>

                                            <h3 className="mt-2 text-sm font-semibold text-on-surface">
                                                {n.title}
                                            </h3>
                                            <p
                                                className={`
                                                    mt-1 text-sm leading-relaxed
                                                    text-on-surface-variant
                                                `}
                                            >
                                                {n.body}
                                            </p>

                                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                                {n.actionHref && n.actionLabel ? (
                                                    <Link
                                                        href={n.actionHref}
                                                        onClick={() => markRead(n.id)}
                                                        className={`
                                                            inline-flex items-center gap-1.5 text-[10px]
                                                            font-semibold uppercase tracking-[0.14em]
                                                            text-primary transition-opacity
                                                            hover:opacity-70
                                                        `}
                                                    >
                                                        {n.actionLabel}
                                                        <ArrowRight className="h-3.5 w-3.5" />
                                                    </Link>
                                                ) : null}
                                                <button
                                                    type="button"
                                                    onClick={() => (n.read ? markUnread(n.id) : markRead(n.id))}
                                                    className={`
                                                        inline-flex items-center gap-1.5 text-[10px]
                                                        font-semibold uppercase tracking-[0.14em]
                                                        text-on-surface-variant transition-colors
                                                        hover:text-primary
                                                    `}
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                    {n.read ? "Mark as unread" : "Mark as read"}
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        <div ref={sentinel} aria-hidden className="h-1" />

                        {hasMore ? (
                            <div className="flex justify-center">
                                <Button
                                    variant="outline"
                                    onClick={loadMore}
                                    disabled={fetchingMore}
                                    className={`
                                        px-6 text-[10px] font-semibold uppercase
                                        tracking-[0.18em]
                                    `}
                                >
                                    {fetchingMore ? "Loading…" : "View more"}
                                </Button>
                            </div>
                        ) : (
                            <p
                                className={`
                                    text-center text-[10px] uppercase
                                    tracking-[0.22em] text-on-surface-variant
                                `}
                            >
                                End of feed
                            </p>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}