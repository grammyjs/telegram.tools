import { ComponentChildren, createRef } from "preact";
import { useCallback, useEffect } from "preact/hooks";
import { Signal, useSignal } from "@preact/signals";
import * as grammy from "grammy/mod.ts";
import { Router, useHash } from "../components/Router.tsx";
import { Spinner2 } from "../components/icons/Spinner.tsx";
import { Button } from "../components/Button.tsx";
import { Caption } from "../components/Caption.tsx";
import { ExternalLink } from "../components/ExternalLink.tsx";
import { Input } from "../components/Input.tsx";
import { ClientOnly } from "../components/ClientOnly.tsx";
import { Confirmation, confirmation } from "./Confirmation.tsx";
import { Error, error } from "./Error.tsx";

interface Bot {
  token: string;
  name: string;
  url?: string;
  allowedUpdates: string[];
  lastUpdatedAt: number;
}

async function deleteWebhook(token: string, s: Signal<Bot | null>) {
  try {
    const bot = new grammy.Bot(token);
    await bot.api.deleteWebhook();
    s.value && (s.value.url = undefined);
    location.hash = `#/${token}`;
  } catch (err) {
    error.value = `Failed to delete webhook: ${err}`;
  }
}
async function setWebhookURL(
  token: string,
  url: string,
  s: Signal<Bot | null>,
) {
  if (new URL(url).protocol != "https:") {
    error.value = "Only HTTPS URLs are allowed.";
    return;
  }
  try {
    const bot = new grammy.Bot(token);
    await bot.api.setWebhook(url);
    s.value && (s.value.url = url);
    error.value = "Webhook URL set.";
    location.hash = `#/${token}`;
  } catch (err) {
    let a = err;
    if (err instanceof grammy.GrammyError) {
      a = err.description;
    }
    error.value = `Failed to set webhook URL: ${a}`;
  }
}
async function updateAllowedUpdates(
  token: string,
  allowedUpdates: string[],
  url: string,
  s: Signal<Bot | null>,
) {
  try {
    const bot = new grammy.Bot(token);
    await bot.api.setWebhook(url, {
      // deno-lint-ignore no-explicit-any
      allowed_updates: allowedUpdates as any,
    });

    s.value && (s.value.allowedUpdates = allowedUpdates);
    error.value = "Changes saved.";
  } catch (err) {
    let a = err;
    if (err instanceof grammy.GrammyError) {
      a = err.description;
    }
    error.value = `Failed to save changes: ${a}`;
  }
}

export function WebhookManager() {
  return (
    <ClientOnly>
      {() => (
        <>
          <div class="max-w-lg mx-auto w-full flex flex-col gap-4">
            <Router
              key={location.hash}
              routes={{
                "#": <AddBot />,
                // "#/add-bot": <AddBot />,
              }}
              fallbackRoute={<Manage />}
            />
          </div>

          <Confirmation />
          <Error />
        </>
      )}
    </ClientOnly>
  );
}

function AddBot() {
  return (
    <form
      class="gap-4 flex flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        location.hash = `#/${new FormData(e.currentTarget).get("token")}`;
      }}
    >
      <div class="flex flex-col gap-1.5">
        <Input placeholder="Bot token" name="token" required />
        <Caption>
          The bot tokens you enter are stored in your browser and used only in
          requests made directly to Telegram.
        </Caption>
      </div>
      <Button>Open Webhook Manager</Button>
    </form>
  );
}

function Manage() {
  const hash = useHash();
  const parts = hash.split("/");
  const token = parts[1];

  const inputRef = createRef<HTMLInputElement>();
  const onAddURL = useCallback(() => {
    const input = inputRef.current;
    if (!input) {
      return;
    }
    input.reportValidity();
    setWebhookURL(token, input.value, bot);
  }, [token, inputRef]);

  const bot = useSignal<Bot | null>(null);

  useEffect(() => {
    Promise.resolve().then(async () => {
      console.log(token);
      const bot_ = new grammy.Bot(token);
      const [{ username: name }, { url, allowed_updates: allowedUpdates }] =
        await Promise.all([bot_.api.getMe(), bot_.api.getWebhookInfo()]);
      bot.value = {
        token,
        name,
        url,
        allowedUpdates: allowedUpdates ?? [],
        lastUpdatedAt: Date.now(),
      };
    });
  }, [token]);

  if (bot.value == null) {
    return (
      <div class="flex w-full items-center justify-center opacity-50 text-xs gap-1.5">
        <Spinner2 size={10} />
        <span>Loading</span>
      </div>
    );
  }

  const headerChildren = (
    <ExternalLink href={`https://t.me/${bot.value.name}`}>
      @{bot.value.name}
    </ExternalLink>
  );
  const back = `#/${token}`;
  const header = (
    <Header back={back}>
      {headerChildren}
    </Header>
  );
  switch ((parts[2] ?? "").toLocaleLowerCase()) {
    case "url":
      return (
        <>
          {header}
          <div class="flex flex-col">
            <input
              ref={inputRef}
              type="url"
              class={listItem}
              placeholder="URL"
              defaultValue={bot.value.url}
              autoComplete="off"
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              onKeyDown={(e) => e.key == "Enter" && onAddURL}
            />
            <button
              class={listItemButton}
              onClick={onAddURL}
            >
              {bot.value.url ? "Update URL" : "Set URL"}
            </button>
            {bot.value.url && (
              <button
                class={listItemButtonDanger}
                onClick={() =>
                  confirmation.value = {
                    title: "Remove webhook",
                    description:
                      "Are you sure that you want to remove the webhook?",
                    onConfirm: () => {
                      deleteWebhook(bot.value!.token, bot);
                      location.hash = back;
                    },
                  }}
              >
                Remove webhook
              </button>
            )}
          </div>
        </>
      );
    case "allowed-updates": {
      const allowedUpdates = useSignal(bot.value.allowedUpdates);
      return (
        <>
          {header}
          <div class="grid grid-cols-2 gap-4">
            {grammy.API_CONSTANTS.ALL_UPDATE_TYPES.map((v) => {
              const isAllowDefaultUpdates = !allowedUpdates.value.length;
              let selected = false;
              if (isAllowDefaultUpdates) {
                selected = (grammy.API_CONSTANTS
                  .DEFAULT_UPDATE_TYPES as unknown as string[]).includes(v);
              } else {
                selected = allowedUpdates.value.includes(v);
              }
              return (
                <button
                  class={`p-2 flex items-center justify-center border-2 rounded-xl cursor-pointer bg-gradient text-sm truncate text-ellipsis ${
                    selected ? "border-grammy" : "border-border"
                  }`}
                  onClick={() => {
                    let n = new Array<string>();
                    if (isAllowDefaultUpdates) {
                      n = [...grammy.API_CONSTANTS.DEFAULT_UPDATE_TYPES];
                    } else {
                      n = [...allowedUpdates.value];
                    }
                    if (selected && n.includes(v)) {
                      n = n.filter((v_) => v != v_);
                    } else if (!selected && !n.includes(v)) {
                      n.push(v);
                    }
                    allowedUpdates.value = n;
                  }}
                >
                  {v}
                </button>
              );
            })}
          </div>
          <div class="flex gap-4">
            <Button
              muted
              onClick={() => {
                if (
                  allowedUpdates.value.length ==
                    grammy.API_CONSTANTS.ALL_UPDATE_TYPES.length
                ) {
                  allowedUpdates.value = [];
                } else {
                  allowedUpdates.value = [
                    ...grammy.API_CONSTANTS.ALL_UPDATE_TYPES,
                  ];
                }
              }}
            >
              All
            </Button>
            <Button muted onClick={() => allowedUpdates.value = []}>
              Default
            </Button>
          </div>
          <Button
            onClick={() =>
              updateAllowedUpdates(
                bot.value!.token,
                allowedUpdates.value,
                bot.value!.url!,
                bot,
              )}
          >
            Save Changes
          </Button>
        </>
      );
    }
    default:
      return (
        <>
          <Header>
            {headerChildren}
          </Header>
          <div class="flex flex-col gap-1.5">
            <div class="flex flex-col">
              <button class={listItem} data-route={`#/${token}/url`}>
                <div>URL</div>
                <div class="opacity-50 truncate text-ellipsis text-right">
                  {bot.value.url || "Unset"}
                </div>
              </button>
              {bot.value.url && (
                <button
                  class={listItem}
                  data-route={`#/${token}/allowed-updates`}
                >
                  <div>Allowed Updates</div>
                  <div class="opacity-50">
                    {bot.value.allowedUpdates.length == 0
                      ? "Default Updates"
                      : bot.value.allowedUpdates.length}
                  </div>
                </button>
              )}
            </div>
            {
              /* <div class="flex items-center justify-between gap-4 px-2">
              <span class="text-xs opacity-50">
                Last updated at {timeAgo(new Date(bot.value!.lastUpdatedAt))}.
              </span>
              <button
                class="text-grammy text-xs"
                onClick={() => updateBot(bot.value!.token)}
              >
                Update Now
              </button>
            </div> */
            }
          </div>
        </>
      );
  }
}

//
function Header(props: { back?: string; children?: ComponentChildren }) {
  return (
    <div class="flex items-center justify-between">
      <button class="text-grammy" data-route={props.back || "#"}>← Back</button>
      {props.children}
    </div>
  );
}

const listItem =
  "[&_*]:pointer-events-none focus:outline-none flex gap-2 items-center justify-between py-1.5 [&:not(last-child)]:border-b border-background bg-foreground-transparent px-4 first-child:rounded-t-xl last-child:rounded-b-xl";
const listItemButton = listItem + " text-button-text";
const listItemButtonDanger = listItem + " text-red-500";
