import { useEffect } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { liveQuery } from "dexie";

export function useLiveQuerySignal<T, D extends T>(
  func: () => T | Promise<T>,
  deps?: unknown[],
  default_?: D,
) {
  const query = liveQuery(func);
  const signal = useSignal<D | T>(
    query.getValue?.() ?? default_ as D | T,
  );
  useEffect(() => {
    const subscription = query.subscribe((value) => {
      signal.value = value;
    });
    return () => {
      subscription.unsubscribe();
    };
  }, deps);
  return signal;
}
