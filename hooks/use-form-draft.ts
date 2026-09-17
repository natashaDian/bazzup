"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useFormDraft<T extends Record<string, unknown>>(
  key: string,
  initialValue: T,
) {
  const [data, setData] = useState<T>(initialValue);
  const [loaded, setLoaded] = useState(false);
  const initialValueRef = useRef(initialValue);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        setData({ ...initialValueRef.current, ...JSON.parse(raw) });
      }
    } catch {
    } finally {
      setLoaded(true);
    }
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(data));
    } catch {
    }
  }, [key, data, loaded]);

  const clearDraft = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
    }
    setData(initialValueRef.current);
  }, [key]);

  return { data, setData, clearDraft, loaded };
}
