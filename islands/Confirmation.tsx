import { signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { Button } from "../components/Button.tsx";

export const confirmation = signal<
  null | { title: string; description: string; onConfirm: () => void }
>(null);

export function Confirmation() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      e.key == "Escape" && (confirmation.value = null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);
  if (!confirmation.value) {
    return null;
  }
  return (
    <div
      class="w-full h-screen fixed top-0 left-0 bg-[#0005] dark:bg-[#fff1] p-5 flex items-center justify-center"
      onClick={(e) =>
        e.target == e.currentTarget && (confirmation.value = null)}
    >
      <div class="w-full max-w-lg p-5 bg-background rounded-xl flex flex-col gap-5 justify-between shadow-sm">
        <div class="flex flex-col gap-4">
          <p class="font-bold text-lg">{confirmation.value.title}</p>
          <p>
            {confirmation.value.description}
          </p>
          <div class="flex gap-4">
            <Button onClick={() => (confirmation.value = null)} muted>
              No
            </Button>
            <Button
              onClick={() => {
                confirmation.value?.onConfirm();
                confirmation.value = null;
              }}
              danger
            >
              Yes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
