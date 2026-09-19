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
// or user refresh the pages
async function refreshAccessToken(): Promise<string | null> {
    if (refreshInFlight) return refreshInFlight;

    refreshInFlight = refreshAccessTokenOnce();
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
        return data.accessToken ?? null;
    } catch {
        return null;
    }
}

// Parses the response from backend into a JSON format.
async function parseJsonResponse<T>(response: Response): Promise<T> {
    const text = await response.text();
    return text ? JSON.parse(text) as T : undefined as T;
}

// REST errors always come back as ErrorResponse { timestamp, status, error, message, path }
// (see GlobalExceptionHandler). Extract just the human-readable `message` for the thrown
// Error, falling back to the raw text if the body isn't JSON (e.g. a proxy/502 page).
async function errorFromResponse(response: Response): Promise<Error> {
    const text = await response.text();
    try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed.message === "string") {
            return new Error(parsed.message);
        }
    } catch {
        // not JSON — fall through to raw text below
    }
    return new Error(text || `Request failed with status ${response.status}`);
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
