import { JSX } from "preact";

export function ExternalLink(props: JSX.HTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      {...props}
      class="text-grammy"
      target="_blank"
      rel="noopener noreferrer"
    />
  );
}
