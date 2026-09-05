import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Status } from "@/app/(site)/appointments/_components/data";

export type SortKey = "date-asc" | "date-desc" | "price-asc" | "price-desc";
export type FilterKey = "all" | Status;

const FILTERS: [FilterKey, string][] = [
  ["all", "All"],
  ["pending", "Pending"],
  ["upcoming", "Upcoming"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
];

export function AppointmentsSidebar({
  filter,
  onFilterChange,
  counts,
  sort,
  onSortChange,
}: {
  filter: FilterKey;
  onFilterChange: (f: FilterKey) => void;
  counts: Record<FilterKey, number>;
  sort: SortKey;
  onSortChange: (s: SortKey) => void;
}) {
  return (
    <aside className="space-y-6">
      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
          Filter by status
        </p>
        <ul className="space-y-2">
          {FILTERS.map(([key, label]) => {
            const active = filter === key;
            return (
              <li key={key}>
                <button
                  onClick={() => onFilterChange(key)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-blush/50 bg-surface-lowest text-on-surface hover:border-primary/40"
                  }`}
                >
                  {label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      active ? "bg-primary-foreground/20" : "bg-blush/60 text-primary"
                    }`}
                  >
                    {counts[key]}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <Label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
          Sort
        </Label>
        <Select value={sort} onValueChange={(v) => onSortChange(v as SortKey)}>
          <SelectTrigger className="w-full rounded-full border-blush/60 bg-surface-lowest">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-asc">Date: Soonest</SelectItem>
            <SelectItem value="date-desc">Date: Latest</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-blush/50 bg-surface-lowest p-5">
        <h3 className="font-display text-xl text-primary">Availability</h3>
        <p className="mt-2 text-sm text-on-surface-variant">
          Need a new session? Our stylists have openings this weekend.
        </p>
        <Button
          asChild
          variant="outline"
          className="mt-4 w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Link href="/book">View Full Calendar</Link>
        </Button>
      </div>
    </aside>
  );
}
