import { IS_BROWSER } from "$fresh/runtime.ts";
import { createRef } from "preact";
import { useEffect, useState } from "preact/hooks";
import { signal, useComputed, useSignal } from "@preact/signals";

import Prism from "prismjs";
import "prism-json";
import { UserFromGetMe } from "grammy/types.ts";
import { matchFilter } from "grammy/filter.ts";

import { storedBoolean } from "../lib/stored_signals.tsx";
import { useLiveQuerySignal } from "../lib/dexie.ts";
import { Db, Update } from "../lib/update_explorer_db.ts";
import { setHash } from "../lib/hash.ts";

import { Caption } from "../components/Caption.tsx";
import { Button } from "../components/Button.tsx";
import { Input } from "../components/Input.tsx";
import { Router, useHash } from "../components/Router.tsx";
import { Spinner2 } from "../components/icons/Spinner.tsx";
import { ClientOnly } from "../components/ClientOnly.tsx";

import { Modal, setModalContent } from "./Modal.tsx";
import { isModalVisible } from "./Modal.tsx";

const dbs = new Map<string, Db>();

function getDb(token: string) {
  return dbs.get(token) ?? new Db(token);
}
const UPDATE_LIMIT = 200;

const width = signal(IS_BROWSER ? innerWidth : 0);
const sounds = storedBoolean(false, "update-explorer_sounds");

IS_BROWSER && addEventListener("resize", () => {
  width.value = innerWidth;
});

export function UpdateExplorer() {
  return (
    <ClientOnly>
      {() =>
        width.value < 1280
          ? <div class="p-5 text-xs opacity-50">Screen size not supported.</div>
          : (
            <Router
              key={location.hash}
              routes={{
                "#": <Home />,
              }}
              fallbackRoute={<Explorer />}
            />
          )}
    </ClientOnly>
  );
}

function Home() {
  return (
    <main class="mx-auto w-full max-w-[900px] p-5 xl:p-10">
      <div class="w-full max-w-lg mx-auto">
        <form
          class="gap-4 flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            setHash(`/${new FormData(e.currentTarget).get("token")}`);
          }}
        >
          <div class="flex flex-col gap-1.5">
            <Input placeholder="Bot token" name="token" required />
            <Caption>
              The bot tokens you enter are stored in your browser and used only
              in requests made directly to Telegram.
            </Caption>
          </div>
          <Button>Open Update Explorer</Button>
        </form>
        <div class=""></div>
      </div>
    </main>
  );
}

const openedUpdate = signal<{ id: number; text: string } | null>(null);

async function openUpdate(token: string, updateId: number) {
  const update = await getDb(token).updates.where({ updateId }).first();
  if (!update) {
    return;
  }
  openedUpdate.value = {
    id: updateId,
    text: Prism.highlight(
      JSON.stringify(update.data, null, 2),
      Prism.languages.json,
      "json",
    ),
  };
}

function getUpdatePreview(update: Update["data"]) {
  const msg = update.message ?? update.edited_message;
  if (
    msg && msg.from.username &&
    msg.chat.type == "private"
  ) {
    return `Private message from @${msg.from.username}` +
      (update.edited_message ? " (edited)" : "");
  }
  return Object.entries(update).find(([k, v]) => !!v && k != "update_id")
    ?.[0] ?? "No Preview";
}

function Explorer() {
  const hash = useHash();
  const parts = hash.split("/");
  if (parts.length > 3) {
    return <Home />;
  }
  const token = parts[1];

  let page = Number(parts[2]) || 0;
  if (page < 0) {
    page = 0;
  }
  if (!token) {
    return null;
  }
  const [filter, setFilter] = useState("");
  const [filterValid, setFilterValid] = useState(false);
  useEffect(() => {
    if (!filter) {
      setFilterValid(true);
      return;
    }
    try {
      // @ts-ignore: yes, just like that
      matchFilter(filter);
      setFilterValid(true);
    } catch {
      setFilterValid(false);
    }
  }, [filter]);
  const me = useSignal<UserFromGetMe | null>(null);
  const updates = useLiveQuerySignal(
    () =>
      getDb(token).updates.reverse()
        .filter((v) =>
          // @ts-ignore: please
          filter ? matchFilter(filter)({ update: v.data }) : true
        )
        .offset(page * UPDATE_LIMIT).limit(
          UPDATE_LIMIT,
        ).toArray(),
    [token, page, filter],
    [],
  );

  const fqInput = createRef<HTMLInputElement>();
  const first = useComputed<Update | null>(() => updates.value[0] ?? null);
  const last = useComputed<Update | null>(() =>
    updates.value[updates.value.length - 1] ?? null
  );

  useEffect(() => {
    const worker = new Worker("/update-explorer/worker.js", { type: "module" });
    worker.addEventListener("message", (e) => {
      switch (e.data._) {
        case "me":
          me.value = e.data.me;
          break;
        case "error":
          setModalContent(e.data.error);
          break;
        case "sound":
          sounds.value && new Audio("/update-explorer/in.mp3").play();
          break;
      }
    });
    worker.postMessage(token);

    return () => worker.terminate();
  }, [token]);

  useEffect(() => {
    const onKeyDown = async (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          if (document.activeElement == fqInput.current) {
            fqInput.current?.blur();
            break;
          }
          openedUpdate.value = null;
          break;
        case "ArrowUp": {
          e.preventDefault();
          if (openedUpdate.value) {
            const currIndex = updates.value.findIndex((v) =>
              v.updateId == openedUpdate.value!.id
            );
            if (currIndex != -1) {
              const prevUpdate = updates.value[currIndex - 1];
              if (prevUpdate) {
                openUpdate(token, prevUpdate.updateId);
                return;
              }
            }
          }
          if (!last.value) {
            return;
          }
          const lastUpdate = await getDb(token).updates
            .where({ updateId: last.value.updateId })
            .first();
          if (!lastUpdate) {
            return;
          }
          openUpdate(token, lastUpdate.updateId);
          break;
        }
        case "ArrowDown": {
          e.preventDefault();
          if (openedUpdate.value) {
            const currIndex = updates.value.findIndex((v) =>
              v.updateId == openedUpdate.value!.id
            );
            if (currIndex != -1) {
              const nextUpdate = updates.value[currIndex + 1];
              if (nextUpdate) {
                openUpdate(token, nextUpdate.updateId);
                return;
              }
            }
          }
          if (!first.value) {
            return;
          }
          const firstUpdate = await getDb(token).updates
            .where({ updateId: first.value.updateId })
            .first();
          if (!firstUpdate) {
            return;
          }
          openUpdate(token, firstUpdate.updateId);
          break;
        }
        case "ArrowRight":
          if (updates.value.length != UPDATE_LIMIT) {
            break;
          }
          setHash(`/${token}/${page + 1}`);
          break;
        case "ArrowLeft":
          if (page == 0) {
            break;
          }
          setHash(`/${token}/${page - 1}`);
          break;
        case "s":
        case "S":
          sounds.value = !sounds.value;
          break;
        case "/":
          e.preventDefault();
          fqInput.current?.focus();
      }
    };
    addEventListener("keydown", onKeyDown);

    return () => removeEventListener("keydown", onKeyDown);
  }, [token, page, fqInput]);

  return (
    <>
      <main class="grid grid-cols-2 w-full min-h-[900px]">
        <div class="flex flex-col gap-4 w-full min-h-[90vh] p-4 h-[calc(100vh-32px)] overflow-y-auto">
          {(!updates.value || !updates.value.length) &&
            (
              <div class="opacity-50 text-sm self-center">
                {filter ? "No matches found." : "No update received yet."}
              </div>
            )}
          <div class="flex flex-col w-full text-sm">
            {updates.value.map((u) => (
              <button
                class={`flex gap-4 items-center justify-between border-b p-0.5 border-border ${
                  openedUpdate.value?.id == u.updateId ? "bg-border" : ""
                }`}
                onClick={() => openUpdate(token, u.updateId)}
              >
                <div class="pointer-events-none">
                  {getUpdatePreview(u.data)}
                </div>
                <div class="opacity-50 pointer-events-none">{u.updateId}</div>
              </button>
            ))}
            <div class="flex gap-4 items-center justify-between">
              {page > 0
                ? (
                  <a
                    class="text-xs opacity-50 self-center py-1.5"
                    href={`#/${token}/${page - 1}`}
                  >
                    &laquo; Previous Page
                  </a>
                )
                : <span></span>}
              {updates.value.length === UPDATE_LIMIT && (
                <a
                  class="text-xs opacity-50 self-center py-1.5"
                  href={`#/${token}/${page + 1}`}
                >
                  Next Page &raquo;
                </a>
              )}
            </div>
            {/* )} */}
          </div>
        </div>
        <div
          class={`flex flex-col w-full p-4 h-[calc(100vh-32px)] overflow-y-auto ${
            openedUpdate.value == null ? "items-center justify-center" : ""
          }`}
        >
          {openedUpdate.value == null && (
            <div class="flex flex-col gap-2 opacity-50 text-sm">
              {[
                ["/", "Filter"],
                ["s", sounds.value ? "Turn sounds off" : "Turn sounds on"],
                ["Esc", "Back"],
                ["↑", "Jump to update above"],
                ["↓", "Jump to update below"],
                updates.value.length == UPDATE_LIMIT &&
                ["→", "Next page"],
                page != 0 &&
                ["←", page == 0 ? "Browse older updates" : "Previous page"],
              ]
                .filter((v): v is [string, string] => !!v)
                .map(([k, v]) => (
                  <div class="flex gap-1.5 items-center">
                    <div class="text-xs bg-border px-2 py-1 rounded-lg text-center w-[40px]">
                      {k}
                    </div>
                    <div>{v}</div>
                  </div>
                ))}
            </div>
          )}
          {openedUpdate.value != null && (
            <pre class="text-sm select-text w-full"><code class="language-json" dangerouslySetInnerHTML={{__html: openedUpdate.value.text}}/></pre>
          )}
        </div>
      </main>
      <div class="flex gap-1 items-center justify-center relative fixed bottom-0 text-xs px-4 py-2 bg-background w-full">
        <input
          ref={fqInput}
          type="text"
          placeholder="Filter query"
          onKeyUp={(e) => setFilter(e.currentTarget.value)}
          class={`absolute top-0 left-4 top-2 bg-transparent placeholder:text-white/50 focus:outline-none ${
            filterValid ? "" : "text-red-500"
          } w-fit-content ${
            filter
              ? ""
              : "opacity-0 pointer-events-none focus:(opacity-100 pointer-events-auto)"
          }`}
        />
        <div class="opacity-50 flex gap-1.5 items-center">
          {!me.value && !isModalVisible() &&
            (
              <>
                <Spinner2 size={10} /> Authorizing
              </>
            )}
          {me.value && <>Authorized as @{me.value.username}</>}
        </div>
      </div>
      <Modal onDismiss={() => setHash("#")} />
    </>
  );
}
