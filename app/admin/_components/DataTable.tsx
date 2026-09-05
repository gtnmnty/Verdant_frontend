"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { EmptyState } from "@/app/admin/_components/EmptyState";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
}

export interface RowAction<T> {
  label: string;
  onSelect: (row: T) => void;
  destructive?: boolean;
}

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  rowActions,
  pageSize = 8,
  emptyTitle,
  emptyDescription,
  bulkActions,
}: {
  rows: T[];
  columns: Column<T>[];
  rowActions?: (row: T) => RowAction<T>[];
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  bulkActions?: (ids: string[], clear: () => void) => ReactNode;
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return rows;
    const factor = sortDir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av < bv) return -1 * factor;
      if (av > bv) return 1 * factor;
      return 0;
    });
  }, [rows, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const toggleAll = () => {
    setSelected((s) => {
      const all = paged.every((r) => s.has(r.id));
      const next = new Set(s);
      if (all) paged.forEach((r) => next.delete(r.id));
      else paged.forEach((r) => next.add(r.id));
      return next;
    });
  };

  const toggleOne = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const clearSelection = () => setSelected(new Set());

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle ?? "No records yet"} description={emptyDescription} />;
  }

  return (
    <div className="space-y-3">
      {selected.size > 0 && bulkActions ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-admin-line bg-admin-cream px-4 py-2.5 text-sm">
          <span className="font-medium">{selected.size} selected</span>
          <div className="flex items-center gap-2">
            {bulkActions(Array.from(selected), clearSelection)}
            <Button size="sm" variant="ghost" onClick={clearSelection}>
              Clear
            </Button>
          </div>
        </div>
      ) : null}

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-admin-line bg-admin-surface md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-admin-line bg-admin-cream/50 text-left text-xs uppercase tracking-wide text-admin-muted">
                <th className="w-10 px-4 py-3">
                  <Checkbox
                    checked={paged.length > 0 && paged.every((r) => selected.has(r.id))}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                  />
                </th>
                {columns.map((col) => (
                  <th key={col.key} className={`px-4 py-3 font-semibold ${col.className ?? ""}`}>
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className="inline-flex items-center gap-1 hover:text-admin-ink"
                      >
                        {col.header}
                        <ArrowUpDown className="size-3" />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                ))}
                {rowActions ? <th className="w-10 px-4 py-3" /> : null}
              </tr>
            </thead>
            <tbody>
              {paged.map((row) => (
                <tr key={row.id} className="border-b border-admin-line/60 last:border-b-0 hover:bg-admin-cream/40">
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selected.has(row.id)}
                      onCheckedChange={() => toggleOne(row.id)}
                      aria-label="Select row"
                    />
                  </td>
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 align-middle ${col.className ?? ""}`}>
                      {col.render(row)}
                    </td>
                  ))}
                  {rowActions ? (
                    <td className="px-2 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {rowActions(row).map((a, i, arr) => (
                            <span key={a.label}>
                              <DropdownMenuItem
                                onSelect={() => a.onSelect(row)}
                                className={a.destructive ? "text-admin-rose focus:text-admin-rose" : ""}
                              >
                                {a.label}
                              </DropdownMenuItem>
                              {i < arr.length - 1 && a.destructive ? <DropdownMenuSeparator /> : null}
                            </span>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="grid gap-3 md:hidden">
        {paged.map((row) => (
          <div key={row.id} className="rounded-xl border border-admin-line bg-admin-surface p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <Checkbox
                checked={selected.has(row.id)}
                onCheckedChange={() => toggleOne(row.id)}
                aria-label="Select row"
              />
              {rowActions ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {rowActions(row).map((a) => (
                      <DropdownMenuItem
                        key={a.label}
                        onSelect={() => a.onSelect(row)}
                        className={a.destructive ? "text-admin-rose focus:text-admin-rose" : ""}
                      >
                        {a.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
            <dl className="space-y-2 text-sm">
              {columns.map((col) => (
                <div key={col.key} className="grid grid-cols-[110px_minmax(0,1fr)] gap-2">
                  <dt className="text-xs uppercase tracking-wide text-admin-muted">{col.header}</dt>
                  <dd className="min-w-0 break-words">{col.render(row)}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      {totalPages > 1 ? (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.max(1, p - 1));
                }}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <PaginationItem key={n}>
                <PaginationLink
                  href="#"
                  isActive={n === safePage}
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(n);
                  }}
                >
                  {n}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.min(totalPages, p + 1));
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  );
}
