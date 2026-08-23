"use client"

import React, { createContext, useContext, useState, useEffect } from "react";
import { configureApiClient, apiRequest } from "@/utils/apiClient";

type AuthCtx = {
    token: string | null;
    setToken: (t: string | null) => void;
};

const context = createContext<AuthCtx>({ token: null, setToken: () => { } });

export function AuthProvider({ children } :  { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);

    // Wires up apiClient to read and write token
    useEffect(() => {
        configureApiClient(() => token, setToken)
    }, [token]);

    useEffect(() => {
        apiRequest<{accessToken: string}>("/auth/refresh", { method: "POST" })
            .then((d) => setToken(d.accessToken))
            .catch(() => {})
    }, []);

    return <context.Provider value={{ token, setToken }}>{children}</context.Provider>;
}

export const useAuth = () => useContext(context);