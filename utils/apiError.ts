// An error from the backend that keeps its machine-readable code and HTTP-like status, so callers can react
// to a specific case (reload on CONCURRENT_MODIFICATION, cooldown on 429) instead of only showing the message.
// Still an Error, so existing `err instanceof Error ? err.message : ...` handling keeps working.
// Thrown by both apiRequest (REST) and gqlRequest (GraphQL).
export class ApiError extends Error {
    readonly code?: string;
    readonly status?: number;
    // Seconds until a rate-limited request may be retried (Retry-After / extensions.retryAfter), when known.
    readonly retryAfter?: number;

    constructor(message: string, code?: string, status?: number, retryAfter?: number) {
        super(message);
        this.name = "ApiError";
        this.code = code;
        this.status = status;
        this.retryAfter = retryAfter;
    }
}

// Someone else saved the same record after this screen loaded it (409). Reload, then redo the change.
export function isConcurrentModification(err: unknown): boolean {
    return err instanceof ApiError && err.code === "CONCURRENT_MODIFICATION";
}

// How long to wait after a rate-limit rejection (HTTP 429 / TOO_MANY_REQUESTS), or null if `err` isn't one.
// Falls back to 30 s when the backend didn't say.
export function rateLimitWaitSeconds(err: unknown): number | null {
    if (!(err instanceof ApiError)) return null;
    if (err.status !== 429 && err.code !== "TOO_MANY_REQUESTS") return null;
    return err.retryAfter && err.retryAfter > 0 ? Math.ceil(err.retryAfter) : 30;
}
