import React from "react";

export function SectionLabel({children}: { children: React.ReactNode }) {
    return (
        <p className="text-fluid-2xs tracking-[0.35em] uppercase text-rose-400 font-medium">
            {children}
        </p>
    );
}
