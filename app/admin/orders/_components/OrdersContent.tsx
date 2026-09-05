"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, Download, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/app/admin/_components/PageHeader";
import { DataTable, type Column } from "@/app/admin/_components/DataTable";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { OrderFormDialog } from "@/app/admin/orders/_components/OrderFormDialog";
import { useAdmin } from "@/lib/admin/store";
import type { Order, OrderStatus } from "@/lib/admin/types";

const STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "in_transit",
  "delivered",
  "cancelled",
];

export function OrdersContent() {
  const { orders, setOrders } = useAdmin();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | OrderStatus>("all");
  const [sortBy, setSortBy] = useState<"date" | "total" | "status">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = orders.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      if (!q) return true;
      return (
        o.reference.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q)
      );
    });

    const dir = sortDir === "asc" ? 1 : -1;
    list = [...list].sort((a, b) => {
      const av = sortBy === "date" ? a.createdAt : sortBy === "total" ? a.total : a.status;
      const bv = sortBy === "date" ? b.createdAt : sortBy === "total" ? b.total : b.status;
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return list;
  }, [orders, search, status, sortBy, sortDir]);

  const openEdit = (o: Order) => {
    setEditing(o);
    setFormOpen(true);
  };

  const updateStatus = (o: Order, next: OrderStatus) => {
    setOrders((prev) =>
      prev.map((row) => (row.id === o.id ? { ...row, status: next } : row)),
    );
    toast.success(`Order ${next.replace("_", " ")}.`);
  };

  const columns: Column<Order>[] = [
    {
      key: "reference",
      header: "Reference",
      sortable: true,
      sortValue: (o) => o.reference,
      render: (o) => (
        <Link
          href={`/admin/orders/${o.id}`}
          className="font-mono text-xs hover:underline"
        >
          {o.reference}
        </Link>
      ),
    },
    { key: "customer", header: "Customer", render: (o) => o.customer },
    { key: "items", header: "Items", render: (o) => <span>{o.itemsCount}</span> },
    {
      key: "total",
      header: "Total",
      sortable: true,
      sortValue: (o) => o.total,
      render: (o) => <span className="font-semibold">${o.total}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (o) => <StatusBadge status={o.status} />,
    },
    {
      key: "date",
      header: "Date",
      sortable: true,
      sortValue: (o) => o.createdAt,
      render: (o) => <span className="text-sm text-admin-muted">{o.createdAt}</span>,
    },
  ];

  return (
    <div>
      <PageHeader title="Orders" description="Track and manage customer orders." />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-admin-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders…"
            className="border-admin-line bg-admin-surface pl-9"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as "all" | OrderStatus)}>
          <SelectTrigger className="w-40 border-admin-line bg-admin-surface">
            <SelectValue />
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
            <SelectValue />
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
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          className="border-admin-line"
        >
          <ArrowUpDown className="mr-1.5 size-4" />
          {sortDir === "asc" ? "Asc" : "Desc"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast("Refreshed")}
          className="border-admin-line"
        >
          <RefreshCw className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast("Exported")}
          className="border-admin-line"
        >
          <Download className="size-4" /> Export
        </Button>
      </div>

      <DataTable
        rows={filtered}
        columns={columns}
        emptyTitle="No orders found"
        emptyDescription="Try a different search or status filter."
        rowActions={(o) => [
          { label: "Edit", onSelect: () => openEdit(o) },
          { label: "Mark processing", onSelect: () => updateStatus(o, "processing") },
          { label: "Mark in transit", onSelect: () => updateStatus(o, "in_transit") },
          { label: "Mark delivered", onSelect: () => updateStatus(o, "delivered") },
          { label: "Cancel", onSelect: () => updateStatus(o, "cancelled"), destructive: true },
        ]}
      />

      <OrderFormDialog open={formOpen} onOpenChange={setFormOpen} order={editing} />
    </div>
  );
}
