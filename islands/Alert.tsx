import { useEffect } from "preact/hooks";
import { Signal } from "@preact/signals";

import { Button } from "../components/Button.tsx";
import { Precense } from "../components/Precense.tsx";

export function Alert(
  { present }: {
    present: Signal<boolean>;
  },
) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      e.key == "Escape" && (present.value = false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <Precense present={present}>
      <div
        class={`w-full h-screen fixed top-0 left-0 bg-[#0005] dark:bg-[#fff1] flex p-5 items-center justify-center duration-100 ${
          present.value
            ? "pointer-events-auto animate-in-opacity"
            : "pointer-events-none animate-out-opacity"
        }`}
        onClick={(e) => e.target == e.currentTarget && (present.value = false)}
      >
        <div
          class={`w-full max-w-lg p-5 bg-background rounded-xl min-h-[200px] flex flex-col gap-5 justify-between shadow-sm duration-100 ${
            present.value ? "animate-in-scale" : "animate-out-scale"
          }`}
        >
          <div class="flex flex-col gap-4">
            <p class="font-bold text-lg">How does this work?</p>
            <p>
              The statuses aren’t fetched from any server, rather determined
              from your browser by directly attempting to communicate with
              Telegram.
            </p>
            <p>
              This can be confirmed by monitoring the requests made while a
              connectivity test is in progress.
            </p>
            <p class="font-bold text-lg">Why does it take so long?</p>
            <p>
              Exchanging encryption keys might take a little time. After the
              keys are exchaged, they are stored locally in your browser, which
              makes future tests take much less time.
            </p>
          </div>
          <Button onClick={() => present.value = false}>Dismiss</Button>
        </div>
      </div>
    </Precense>
  );
}
