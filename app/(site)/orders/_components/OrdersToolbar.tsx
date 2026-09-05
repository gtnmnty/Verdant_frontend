import {Search} from "lucide-react";
import {Input} from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type {OrderStatus} from "@/app/(site)/orders/_components/data";

export type OrderFilter = "all" | OrderStatus;
export type OrderSort = "date-desc" | "date-asc" | "total-desc";

const FILTERS: [OrderFilter, string][] = [
    ["all", "All Orders"],
    ["processing", "Processing"],
    ["in-transit", "In Transit"],
    ["delivered", "Delivered"],
    ["cancelled", "Cancelled"],
];

export function OrdersToolbar({
    filter,
    onFilterChange,
    query,
    onQueryChange,
    sort,
    onSortChange,
}: {
    filter: OrderFilter;
    onFilterChange: (f: OrderFilter) => void;
    query: string;
    onQueryChange: (q: string) => void;
    sort: OrderSort;
    onSortChange: (s: OrderSort) => void;
}) {
    return (
        <section className="flex flex-col gap-4 pb-8 lg:flex-row
                 lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
                {FILTERS.map(([key, label]) => {
                    const active = filter === key;
                    return (
                        <button
                            key={key}
                            onClick={() => onFilterChange(key)}
                            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
                                active
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-blush/60 text-primary hover:bg-blush/30"
                            }`}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-64">
                    <Search className="pointer-events-none absolute left-3 top-1/2
                             h-4 w-4 -translate-y-1/2
                             text-on-surface-variant"/>
                    <Input
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        placeholder="Search by Order ID"
                        className="border-blush/60 bg-surface-lowest pl-10"
                    />
                </div>
                <Select value={sort} onValueChange={(v) => onSortChange(v as OrderSort)}>
                    <SelectTrigger className="w-full border-blush/60 bg-surface-lowest sm:w-48">
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="date-desc">Newest First</SelectItem>
                        <SelectItem value="date-asc">Oldest First</SelectItem>
                        <SelectItem value="total-desc">Highest Total</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </section>
    );
}
