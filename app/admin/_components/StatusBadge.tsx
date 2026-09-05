import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  active: "bg-admin-sage text-admin-ink",
  inactive: "bg-admin-line text-admin-muted",
  suspended: "bg-admin-rose/15 text-admin-rose",
  draft: "bg-admin-blush text-admin-ink",
  published: "bg-admin-sage text-admin-ink",
  archived: "bg-admin-line text-admin-muted",
  pending: "bg-admin-blush text-admin-ink",
  approved: "bg-admin-sage text-admin-ink",
  rejected: "bg-admin-rose/15 text-admin-rose",
  confirmed: "bg-admin-sage text-admin-ink",
  upcoming: "bg-admin-sage text-admin-ink",
  waiting: "bg-admin-blush text-admin-ink",
  completed: "bg-admin-sage-deep text-admin-ink",
  delivered: "bg-admin-sage-deep text-admin-ink",
  in_transit: "bg-admin-amber/20 text-admin-ink",
  cancelled: "bg-admin-rose/15 text-admin-rose",
  processing: "bg-admin-blush text-admin-ink",
  featured: "bg-admin-amber/25 text-admin-ink",
  product: "bg-admin-blush text-admin-ink",
  service: "bg-admin-sage text-admin-ink",
};

function pretty(s: string) {
  return s.replace(/_/g, " ");
}

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const key = status.toLowerCase();
  const tone = TONES[key] ?? "bg-admin-line text-admin-muted";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        tone,
        className,
      )}
    >
      {pretty(status)}
    </span>
  );
}
