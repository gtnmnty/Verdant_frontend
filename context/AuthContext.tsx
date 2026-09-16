"use client"

import React, { createContext, useContext, useState, useEffect } from "react";
import { configureApiClient, apiRequest } from "@/utils/apiClient";

type AuthCtx = {
    token: string | null;
    setToken: (t: string | null) => void;
    logout: () => Promise<void>;
};

const context = createContext<AuthCtx>(
    { token: null, setToken: () => { }, logout: async () => { } }
);

export function AuthProvider({ children } :  { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);

    // Flow Step 1: Wire up the apiClient callbacks synchronously during render.
    // This ensures that any child component or effect calling apiRequest() immediately has access
    // to the latest token getter and setter, avoiding race conditions where effects fire before
    // configureApiClient would have been called in a separate useEffect.
    configureApiClient(() => token, setToken);

    // Flow Step 2: Attempt silent session restoration on initial mount.
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
            });
    }, []);

    const logout = async () => {
        try {
            await apiRequest("/auth/logout", {
                method: "POST",
                retryOnUnauthorized: false
            });
        } catch {

        } finally {

        }
    }

    return <context.Provider value={{ token, setToken, logout }}>{children}</context.Provider>;
}

export const useAuth = () => useContext(context);
