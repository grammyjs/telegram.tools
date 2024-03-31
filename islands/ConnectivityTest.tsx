import { IS_BROWSER } from "$fresh/runtime.ts";
import { signal, useSignal } from "@preact/signals";

import type { DC } from "mtkruto/mod.ts";

import { decodeHex, encodeHex } from "../lib/hex.ts";
import { prefixedLocalStorage } from "../lib/prefixed_storage.ts";

import { Button } from "../components/Button.tsx";
import { Spinner } from "../components/icons/Spinner.tsx";

import { Alert } from "./Alert.tsx";
import { Select } from "./Select.tsx";

const localStorage = prefixedLocalStorage("connectivity-test");

const dcs: { id: DC; name: string; location: string }[] = [
  { id: "1", name: "DC1", location: "Miami" },
  { id: "2", name: "DC2", location: "Amsterdam" },
  { id: "3", name: "DC3", location: "Miami" },
  { id: "4", name: "DC4", location: "Amsterdam" },
  { id: "5", name: "DC5", location: "Singapore" },
  { id: "1-test", name: "DC1 (Test)", location: "Miami" },
  { id: "2-test", name: "DC2 (Test)", location: "Amsterdam" },
  { id: "3-test", name: "DC3 (Test)", location: "Miami" },
];
const dcMap: Record<string, { name: string; location: string }> = {
  "1": { name: "DC1", location: "Miami" },
  "2": { name: "DC2", location: "Amsterdam" },
  "3": { name: "DC3", location: "Miami" },
  "4": { name: "DC4", location: "Amsterdam" },
  "5": { name: "DC5", location: "Singapore" },
  "1-test": { name: "DC1 (Test)", location: "Miami" },
  "2-test": { name: "DC2 (Test)", location: "Amsterdam" },
  "3-test": { name: "DC3 (Test)", location: "Miami" },
};

interface Test {
  state:
    | "connecting"
    | "exchanging-encryption-keys"
    | "pinging"
    | "pinged"
    | "failed";
  ping: number;
  done?: true;
}

const tests = signal<Record<string, Test>>({});
const testInProgress = signal(false);

const dcsToCheck = signal(new Set<DC>());

function selectAll() {
  const newSet = new Set(dcsToCheck.value);
  for (const dc of dcs) {
    newSet.add(dc.id);
  }
  dcsToCheck.value = newSet;
}

IS_BROWSER && addEventListener("keydown", (e) => {
  if (
    e.key.toLowerCase() == "a" && (e.ctrlKey ||
      (navigator.userAgent.toLowerCase().includes("mac") && e.metaKey))
  ) {
    selectAll();
    return;
  } else if (e.key == "Escape") {
    if (testInProgress.value) {
      restart();
    } else {
      dcsToCheck.value = new Set();
    }
    return;
  }

  const n = Number(e.key);
  if (isNaN(n)) {
    return;
  }
  const dc = dcs[n - 1]?.id;
  if (!dc) {
    return;
  }
  const newSet = new Set(dcsToCheck.value);
  if (newSet.has(dc)) {
    newSet.delete(dc);
  } else {
    newSet.add(dc);
  }
  dcsToCheck.value = newSet;
});
export function ConnectivityTest() {
  const alertVisible = useSignal(false);
  if (testInProgress.value) {
    return <TestView />;
  }
  return (
    <>
      <main class="p-5 xl:p-10">
        <div class="flex flex-col select-none w-full max-w-sm mx-auto">
          <div class="grid grid-cols-2 gap-4">
            {dcs.map((v) => (
              <Select
                text={v.name}
                caption={v.location}
                checked={dcsToCheck.value.has(v.id)}
                onChange={(checked) => {
                  const newSet = new Set(dcsToCheck.value);
                  if (checked) {
                    newSet.add(v.id);
                  } else {
                    newSet.delete(v.id);
                  }
                  dcsToCheck.value = newSet;
                  //   void (checked ? dcsToCheck.add(v.id) : dcsToCheck.delete(v.id)) &&
                  //     setDcsToCheck(new Set(dcsToCheck));
                }}
              />
            ))}
          </div>
          <div class="text-xs opacity-50 pl-2 pt-2 pb-5">
            Select one or more data centers and click the button below to start
            a connectivity test.
          </div>
          <div class="flex flex-col gap-5">
            <Button
              disabled={!dcsToCheck.value.size}
              onClick={() => startTest()}
            >
              Test Connectivity
            </Button>
            <div class="h-px w-full bg-border flex items-center justify-center text-xs">
              <div class="opacity-50 px-1 bg-background">OR</div>
            </div>
            <Button onClick={() => startTest(true)}>
              Test All
            </Button>
          </div>
        </div>
      </main>

      <div class="fixed bottom-5 right-5 opacity-50 select-none text-xs cursor-pointer">
        <button
          class="p-0 focus:outline-none hover:underline"
          onClick={() => alertVisible.value = true}
        >
          How does this work?
        </button>
      </div>
      <Alert present={alertVisible} />
    </>
  );
}

function TestView() {
  return (
    <>
      <main class="flex flex-col w-full pb-20 pt-5">
        {!Object.keys(tests.value).length && (
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
        {Object.entries(tests.value).map(([dc, test]) => (
          <div class="w-full px-5 py-3">
            <div class="flex flex-col w-full max-w-screen-lg mx-auto">
              <div class="text-[1rem] xl:text-[1.5rem]">
                <span class="font-bold">{dcMap[dc].name}</span>{" "}
                <span class="font-light opacity-50">{dcMap[dc].location}</span>
              </div>
              <div
                class={`text-[1.5rem] xl:text-[3rem] flex gap-3 items-center font-light ${
                  test.state == "pinged"
                    ? test.ping >= 200
                      ? "text-yellow-500"
                      : "text-green-600 dark:text-green-500"
                    : test.state == "failed"
                    ? "text-red-600 dark:tegxt-red-500"
                    : ""
                }`}
              >
                {["pinging", "exchanging-encryption-keys", "connecting"]
                  .includes(
                    test.state,
                  ) &&
                  (
                    <div class="shrink-0">
                      <Spinner />
                    </div>
                  )}
                <span>
                  {{
                    "connecting": "Connecting",
                    "exchanging-encryption-keys": "Exchanging encryption keys",
                    "pinging": "Pinging",
                    "pinged": <>{test.ping}ms</>,
                    "failed": "Connection failed",
                    "timed-out": "Timed out",
                  }[test.state]}
                </span>
              </div>
            </div>
          </div>
        ))}
      </main>
      {
        <div class="bg-gradient-to-t fixed bottom-0 left-0 p-5 from-[#0002] to-[#0000] w-full dark:(from-[#aaa1] to-[#fff0])">
          <div class="max-w-sm mx-auto">
            <Button onClick={restart}>
              {(Object.values(tests.value).length == dcsToCheck.value.size &&
                  Object.values(tests.value).every((v) => v.done))
                ? "Restart"
                : "Abort"}
            </Button>
          </div>
        </div>
      }
    </>
  );
}

let workers = new Array<Worker>();

function restart() {
  dcsToCheck.value = new Set();
  for (const worker of workers) {
    worker.terminate();
  }
  workers = [];
  testInProgress.value = false;
  tests.value = {};
}

function startTest(all = false) {
  testInProgress.value = true;
  if (all) {
    selectAll();
  }
  for (const dc of dcsToCheck.value) {
    const worker = new Worker("/connectivity-test/worker.js", {
      type: "module",
    });
    workers.push(worker);
    worker.addEventListener("message", (e) => {
      if (typeof e.data === "number") {
        tests.value[dc] = {
          state: "pinged",
          ping: e.data,
        };
      } else if (e.data instanceof Uint8Array) {
        localStorage.setItem(dc, encodeHex(e.data));
      } else {
        if (e.data == "done") {
          tests.value[dc].done = true;
        } else {
          tests.value[dc] = {
            state: e.data,
            ping: 0,
          };
        }
      }
      tests.value = { ...tests.value };
    });

    const authKey = localStorage.getItem(dc);
    worker.postMessage([dc, authKey ? decodeHex(authKey) : null]);
  }
}
