import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export function EmptyState({
  title = "Nothing here yet",
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-admin-line bg-admin-surface/60 p-10 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-admin-sage/40 text-admin-ink">
        <Inbox className="size-5" />
      </div>
      <h3 className="font-display text-lg">{title}</h3>
      {description ? (
        <p className="max-w-sm text-sm text-admin-muted">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
