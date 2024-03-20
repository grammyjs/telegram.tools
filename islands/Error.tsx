import { ComponentChildren } from "preact";
import { effect, signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { Button } from "../components/Button.tsx";

export const error = signal<null | ComponentChildren>(null);

IS_BROWSER && effect(() => {
  if (error.value != null) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
});

export function Error({ onDismiss }: { onDismiss?: () => void }) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      e.key == "Escape" && (error.value = null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);
  if (!error.value) {
    return null;
  }
  function dismiss() {
    if (onDismiss) {
      onDismiss();
    } else {
      error.value = null;
    }
  }
  return (
    <div
      class="w-full h-screen fixed top-0 left-0 bg-[#0005] dark:bg-[#fff1] p-5 flex items-center justify-center"
      onClick={(e) => e.target == e.currentTarget && dismiss()}
    >
      <div class="w-full max-w-lg p-5 bg-background rounded-xl flex flex-col gap-5 justify-between shadow-sm">
        <div class="flex flex-col gap-4">
          <p>
            {error.value}
          </p>
          <Button
            onClick={dismiss}
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
