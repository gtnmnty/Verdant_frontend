"use client"

import {useCallback, useEffect, useState} from "react";
import {usePathname} from "next/navigation";
import {gqlRequest} from "@/utils/graphqlClient";
import {useAuth} from "@/context/AuthContext";

const UNREAD_COUNT_QUERY = `
    query NotificationUnreadCount {
        notificationUnreadCount
    }
`;

// Fired by anything that changes how many notifications are unread (marking read, deleting), so the header badge
// updates at once instead of waiting for the next poll.
const CHANGED_EVENT = "verdant:notifications-changed";

export function notifyUnreadChanged() {
    if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGED_EVENT));
}

// New notifications are created on the server, and there is no push channel to the browser, so the count is
// re-read: every POLL_MS while the tab is visible, when the tab regains focus, on every page change, and
// whenever notifyUnreadChanged() fires.
const POLL_MS = 30_000;

export function useUnreadNotifications() {
    const {token, loading: authLoading} = useAuth();
    const pathname = usePathname();
    const [unread, setUnread] = useState(0);

    const refresh = useCallback(() => {
        if (authLoading || token === null) return;
        gqlRequest<{notificationUnreadCount: number}>(UNREAD_COUNT_QUERY)
            .then((res) => setUnread(Number(res.notificationUnreadCount) || 0))
            .catch(() => { /* keep the last known count; the next refresh tries again */ });
    }, [authLoading, token]);

    // Logged out: no badge. Otherwise read it now, and again after every navigation.
    useEffect(() => {
        if (authLoading) return;
        if (token === null) {
            setUnread(0);
            return;
        }
        refresh();
    }, [authLoading, token, pathname, refresh]);

    useEffect(() => {
        if (authLoading || token === null) return;

        const poll = window.setInterval(() => {
            if (document.visibilityState === "visible") refresh();
        }, POLL_MS);
        const onVisible = () => {
            if (document.visibilityState === "visible") refresh();
        };
        window.addEventListener(CHANGED_EVENT, refresh);
        window.addEventListener("focus", refresh);
        document.addEventListener("visibilitychange", onVisible);

        return () => {
            window.clearInterval(poll);
            window.removeEventListener(CHANGED_EVENT, refresh);
            window.removeEventListener("focus", refresh);
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [authLoading, token, refresh]);

    return unread;
}
