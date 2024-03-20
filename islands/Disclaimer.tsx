import { error } from "./Error.tsx";

export function Disclaimer() {
  return (
    <button
      onClick={() => {
        error.value = (
          <ul class="flex flex-col list-disc pl-5 gap-1.5">
            <li>telegram.tools is not affiliated with Telegram.</li>
            <li>
              All tools run inside your browser, and they don’t communicate with
              any server except Telegram.
            </li>
            <li>
              The contributors of telegram.tools are not responsible for how the
              visiting users use the provided services.
            </li>
            <li>
              The contributors of telegram.tools are not responsible for how
              Telegram deals with the user accounts the visiting users
              potentially sign into using the Telegram API app credentials
              provided by them.
            </li>
          </ul>
        );
      }}
    >
      Disclaimer
    </button>
  );
}
