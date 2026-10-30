import {useCallback, useEffect, useState} from "react";
import {rateLimitWaitSeconds} from "@/utils/apiError";

// After a rate-limit rejection (429), keeps a form's submit button disabled until the backend will accept
// the next attempt, with a countdown for its label. Retrying early only counts against the same limit.
//
//   const cooldown = useCooldown();
//   ... catch (err) { if (!cooldown.startFrom(err)) toast.error(...) }
//   <Button disabled={cooldown.active}>{cooldown.active ? cooldown.label : "Sign in"}</Button>
export function useCooldown() {
    const [until, setUntil] = useState<number | null>(null);
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        if (until === null) return;
        const timer = setInterval(() => {
            const t = Date.now();
            setNow(t);
            if (t >= until) setUntil(null);
        }, 1000);
        return () => clearInterval(timer);
    }, [until]);

    const secondsLeft = until === null ? 0 : Math.max(0, Math.ceil((until - now) / 1000));

    // Starts the cooldown if `err` is a rate-limit rejection and returns true (the caller still shows the
    // message); returns false for any other error.
    const startFrom = useCallback((err: unknown): boolean => {
        const wait = rateLimitWaitSeconds(err);
        if (wait === null) return false;
        const t = Date.now();
        setNow(t);
        setUntil(t + wait * 1000);
        return true;
    }, []);

    return {
        active: secondsLeft > 0,
        secondsLeft,
        // "Try again in 42s" / "Try again in 12 min"
        label: secondsLeft >= 120
            ? `Try again in ${Math.ceil(secondsLeft / 60)} min`
            : `Try again in ${secondsLeft}s`,
        startFrom,
    };
}
