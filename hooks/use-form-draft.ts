"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Persists form state to localStorage as it changes, and restores it once on
 * mount. `loaded` only flips to true after the restore attempt finishes, so
 * the save effect below never fires on the first render with blank initial
 * values and clobbers a draft that hasn't been read back yet.
 *
 * localStorage only stores strings, so `T` must be JSON-serializable — don't
 * put File/Blob values (e.g. image uploads) in the draft.
 */
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
      // Storage unreadable (private mode, disabled, corrupt JSON) — start
      // from the initial value instead of crashing the form.
    } finally {
      setLoaded(true);
    }
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // Storage full/unavailable — the draft just won't persist this time.
    }
  }, [key, data, loaded]);

  const clearDraft = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
    setData(initialValueRef.current);
  }, [key]);

  return { data, setData, clearDraft, loaded };
}
