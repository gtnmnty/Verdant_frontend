import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DetailHeader({
  backHref,
  backLabel,
  title,
  subtitle,
  status,
  actions,
}: {
  backHref: string;
  backLabel: string;
  title: string;
  subtitle?: string;
  status?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5">
      <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 text-admin-muted">
        <Link href={backHref}>
          <ChevronLeft className="mr-1 size-4" />
          {backLabel}
        </Link>
      </Button>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="truncate font-display text-2xl sm:text-3xl">{title}</h1>
            {status}
          </div>
          {subtitle ? <p className="mt-1 text-sm text-admin-muted">{subtitle}</p> : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}

export function DetailGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">{children}</div>;
}

export function DetailCard({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl bg-admin-surface p-5 shadow-sm ${className}`}>
      {title ? <h2 className="mb-4 font-display text-lg">{title}</h2> : null}
      {children}
    </section>
  );
}

export function FieldRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-admin-line/60 py-2.5 text-sm last:border-b-0">
      <dt className="shrink-0 text-admin-muted">{label}</dt>
      <dd className="min-w-0 text-right font-medium">{value}</dd>
    </div>
  );
}
