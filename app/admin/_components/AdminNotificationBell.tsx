"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { gqlRequest } from "@/utils/graphqlClient";
import { notifyUnreadChanged, useUnreadNotifications } from "@/hooks/useUnreadNotifications";
import { stampLabel } from "@/app/(site)/notifications/_components/data";
import {Skeleton, SkeletonRegion} from "@/components/ui/skeleton";

// Same feed as the customer site: the backend only returns the signed-in user's own rows, and it only creates
// staff rows for the roles allowed to hear about that event (StaffNotifier.rolesFor).
interface Item {
  id: string;
  title: string;
  message: string;
  referenceType: string | null;
  referenceId: string | null;
  isRead: boolean;
  priority: string | null;
  createdAt: string;
}

const LIST_QUERY = `
  query AdminNotifications {
    notifications(first: 15) {
      edges { node { id title message referenceType referenceId isRead priority createdAt } }
    }
  }
`;
const MARK_READ = `mutation AdminNotifRead($id: UUID!) { markNotificationAsRead(id: $id) { updatedIds } }`;
const MARK_ALL_READ = `mutation AdminNotifReadAll { markAllNotificationsAsRead { updatedIds } }`;

const ADMIN_ROUTE: Record<string, string> = {
  ORDER: "/admin/orders",
  APPOINTMENT: "/admin/appointments",
  PRODUCT: "/admin/products",
  SERVICE: "/admin/services",
  BRANCH: "/admin/branches",
  STYLIST: "/admin/stylists",
  REVIEW: "/admin/reviews",
  USER: "/admin/accounts",
};

const hrefFor = (n: Item) => {
  const base = n.referenceType ? ADMIN_ROUTE[n.referenceType] : undefined;
  if (!base) return null;
  return n.referenceId ? `${base}/${n.referenceId}` : base;
};

export function AdminNotificationBell() {
  const router = useRouter();
  const unread = useUnreadNotifications();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[] | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    gqlRequest<{ notifications: { edges: { node: Item }[] } }>(LIST_QUERY)
      .then((res) => setItems(res.notifications.edges.map((e) => e.node)))
      .catch(() => toast.error("Couldn't load notifications."));
  }, []);

  // Refetch every time the panel opens, and when the count changes while it's open.
  useEffect(() => {
    if (open) load();
  }, [open, unread, load]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const markRead = (id: string) => {
    setItems((prev) => prev?.map((n) => (n.id === id ? { ...n, isRead: true } : n)) ?? prev);
    gqlRequest(MARK_READ, { id }).then(notifyUnreadChanged).catch(() => {});
  };

  const markAllRead = () => {
    setItems((prev) => prev?.map((n) => ({ ...n, isRead: true })) ?? prev);
    gqlRequest(MARK_ALL_READ, {}).then(notifyUnreadChanged).catch(() => toast.error("Couldn't mark all as read."));
  };

  const openItem = (n: Item) => {
    if (!n.isRead) markRead(n.id);
    const href = hrefFor(n);
    if (href) {
      setOpen(false);
      router.push(href);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        aria-expanded={open}
        className="relative grid size-9 place-items-center rounded-full text-admin-ink hover:bg-admin-surface"
      >
        <Bell className="size-5" />
        {unread > 0 ? (
          <span className="absolute right-0.5 top-0.5 grid min-w-4 place-items-center rounded-full bg-admin-rose px-1 text-[9px] font-semibold leading-4 text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-11 z-50 w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-admin-line bg-admin-bg shadow-lg">
          <div className="flex items-center justify-between border-b border-admin-line px-4 py-3">
            <h3 className="text-sm font-semibold">Notifications</h3>
            <button
              type="button"
              onClick={markAllRead}
              disabled={unread === 0}
              className="inline-flex items-center gap-1 text-xs text-admin-muted hover:text-admin-ink disabled:opacity-40"
            >
              <CheckCheck className="size-3.5" /> Mark all read
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items === null ? (
              <SkeletonRegion label="Loading notifications" className="space-y-3 px-4 py-4">
                {Array.from({length: 3}).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-3/4"/>
                    <Skeleton className="h-3 w-1/2"/>
                  </div>
                ))}
              </SkeletonRegion>
            ) : items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-admin-muted">You&apos;re all caught up.</p>
            ) : (
              <ul className="divide-y divide-admin-line">
                {items.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => openItem(n)}
                      className="flex w-full gap-3 px-4 py-3 text-left hover:bg-admin-surface"
                    >
                      <span
                        className={`mt-1.5 size-2 shrink-0 rounded-full ${n.isRead ? "bg-transparent" : "bg-admin-rose"}`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{n.title}</span>
                        <span className="mt-0.5 line-clamp-2 block text-xs text-admin-muted">{n.message}</span>
                        <span className="mt-1 block text-[11px] text-admin-muted">{stampLabel(n.createdAt)}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
