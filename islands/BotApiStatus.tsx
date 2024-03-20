import { signal } from "@preact/signals";
import { Button } from "../components/Button.tsx";
import { Spinner } from "../components/icons/Spinner.tsx";

type Test = { state: "pinging" | "failed" } | { state: "pinged"; ping: number };

const tests = signal<Test>({ state: "pinging" });
const testInProgress = signal(false);

export function BotApiStatus() {
  if (testInProgress.value) {
    return <TestView />;
  }
  return (
    <>
      <main class="p-5 xl:p-10">
        <div class="flex flex-col select-none w-full max-w-sm mx-auto">
          <div class="grid grid-cols-2 gap-4">
            Bot API
          </div>
          <div class="text-xs opacity-50 pl-2 pt-2 pb-5">
            Click the button below to ping the Bot API servers.
          </div>
          <div class="flex flex-col gap-5">
            <Button
              onClick={() => startTest()}
            >
              Ping Bot API
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}

function TestView() {
  return (
    <>
      <main class="flex flex-col w-full pb-20 pt-5">
        {tests.value.state === "pinging" && (
          <div class="w-full px-5 py-3">
            <div class="flex flex-col w-full max-w-screen-lg mx-auto">
              <div class="text-[1.5rem] xl:text-[3rem] flex gap-3 items-center font-light">
                <div class="shrink-0">
                  <Spinner />
                </div>
                <span>Starting</span>
              </div>
            </div>
          </div>
        )}
        <div class="w-full px-5 py-3">
          <div class="flex flex-col w-full max-w-screen-lg mx-auto">
            <div class="text-[1rem] xl:text-[1.5rem]">
              <span class="font-bold">Bot API server</span>{" "}
              <span class="font-light opacity-50">Amsterdam</span>
            </div>
            <div
              class={`text-[1.5rem] xl:text-[3rem] flex gap-3 items-center font-light ${
                tests.value.state === "pinged"
                  ? tests.value.ping >= 200
                    ? "text-yellow-500"
                    : "text-green-600 dark:text-green-500"
                  : tests.value.state == "failed"
                  ? "text-red-600 dark:tegxt-red-500"
                  : ""
              }`}
            >
              {tests.value.state === "pinging" &&
                (
                  <div class="shrink-0">
                    <Spinner />
                  </div>
                )}
              <span>
                {{
                  "pinging": "Pinging",
                  "pinged": <>{tests.value.ping}ms</>,
                  "failed": "Connection failed",
                }[tests.value.state]}
              </span>
            </div>
          </div>
        </div>
      </main>
      {
        <div class="bg-gradient-to-t fixed bottom-0 p-5 from-[#0002] to-[#0000] w-full dark:(from-[#aaa1] to-[#fff0])">
          <div class="max-w-sm mx-auto">
            <Button onClick={restart}>
              {tests.value.state !== "pinging" ? "Restart" : "Abort"}
            </Button>
          </div>
        </div>
      }
    </>
  );
}

function restart() {
  tests.value = { state: "pinging", ping: 0 };
}

async function startTest() {
  testInProgress.value = true;
  const then = performance.now();
  try {
    const res = await fetch("https://api.telegram.org", {
      redirect: "follow",
      method: "HEAD",
      mode: "no-cors",
    });
    const now = performance.now();
    if (res.type !== "opaque") throw new Error("unexpected");
    tests.value = { state: "pinged", ping: Math.round(now - then) };
  } catch (e) {
    tests.value = { state: "failed" };
  }
}
