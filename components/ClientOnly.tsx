import { IS_BROWSER } from "$fresh/runtime.ts";
import { ComponentChildren } from "preact";

export function ClientOnly(
  { children }: { children?: () => ComponentChildren },
) {
  return IS_BROWSER ? <>{children?.()}</> : null;
}
