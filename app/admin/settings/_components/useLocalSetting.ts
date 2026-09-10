"use client";

import { useEffect, useState } from "react";

// Stopgap for settings tabs with no backend model yet (Booking rules,
// Store settings, Notification preferences) — persists to the browser's
// localStorage so a save survives a page reload, instead of resetting to
// the hardcoded defaults every time. Replace with real gqlRequest calls
// once each of these has a backend query/mutation to save to.
export function useLocalSetting<T>(key: string, initial: T) {
  const storageKey = `verdant-admin-settings:${key}`;
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      // ignore malformed/missing data — fall back to initial
    } finally {
      setLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = (next: T) => {
    setValue(next);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // localStorage unavailable (private mode, quota, etc.) — value still
      // updates in memory for this session
    }
  };

  return { value, setValue: save, loaded };
}
