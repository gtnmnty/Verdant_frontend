"use client";

import {useEffect, useMemo, useState} from "react";
import Link from "next/link";
import {ArrowUpDown, Download, RefreshCw, Search} from "lucide-react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {PageHeader} from "@/app/admin/_components/PageHeader";
import {DataTable, type Column} from "@/app/admin/_components/DataTable";
import {StatusBadge} from "@/app/admin/_components/StatusBadge";
import {OrderFormDialog} from "@/app/admin/orders/_components/OrderFormDialog";
import {gqlRequest} from "@/utils/graphqlClient";

type FrontendStatus = "pending" | "processing" | "in_transit" | "delivered" | "cancelled";

const STATUSES: FrontendStatus[] = [
    "pending",
    "processing",
    "in_transit",
    "delivered",
    "cancelled",
];

const STATUS_TO_BACKEND: Record<FrontendStatus, string> = {
    pending: "PLACED",
    processing: "PROCESSING",
    in_transit: "IN_TRANSIT",
    delivered: "DELIVERED",
    cancelled: "CANCELLED",
};
const STATUS_FROM_BACKEND: Record<string, FrontendStatus> = {
    PLACED: "pending",
    PROCESSING: "processing",
    IN_TRANSIT: "in_transit",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
};

interface BackendAdminOrder {
    id: string;
    orderCode: string;
    user: { fullName: string };
    orderStatus: string;
    total: number;
    itemCount: number;
    createdAt: string;
}

interface AdminOrderPage {
    items: BackendAdminOrder[];
    totalItems: number;
}

const ADMIN_ORDERS_QUERY = `
    query AdminOrders(
        $status: OrderStatus, 
        $search: String, 
        $sort: AdminOrderSort, 
        $direction: OrderSortDirection, 
        $page: Int, 
        $pageSize: Int
    ) {
        adminOrders(
            status: $status, 
            search: $search, 
            sort: $sort, 
            direction: $direction, 
            page: $page, 
            pageSize: $pageSize
        ) {
            items {
                id
                orderCode
                user { fullName }
                orderStatus
                total
                itemCount
                createdAt
            }
            totalItems
        }
    }
`;

const UPDATE_ORDER_STATUS_MUTATION = `
    mutation UpdateOrderStatus($id: ID!, $input: AdminUpdateOrderInput!) {
        adminUpdateOrder(id: $id, input: $input) { id orderStatus }
    }
`;

interface DisplayOrder {
    id: string;
    reference: string;
    customer: string;
    itemsCount: number;
    total: number;
    status: FrontendStatus;
    createdAt: string;
}

const SORT_TO_BACKEND: Record<"date" | "total" | "status", string> = {
    date: "DATE",
    total: "TOTAL",
    status: "STATUS",
};

function toDisplayOrder(o: BackendAdminOrder): DisplayOrder {
    return {
        id: o.id,
        reference: o.orderCode,
        customer: o.user.fullName,
        itemsCount: o.itemCount,
        total: o.total,
        status: STATUS_FROM_BACKEND[o.orderStatus] ?? "pending",
        createdAt: new Date(o.createdAt).toLocaleDateString(),
    };
}

export function OrdersContent() {
    const [orders, setOrders] = useState<DisplayOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<"all" | FrontendStatus>("all");
    const [sortBy, setSortBy] = useState<"date" | "total" | "status">("date");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<DisplayOrder | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchOrders = () => {
        setLoading(true);
        gqlRequest<{ adminOrders: AdminOrderPage }>(ADMIN_ORDERS_QUERY, {
            status: status === "all" ? undefined : STATUS_TO_BACKEND[status],
            search: search.trim() || undefined,
            sort: SORT_TO_BACKEND[sortBy],
            direction: sortDir === "asc" ? "ASC" : "DESC",
            page: 1,
            pageSize: 100,
        })
            .then((res) => setOrders(res.adminOrders.items.map(toDisplayOrder)))
            .catch((err) =>
                toast.error(err instanceof Error ? err.message : "Failed to load orders."))
            .finally(() => setLoading(false));
    };

    useEffect(fetchOrders, [search, status, sortBy, sortDir, refreshKey]);

    const filtered = useMemo(() => orders, [orders]);

    const updateStatus = (o: DisplayOrder, next: FrontendStatus) => {
        gqlRequest(UPDATE_ORDER_STATUS_MUTATION, {
            id: o.id,
            input: {orderStatus: STATUS_TO_BACKEND[next]},
        })
            .then(() => {
                toast.success(`Order ${next.replace("_", " ")}.`);
                fetchOrders();
            })
            .catch((err) =>
                toast.error(err instanceof Error ? err.message : "Failed to update order."));
    };

    const columns: Column<DisplayOrder>[] = [
        {
            key: "reference",
            header: "Reference",
            render: (o) => (
                <Link
                    href={`/admin/orders/${o.id}`}
                    className="font-mono text-xs hover:underline"
                >
                    {o.reference}
                </Link>
            ),
        },
        {key: "customer", header: "Customer", render: (o) => o.customer},
        {key: "items", header: "Items", render: (o) => <span>{o.itemsCount}</span>},
        {
            key: "total",
            header: "Total",
            render: (o) => <span className="font-semibold">${o.total}</span>,
        },
        {
            key: "status",
            header: "Status",
            render: (o) => <StatusBadge status={o.status}/>,
        },
        {
            key: "date",
            header: "Date",
            render: (o) => <span className="text-sm text-admin-muted">{o.createdAt}</span>,
        },
    ];

    return (
        <div>
            <PageHeader title="Orders" description="Track and manage customer orders."/>

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="relative min-w-50 flex-1">
                    <Search
                        className="pointer-events-none absolute
                        left-3 top-1/2 size-4 -translate-y-1/2
                        text-admin-muted"/>
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search orders…"
                        className="border-admin-line bg-admin-surface pl-9"
                    />
                </div>
                <Select value={status} onValueChange={(v) => setStatus(v as "all" | FrontendStatus)}>
                    <SelectTrigger className="w-40 border-admin-line bg-admin-surface">
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {STATUSES.map((s) => (
                            <SelectItem key={s} value={s} className="capitalize">
                                {s.replace("_", " ")}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                    <SelectTrigger className="w-36 border-admin-line bg-admin-surface">
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="date">Sort: Date</SelectItem>
                        <SelectItem value="total">Sort: Total</SelectItem>
                        <SelectItem value="status">Sort: Status</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        setSortDir((d) =>
                            (d === "asc" ? "desc" : "asc"))}
                    className="border-admin-line"
                >
                    <ArrowUpDown className="mr-1.5 size-4"/>
                    {sortDir === "asc" ? "Asc" : "Desc"}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchOrders}
                    className="border-admin-line"
                >
                    <RefreshCw className="size-4"/>
                </Button>
                {/* No export endpoint on the backend — stays a demo toast. */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast("Exported")}
                    className="border-admin-line"
                >
                    <Download className="size-4"/> Export
                </Button>
            </div>

            <DataTable
                rows={filtered}
                columns={columns}
                emptyTitle={loading ? "Loading…" : "No orders found"}
                emptyDescription={loading ? "Fetching orders from the server." :
                                            "Try a different search or status filter."}
                rowActions={(o) => [
                    {
                        label: "Edit", onSelect: () => {
                            setEditing(o);
                            setFormOpen(true);
                        }
                    },
                    {label: "Mark processing", onSelect: () => updateStatus(o, "processing")},
                    {label: "Mark in transit", onSelect: () => updateStatus(o, "in_transit")},
                    {label: "Mark delivered", onSelect: () => updateStatus(o, "delivered")},
                    {label: "Cancel", onSelect: () => updateStatus(o, "cancelled"), destructive: true},
                ]}
            />

            <OrderFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                orderId={editing?.id ?? null}
                onSaved={() => setRefreshKey((k) => k + 1)}
            />
        </div>
    );
}

export type {FrontendStatus, DisplayOrder as OrderRowShape};
