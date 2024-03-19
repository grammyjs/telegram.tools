import { JSX } from "preact";

export function Caption(props: JSX.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} class="opacity-50 text-xs pl-2" />;
}
