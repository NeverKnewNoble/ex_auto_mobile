import { useCallback, useState } from "react";
import { useToast } from "@/components/toast";

/**
 * Wraps a write call (services.md "toast-on-action"): runs it with a busy flag,
 * toasts the success message, and surfaces the cleaned Frappe error on failure.
 */
export function useAction() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const run = useCallback(
    async <T,>(fn: () => Promise<T>, opts: { success?: string; onDone?: (r: T) => void } = {}): Promise<T | undefined> => {
      setBusy(true);
      try {
        const result = await fn();
        if (opts.success) toast.success(opts.success);
        opts.onDone?.(result);
        return result;
      } catch (e) {
        toast.error((e as Error).message);
        return undefined;
      } finally {
        setBusy(false);
      }
    },
    [toast]
  );

  return { run, busy };
}
