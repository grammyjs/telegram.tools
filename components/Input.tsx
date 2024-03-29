import { IS_BROWSER } from "$fresh/runtime.ts";
import { JSX } from "preact";

import { cn } from "../lib/cn.ts";

export function Input(props: JSX.HTMLAttributes<HTMLInputElement>) {
  return (
    <input
      autocomplete="off"
      autocapitalize="off"
      autoCorrect="off"
      spellCheck={false}
      {...props}
      disabled={!IS_BROWSER || props.disabled}
      class={cn(
        "bg-foreground-transparent placeholder:(text-foreground opacity-[.55]) rounded-lg w-full px-3 py-1.5 focus:(outline-none)",
        props.class,
      )}
      type={props.type ?? "text"}
    />
  );
}
