import { cloneElement, VNode } from "preact";
import { Signal, useSignal, useSignalEffect } from "@preact/signals";

export function Presence(
  { present, children }: {
    present: Signal<boolean>;
    // deno-lint-ignore no-explicit-any
    children: VNode<any>;
  },
) {
  const mounted = useSignal(present.value);
  useSignalEffect(() => void (present.value && (mounted.value = true)));
  if (!mounted.value) return null;
  return cloneElement(children, {
    onAnimationEnd: (e: Event) =>
      e.target == e.currentTarget && !present.value && (mounted.value = false),
  });
}
