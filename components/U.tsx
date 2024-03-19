import { ComponentChildren } from "preact";

export function U({ children }: { children?: ComponentChildren }) {
  return <span class="xl:underline">{children}</span>;
}
