import { IS_BROWSER } from "$fresh/runtime.ts";
import { ComponentChildren } from "preact";
import { useEffect } from "preact/hooks";
import { effect, signal } from "@preact/signals";

import { Button } from "../components/Button.tsx";

export type ModalContent = null | ComponentChildren | (() => ComponentChildren);

const content = signal<ModalContent>(null);
const showDismissButton = signal(true);
const autoDismiss = signal(true);

IS_BROWSER && effect(() => {
  if (content.value == null) {
    showDismissButton.value = true;
    autoDismiss.value = true;
  }
});

IS_BROWSER && effect(() => {
  if (content.value != null) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
});

export function isModalVisible() {
  return content.value != null;
}

export function setModalContent(
  content_: ModalContent,
  autoDismiss_?: boolean,
  showDismissButton_?: boolean,
) {
  if (content_ == null) {
    showDismissButton.value = true;
    autoDismiss.value = true;
  } else {
    if (typeof autoDismiss_ === "boolean") {
      autoDismiss.value = autoDismiss_;
    }
    if (typeof showDismissButton_ === "boolean") {
      showDismissButton.value = showDismissButton_;
    }
  }
  content.value = content_;
}

export function hideModal() {
  setModalContent(null);
}

export function displayError(err: unknown, context?: string) {
  setModalContent(context ? `${context}: ${err}` : String(err));
}

export function Modal({ onDismiss }: { onDismiss?: () => void }) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      e.key == "Escape" && (content.value = null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);
  if (!content.value) {
    return null;
  }
  function dismiss() {
    if (onDismiss) {
      onDismiss();
    } else {
      content.value = null;
    }
  }
  return (
    <div
      class="w-full h-screen fixed top-0 left-0 bg-[#0005] dark:bg-[#fff1] p-5 flex items-center justify-center"
      onClick={(e) =>
        e.target == e.currentTarget && autoDismiss.value && dismiss()}
    >
      <div class="w-full max-w-lg p-5 bg-background rounded-xl flex flex-col gap-5 justify-between shadow-sm">
        <div class="flex flex-col gap-4">
          {typeof content.value === "string"
            ? (
              <p>
                {content.value}
              </p>
            )
            : typeof content.value === "function"
            ? content.value()
            : content.value}
          {showDismissButton.value && (
            <Button
              onClick={dismiss}
            >
              Dismiss
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
