import type { ReactNode } from "react";

export function SettingsCard({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-admin-line bg-admin-surface p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg">{title}</h3>
          {description ? <p className="text-xs text-admin-muted">{description}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function SettingRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2 border-b border-admin-line/60 py-3 last:border-b-0 sm:grid-cols-[minmax(160px,220px)_minmax(0,1fr)] sm:items-center">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint ? <p className="text-xs text-admin-muted">{hint}</p> : null}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
