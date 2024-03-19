import { ComponentChildren } from "preact";
import { IS_BROWSER } from "$fresh/runtime.ts";

export function ClientOnly(
  { children }: { children?: () => ComponentChildren },
) {
  return IS_BROWSER ? <>{children?.()}</> : null;
}
