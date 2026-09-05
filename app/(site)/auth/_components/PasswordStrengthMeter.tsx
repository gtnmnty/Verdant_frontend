function getStrength(password: string) {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return Math.min(score, 4);
}

const LABELS = ["Too Weak", "Weak", "Fair", "Good", "Strong"];
const COLORS = [
    "bg-rose-300",
    "bg-rose-400",
    "bg-amber-400",
    "bg-lime-500",
    "bg-emerald-500",
];

export function PasswordStrengthMeter({password}: { password: string }) {
    if (!password) return null;
    const strength = getStrength(password);

    return (
        <div className="mt-1.5">
            <div className="flex gap-1.5">
                {Array.from({length: 4}).map((_, i) => (
                    <span
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                            i < strength ? COLORS[strength] : "bg-muted"
                        }`}
                    />
                ))}
            </div>
            <p className="mt-1.5 text-[11px] font-medium text-on-surface-variant">
                {LABELS[strength]}
            </p>
        </div>
    );
}
