export function AuthCard({
    eyebrow,
    title,
    subtitle,
    children,
}: {
    eyebrow: string;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <header className="text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-soft-rose">
                    {eyebrow}
                </p>
                <h1 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.5rem)] leading-tight tracking-tight text-primary">
                    {title}
                </h1>
                {subtitle && (
                    <p className="mx-auto mt-3 max-w-xs text-sm text-on-surface-variant">
                        {subtitle}
                    </p>
                )}
            </header>
            <div className="mt-8">{children}</div>
        </div>
    );
}
