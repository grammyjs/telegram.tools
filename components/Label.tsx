import { JSX } from "preact";

import { cn } from "../lib/cn.ts";

export function Label(props: JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      class={cn("flex flex-col gap-1.5", props.class)}
    />
  );
}
