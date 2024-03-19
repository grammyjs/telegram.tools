import { StateUpdater, useEffect } from "preact/hooks";
import { Button } from "../components/Button.tsx";

export function Alert(
  { visible, setVisible }: {
    visible: boolean;
    setVisible: StateUpdater<boolean>;
  },
) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      e.key == "Escape" && setVisible(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);
  if (!visible) {
    return null;
  }
  return (
    <div
      class="w-full h-screen fixed top-0 left-0 bg-[#0005] dark:bg-[#fff1] p-5 flex items-center justify-center"
      onClick={(e) => e.target == e.currentTarget && setVisible(false)}
    >
      <div class="w-full max-w-lg p-5 bg-background rounded-xl min-h-[200px] flex flex-col gap-5 justify-between shadow-sm">
        <div class="flex flex-col gap-4">
          <p class="font-bold text-lg">How does this work?</p>
          <p>
            The statuses aren’t fetched from any server, rather determined from
            your browser by directly attempting to communicate with Telegram.
          </p>
          <p>
            This can be confirmed by monitoring the requests made while a
            connectivity test is in progress.
          </p>
          <p class="font-bold text-lg">Why does it take so long?</p>
          <p>
            Exchanging encryption keys might take a little time. After the keys
            are exchaged, they are stored locally in your browser, which makes
            future tests take much less time.
          </p>
        </div>
        <Button onClick={() => setVisible(false)}>Dismiss</Button>
      </div>
    </div>
  );
}
