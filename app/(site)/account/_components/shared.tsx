import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import type {ReactNode} from "react";

export function SectionCard({children}: { children: ReactNode }) {
    return (
        <section className="rounded-2xl border border-blush/50
                 bg-surface-lowest p-6 sm:p-8">
            {children}
        </section>
    );
}

export function SectionTitle({title, action, className = "",}: {
    title: string;
    action?: { label: string; onClick: () => void };
    className?: string;
}) {
    return (
        <div className={`mb-5 flex items-end justify-between gap-4 ${className}`}>
            <h2 className="font-display text-[clamp(1.4rem,2.6vw,2rem)]
                 leading-tight tracking-tight text-primary">
                {title}
            </h2>
            {action && (
                <button
                    onClick={action.onClick}
                    className="shrink-0 text-xs font-semibold uppercase
                                    tracking-[0.18em] text-primary underline
                                    underline-offset-[6px]"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}

export function PageIntro({title, subtitle}: { title: string; subtitle: string }) {
    return (
        <div>
            <h2 className="font-display text-[clamp(2rem,4.5vw,3.25rem)]
                 leading-tight tracking-tight text-primary">
                {title}
            </h2>
            <p className="mt-2 text-sm text-on-surface-variant">{subtitle}</p>
        </div>
    );
}

export function EmptyBlock({
                               icon: Icon,
                               title,
                               body,
                               cta,
                           }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    body: string;
    cta?: string;
}) {
    return (
        <div className="rounded-2xl border border-dashed
                 border-blush/60 bg-surface-lowest p-10
                 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center
                 rounded-full bg-blush/30 text-primary">
                <Icon className="h-5 w-5"/>
            </div>
            <h3 className="mt-4 font-display text-xl text-primary">{title}</h3>
            <p className="mt-2 text-sm text-on-surface-variant">{body}</p>
            {cta && (
                <Button className="mt-5 rounded-full" onClick={() => toast.success("Opening…")}>
                    {cta}
                </Button>
            )}
        </div>
    );
}
