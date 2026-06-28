"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { configureApiClient } from "@/utils/apiClient";

interface User {
  id: string;
  email: string;
  fullName: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
}

interface AuthContextValue extends AuthState {
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const BASE_URL = process.env.NEXT_PUBLIC_API_URL!;
const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL!;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ user: null, accessToken: null });
  const [isLoading, setIsLoading] = useState(true);

  const setToken = useCallback((token: string | null) => {
    setAuth((prev) => ({ ...prev, accessToken: token }));
  }, []);

  const getToken = useCallback(() => auth.accessToken, [auth.accessToken]);

  useEffect(() => {
    configureApiClient(getToken, setToken);
  }, [getToken, setToken]);

  // Silent refresh on mount
  useEffect(() => {
    async function restoreSession() {
      console.log("restoreSession fired");
      try {
        const res = await fetch(`${BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          const token = data.token;

          const meRes = await fetch(`${GRAPHQL_URL}`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ query: `{ me { id email fullName } }` }),
          });

          const meData = await meRes.json();
          const user = meData.data?.me ?? null;
          setAuth({ accessToken: token, user });
        }
      } catch {
        // Backend unreachable or no session — treat as logged out
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  const login = useCallback((token: string, user: User) => {
    setAuth({ accessToken: token, user });
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setAuth({ user: null, accessToken: null });
      window.location.href = "/auth";
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}