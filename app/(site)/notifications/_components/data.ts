// Broad UI-facing grouping. The backend has ~50 fine-grained NotificationType
// values (see NotificationType.java) - these buckets are how we group them
// for the feed's category filter chips.
export type NotifCategory =
    | "appointment"
    | "order"
    | "payment"
    | "account"
    | "promotion"
    | "system";

export type NotifPriority = "normal" | "high" | "urgent";

export interface AppNotification {
    id: string;
    category: NotifCategory;
    title: string;
    body: string;
    createdAt: string; // ISO timestamp
    read: boolean;
    priority: NotifPriority;
    actionLabel?: string;
    actionHref?: string;
}

export const CATEGORY_LABEL: Record<NotifCategory, string> = {
    appointment: "Appointment",
    order: "Order Update",
    payment: "Payment",
    account: "Account",
    promotion: "Offers",
    system: "System Alert",
};

export const CATEGORY_BADGE: Record<NotifCategory, string> = {
    appointment: "bg-emerald-500/12 text-emerald-700 border-emerald-500/25",
    order: "bg-sky-500/12 text-sky-700 border-sky-500/25",
    payment: "bg-teal-500/12 text-teal-700 border-teal-500/25",
    account: "bg-fuchsia-500/12 text-fuchsia-700 border-fuchsia-500/25",
    promotion: "bg-pink-500/12 text-pink-700 border-pink-500/25",
    system: "bg-amber-500/14 text-amber-700 border-amber-500/30",
};

export const PRIORITY_LABEL: Record<NotifPriority, string> = {
    normal: "Normal",
    high: "Important",
    urgent: "Urgent",
};

export const PRIORITY_PILL: Record<NotifPriority, string> = {
    normal: "",
    high: "border-amber-500/40 bg-amber-500/12 text-amber-700",
    urgent: "border-red-500/40 bg-red-500/12 text-red-700",
};

/* ------------------------- GraphQL response shape ------------------------ */
// Mirrors Notification / NotificationType / NotificationPriority / ReferenceType
// in notification.graphql - keep in sync with the backend schema.

export type GqlNotificationType =
    | "APPOINTMENT_CREATED" | "APPOINTMENT_UPDATED" | "APPOINTMENT_RESCHEDULED"
    | "APPOINTMENT_CANCELLED" | "APPOINTMENT_APPROVED" | "APPOINTMENT_REJECTED"
    | "APPOINTMENT_REMINDER" | "APPOINTMENT_NO_SHOW" | "STYLIST_ASSIGNED"
    | "ORDER_CREATED" | "ORDER_UPDATED" | "ORDER_CANCELLED" | "ORDER_DELETED"
    | "ORDER_STATUS_CHANGED" | "ORDER_PAYMENT_SUCCESS" | "ORDER_PAYMENT_FAILED"
    | "ORDER_REFUND_REQUESTED" | "ORDER_REFUNDED"
    | "PRODUCT_ADDED" | "PRODUCT_UPDATED" | "PRODUCT_IMAGE_UPDATED" | "PRODUCT_DELETED"
    | "PRODUCT_LOW_STOCK" | "PRODUCT_OUT_OF_STOCK" | "PRODUCT_BACK_IN_STOCK" | "PRODUCT_PRICE_DROP"
    | "SERVICE_ADDED" | "SERVICE_UPDATED" | "SERVICE_IMAGE_UPDATED" | "SERVICE_DELETED"
    | "SALE_STARTED" | "SALE_ENDING_SOON"
    | "BRANCH_ADDED" | "BRANCH_UPDATED" | "BRANCH_DELETED"
    | "LEAVE_REQUEST_SUBMITTED" | "LEAVE_REQUEST_APPROVED" | "LEAVE_REQUEST_REJECTED"
    | "STYLIST_ADDED" | "STYLIST_UPDATED" | "STYLIST_DEACTIVATED" | "STYLIST_DELETED" | "STYLIST_IMAGE_UPDATED"
    | "ACCOUNT_CREATED" | "ACCOUNT_UPDATED" | "ACCOUNT_ADDRESS_CHANGED" | "ACCOUNT_STATUS_CHANGED"
    | "PHONE_NUMBER_CHANGED" | "EMAIL_CHANGED" | "PASSWORD_CHANGED" | "NEW_LOGIN_DETECTED"
    | "REVIEW_RECEIVED" | "REVIEW_REPLIED"
    | "PROMO_CODE_ISSUED" | "LOYALTY_POINTS_EARNED" | "LOYALTY_POINTS_EXPIRING" | "MEMBERSHIP_TIER_UPGRADED"
    | "BULK_ACTION_PERFORMED";

export type GqlReferenceType =
    | "APPOINTMENT" | "ORDER" | "PRODUCT" | "SERVICE" | "BRANCH"
    | "LEAVE_REQUEST" | "USER" | "REVIEW" | "PROMOTION" | "STYLIST" | "MEDIA_IMAGE";

export type GqlNotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "INFO" | "WARNING" | "CRITICAL";

export interface GqlNotification {
    id: string;
    type: GqlNotificationType;
    title: string;
    message: string;
    referenceType: GqlReferenceType | null;
    referenceId: string | null;
    isRead: boolean;
    priority: GqlNotificationPriority | null;
    createdAt: string;
}

const CATEGORY_BY_TYPE: Partial<Record<GqlNotificationType, NotifCategory>> = {
    APPOINTMENT_CREATED: "appointment", APPOINTMENT_UPDATED: "appointment",
    APPOINTMENT_RESCHEDULED: "appointment", APPOINTMENT_CANCELLED: "appointment",
    APPOINTMENT_APPROVED: "appointment", APPOINTMENT_REJECTED: "appointment",
    APPOINTMENT_REMINDER: "appointment", APPOINTMENT_NO_SHOW: "appointment",
    STYLIST_ASSIGNED: "appointment",

    ORDER_CREATED: "order", ORDER_UPDATED: "order", ORDER_CANCELLED: "order",
    ORDER_DELETED: "order", ORDER_STATUS_CHANGED: "order",
    ORDER_REFUND_REQUESTED: "order", ORDER_REFUNDED: "order",

    ORDER_PAYMENT_SUCCESS: "payment", ORDER_PAYMENT_FAILED: "payment",

    ACCOUNT_CREATED: "account", ACCOUNT_UPDATED: "account",
    ACCOUNT_ADDRESS_CHANGED: "account", ACCOUNT_STATUS_CHANGED: "account",
    PHONE_NUMBER_CHANGED: "account", EMAIL_CHANGED: "account",
    PASSWORD_CHANGED: "account", NEW_LOGIN_DETECTED: "account",

    PRODUCT_BACK_IN_STOCK: "promotion", PRODUCT_PRICE_DROP: "promotion",
    SALE_STARTED: "promotion", SALE_ENDING_SOON: "promotion",
    PROMO_CODE_ISSUED: "promotion", LOYALTY_POINTS_EARNED: "promotion",
    LOYALTY_POINTS_EXPIRING: "promotion", MEMBERSHIP_TIER_UPGRADED: "promotion",
};

const PRIORITY_MAP: Record<GqlNotificationPriority, NotifPriority> = {
    CRITICAL: "urgent",
    WARNING: "urgent",
    HIGH: "high",
    MEDIUM: "normal",
    LOW: "normal",
    INFO: "normal",
};

const ACTION_BY_REFERENCE: Partial<Record<GqlReferenceType, { label: string; href: (id: string | null) => string }>> = {
    ORDER: {label: "View Order", href: (id) => (id ? `/orders/${id}` : "/orders")},
    APPOINTMENT: {label: "View Appointment", href: () => "/appointments"},
    PRODUCT: {label: "Shop Collections", href: () => "/collections"},
    SERVICE: {label: "Shop Collections", href: () => "/collections"},
    PROMOTION: {label: "Book Now", href: () => "/book"},
};

/** Maps a raw GraphQL notification node into the shape the feed UI renders. */
export function mapNotification(n: GqlNotification): AppNotification {
    const action = n.referenceType ? ACTION_BY_REFERENCE[n.referenceType] : undefined;
    return {
        id: n.id,
        category: CATEGORY_BY_TYPE[n.type] ?? "system",
        title: n.title,
        body: n.message,
        createdAt: n.createdAt,
        read: n.isRead,
        priority: n.priority ? PRIORITY_MAP[n.priority] : "normal",
        actionLabel: action?.label,
        actionHref: action?.href(n.referenceId),
    };
}

/* <---------------------------- formatting ----------------------------> */

const TIME_FMT = new Intl.DateTimeFormat("en-US", {hour: "numeric", minute: "2-digit"});
const DATE_FMT = new Intl.DateTimeFormat("en-GB", {day: "2-digit", month: "short", year: "numeric"});

function startOfDay(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function dayKey(iso: string) {
    return new Date(startOfDay(new Date(iso))).toISOString().slice(0, 10);
}

export function dayLabel(iso: string) {
    const today = startOfDay(new Date());
    const day = startOfDay(new Date(iso));
    const diff = Math.round((today - day) / 86_400_000);
    if (diff <= 0) return "Today";
    if (diff === 1) return "Yesterday";
    return DATE_FMT.format(new Date(iso));
}

/** "10:30 AM" for today/yesterday, else "24 Nov 2018 at 9:30 AM". */
export function stampLabel(iso: string) {
    const d = new Date(iso);
    const label = dayLabel(iso);
    if (label === "Today" || label === "Yesterday") return TIME_FMT.format(d);
    return `${DATE_FMT.format(d)} at ${TIME_FMT.format(d)}`;
}

export function groupByDay(items: AppNotification[]) {
    const groups: { key: string; label: string; items: AppNotification[] }[] = [];
    for (const n of items) {
        const key = dayKey(n.createdAt);
        const last = groups[groups.length - 1];
        if (last && last.key === key) last.items.push(n);
        else groups.push({key, label: dayLabel(n.createdAt), items: [n]});
    }
    return groups;
}