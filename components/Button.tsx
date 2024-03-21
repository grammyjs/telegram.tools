import { IS_BROWSER } from "$fresh/runtime.ts";
import { JSX } from "preact";

export function Button(
  props: JSX.HTMLAttributes<HTMLButtonElement> & {
    danger?: boolean;
    muted?: boolean;
  },
) {
  return (
    <button
      {...props}
      disabled={!IS_BROWSER || props.disabled}
      class={`${
        props.danger
          ? "bg-border text-red-500"
          : props.muted
          ? "bg-border"
          : "bg-button-background text-button-text"
      } font-medium rounded-lg w-full px-4 py-1.5 disabled:opacity-50 shadow-sm text-center flex items-center justify-center gap-1.5`}
    />
  );
}
