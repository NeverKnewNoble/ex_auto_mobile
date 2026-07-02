import { useCallback, useEffect, useRef, useState } from "react";

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  /** Re-run silently (no spinner flash) — for pull-to-refresh / after an action. */
  refresh: () => Promise<void>;
  /** Optimistic local update. */
  setData: (updater: T | ((prev: T | null) => T)) => void;
}

/**
 * Reads are silent (services.md): show a spinner on first load, then keep stale
 * data on refresh. `deps` re-fetch when they change (e.g. a filter or id).
 */
export function useFetch<T>(fn: () => Promise<T>, deps: unknown[] = []): FetchState<T> {
  const [data, setDataState] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const run = useCallback(async (initial: boolean) => {
    if (initial) setLoading(true);
    setError(null);
    try {
      const result = await fnRef.current();
      setDataState(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    run(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const setData = useCallback((updater: T | ((prev: T | null) => T)) => {
    setDataState((prev) => (typeof updater === "function" ? (updater as (p: T | null) => T)(prev) : updater));
  }, []);

  return { data, loading, error, refresh: () => run(false), setData };
}
