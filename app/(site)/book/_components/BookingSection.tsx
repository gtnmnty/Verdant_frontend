import React from "react";

export function BookingSection({
   number, title, children}: { number: string; title: string; children: React.ReactNode;
}) {
    return (
        <section>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-soft-rose">
                {number}. {title}
            </p>
            <div className="mt-6 border-t border-blush/40 pt-6">{children}</div>
        </section>
    );
}
