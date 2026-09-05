import React from "react";

export function DetailCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-blush/50
                 bg-surface-lowest p-4 sm:p-6">
            <h2 className="font-display text-lg text-primary">{title}</h2>
            <div className="mt-3">{children}</div>
        </section>
    );
}

export function DetailRow({
      label,
      value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex flex-wrap items-start justify-between
                 gap-x-4 gap-y-1 border-b border-blush/30
                 py-2.5 last:border-0">
            <dt className="text-[10px] font-semibold uppercase
                 tracking-[0.16em] text-on-surface-variant">
                {label}
            </dt>
            <dd className="min-w-0 max-w-full wrap-break-word text-right
                 text-sm text-on-surface">
                {value}
            </dd>
        </div>
    );
}
