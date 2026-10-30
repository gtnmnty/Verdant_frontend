import {ApiError} from "@/utils/apiError";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

type TokenGetter = () => string | null;
type TokenSetter = (token: string | null) => void;
type ApiRequestOptions = RequestInit & {
    retryOnUnauthorized?: boolean;
    redirectOnUnauthorized?: boolean;
};

let getToken: TokenGetter = () => null;
let setToken: TokenSetter = () => {};
let refreshInFlight: Promise<string | null> | null = null;

export function configureApiClient(getter: TokenGetter, setter: TokenSetter) {
    getToken = getter;
    setToken = setter;
}

// Calls the /auth/refresh endpoint in the backend
// to get a new token in case the current one has expired
// or user refresh the pages.
// Every refresh in this tab must go through here (AuthContext's session restore too): refresh tokens rotate
// (M-37), so two refreshes sent with the same cookie make the backend refuse the second one.
export async function refreshAccessToken(): Promise<string | null> {
    if (refreshInFlight) return refreshInFlight;

    refreshInFlight = refreshAccessTokenOnce().then(async (token) => {
        if (token) return token;
        // Another tab sharing this cookie may have rotated it a moment ago: the backend then refuses the
        // old one, but that tab's response has already set the new cookie. One retry after a short pause
        // picks it up instead of signing this tab out.
        await new Promise((resolve) => setTimeout(resolve, 600));
        return refreshAccessTokenOnce();
    });
    try {
        return await refreshInFlight;
    } finally {
        refreshInFlight = null;
    }
}

async function refreshAccessTokenOnce(): Promise<string | null> {
    try {
        const response = await fetch(`${BASE_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include"
        });

        if (!response.ok) return null;
        const data = await response.json();
        return data.token ?? null;
    } catch {
        return null;
    }
}

// Parses the response from backend into a JSON format.
// Some endpoints (e.g. /auth/forgot-password, /auth/verify) answer 200 with a plain-text message;
// return that text rather than throwing, since the request itself succeeded.
async function parseJsonResponse<T>(response: Response): Promise<T> {
    const text = await response.text();
    if (!text) return undefined as T;
    try {
        return JSON.parse(text) as T;
    } catch {
        return text as T;
    }
}

// REST errors always come back as ErrorResponse { timestamp, status, error, message, path }
// (see GlobalExceptionHandler). Extract just the human-readable `message` for the thrown
// Error, falling back to the raw text if the body isn't JSON (e.g. a proxy/502 page).
// Returns an ApiError carrying the HTTP status and, on a 429, the backend's Retry-After (seconds), so forms
// can start a cooldown.
async function errorFromResponse(response: Response): Promise<Error> {
    const text = await response.text();
    const retryAfterHeader = Number(response.headers.get("Retry-After"));
    const retryAfter = Number.isFinite(retryAfterHeader) && retryAfterHeader > 0 ? retryAfterHeader : undefined;
    try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed.message === "string") {
            return new ApiError(parsed.message, undefined, response.status, retryAfter);
        }
    } catch {
        // not JSON — fall through to raw text below
    }
    return new ApiError(text || `Request failed with status ${response.status}`, undefined, response.status, retryAfter);
}

// Central fetch wrapper for all authenticated API requests
// Automatically attaches the access token and retries once on 401
// using the refresh token before redirecting to log in.
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const {
        retryOnUnauthorized = true,
        redirectOnUnauthorized = false,
        ...requestOptions
    } = options;
    const token = getToken();

    // Check if body is FormData (e.g., avatar upload).
    // For FormData, the browser must set the multipart boundary header automatically.
    const isFormData = typeof FormData !== "undefined" && requestOptions.body instanceof FormData;

    const headers: Record<string, string> = {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(requestOptions.headers as Record<string, string> ?? {}),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${path}`, {
        ...requestOptions,
        headers,
        credentials: "include",
    });

    if (response.status === 401 && retryOnUnauthorized && !path.startsWith("/auth/")) {
        const newToken = await refreshAccessToken();

        if (newToken) {
            setToken(newToken)
            headers["Authorization"] = `Bearer ${newToken}`;
            const retry = await fetch(`${BASE_URL}${path}`, {
                ...requestOptions,
                headers,
                credentials: "include",
            })

            if (retry.status === 401) {
                setToken(null);
                redirectToLogin(redirectOnUnauthorized);
                throw new Error("Session expired");
            }

            if (!retry.ok) throw await errorFromResponse(retry);
            return parseJsonResponse<T>(retry);
        }

        setToken(null);
        redirectToLogin(redirectOnUnauthorized);
        throw new Error("Session expired");
    }
    if (!response.ok) throw await errorFromResponse(response);
    return parseJsonResponse<T>(response);
}

function redirectToLogin(shouldRedirect: boolean) {
    if (shouldRedirect && typeof window !== "undefined") {
        window.location.assign("/auth");
    }
}