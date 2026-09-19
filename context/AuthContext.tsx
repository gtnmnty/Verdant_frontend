"use client"

import React, { createContext, useContext, useState, useEffect } from "react";
import { configureApiClient, apiRequest } from "@/utils/apiClient";

type AuthCtx = {
    token: string | null;
    setToken: (t: string | null) => void;
    logout: () => Promise<void>;
    // True until the initial /auth/refresh attempt (below) has resolved either
    // way. Lets pages tell "haven't checked session yet" apart from "checked,
    // and there's no session" — token===null is ambiguous between those two
    // on its own, since it starts at null before the check even runs.
    loading: boolean;
};

const context = createContext<AuthCtx>({
    token: null,
    setToken: () => { },
    logout: async () => { },
    loading: true,
});

export function AuthProvider({ children } :  { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Wire up the apiClient callbacks synchronously during render.
    // This ensures that any child component or effect calling apiRequest() immediately has access
    // to the latest token getter and setter, avoiding race conditions where effects fire before
    // configureApiClient would have been called in a separate useEffect.
    configureApiClient(() => token, setToken);

    // Attempt silent session restoration on initial mount.
    // Sends the HTTP-only refresh cookie to the /auth/refresh endpoint.
    // If valid, receives a fresh short-lived JWT access token and updates React state.
    useEffect(() => {
        apiRequest<{accessToken: string}>("/auth/refresh", {
            method: "POST",
            retryOnUnauthorized: false,
        })
            .then((d) => setToken(d.accessToken))
            .catch(() => {
                // Not authenticated or refresh token expired; user stays logged out.
            })
            .finally(() => setLoading(false));
    }, []);

    // /auth/logout requires the refresh-token cookie via @CookieValue; if it's
    // already missing/expired the backend returns 400 before the controller
    // even runs, so retryOnUnauthorized is off — no point letting apiRequest
    // attempt its 401-retry-refresh dance on the way out.
    const logout = async () => {
        try {
            await apiRequest("/auth/logout", { method: "POST", retryOnUnauthorized: false });
        } catch {
            // refresh cookie missing/expired — fine, we're clearing local state regardless
        } finally {
            setToken(null);
        }
    };

    return <context.Provider value={{ token, setToken, logout, loading }}>{children}</context.Provider>;
}

export const useAuth = () => useContext(context);