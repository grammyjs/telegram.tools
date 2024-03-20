import { Client, StorageMemory } from "mtkruto/mod.ts";
import { signal } from "@preact/signals";
import { Button } from "../components/Button.tsx";
import { Caption } from "../components/Caption.tsx";
import { Input } from "../components/Input.tsx";
import { Label } from "../components/Label.tsx";
import { Select } from "../components/Select.tsx";
import { Error, error } from "./Error.tsx";
import { getDcIps } from "mtkruto/transport/2_transport_provider.ts";
import {
  serializeGramJS,
  serializeMtcute,
  serializePyrogram,
  serializeTelethon,
} from "../lib/session_string.tsx";
import { UNREACHABLE } from "mtkruto/1_utilities.ts";
import { Spinner2 } from "../components/icons/Spinner.tsx";
import { storedString } from "../lib/stored_signals.tsx";
import { getHashSignal } from "../lib/hash_signal.ts";
import { IS_BROWSER } from "$fresh/runtime.ts";

const hash = getHashSignal();
const sessionString = signal("");
const loading = signal(false);

const apiId = storedString("", "string-session-generator_apiId");
const apiHash = storedString("", "string-session-generator_apiHash");
const environment = signal<"Production" | "Test">("Production");
const accountType = signal<"Bot" | "User">("Bot");
const account = signal("");

const validLibraries = [
  "telethon",
  "pyrogram",
  "gramjs",
  "mtcute",
  "mtkruto",
] as const;
type ValidLibrary = (typeof validLibraries)[number];
function isValidLibrary(string: string): string is ValidLibrary {
  return validLibraries.includes(string as unknown as ValidLibrary);
}

const libraries = [
  {
    name: "Telethon",
    link: ["telethon.dev", "https://telethon.dev"],
  },
  {
    name: "Pyrogram",
    link: ["pyrogram.org", "https://pyrogram.org"],
  },
  {
    name: "GramJS",
    link: ["gram.js.org", "https://gram.js.org"],
  },
  {
    name: "mtcute",
    link: ["mtcute.dev", "https://mtcute.dev"],
  },
  {
    name: "MTKruto",
    link: ["mtkru.to", "https://mtkru.to"],
  },
];
export function SessionStringGenerator() {
  if (!IS_BROWSER) {
    return null;
  }
  const library = hash.value.toLowerCase().slice(1);
  if (!isValidLibrary(library)) {
    return <PickLibrary />;
  }

  if (loading.value) {
    return (
      <div class="gap-1.5 text-xs opacity-50 flex w-full items-center justify-center max-w-lg mx-auto">
        <Spinner2 size={10} /> <span>Generating session string</span>
      </div>
    );
  }
  if (sessionString.value) {
    return (
      <>
        <div class="gap-4 flex flex-col w-full max-w-lg mx-auto">
          <div>
            <button
              class="text-grammy"
              onClick={() => sessionString.value = ""}
            >
              ← Back
            </button>
          </div>
          <div class="bg-border rounded-xl p-3 text-sm font-mono break-all select-text">
            {sessionString.value}
          </div>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(sessionString.value).then(() => {
                error.value = "Copied to clipboard.";
              });
            }}
          >
            Copy
          </Button>
        </div>
        <Error />
      </>
    );
  }
  return (
    <>
      <div class="gap-4 flex flex-col w-full max-w-lg mx-auto">
        <Label>
          <Caption>
            Environment
          </Caption>
          <Select
            values={[
              "Production",
              "Test",
            ]}
            onChange={(v) => environment.value = v}
          />
        </Label>
        <Label>
          <Caption>
            App Credentials
          </Caption>
          <Input
            placeholder="API ID"
            name="token"
            required
            value={apiId.value}
            onChange={(e) => apiId.value = e.currentTarget.value}
          />
          <Input
            placeholder="API hash"
            name="token"
            required
            value={apiHash.value}
            onChange={(e) => apiHash.value = e.currentTarget.value}
          />
        </Label>
        <Label>
          <Caption>
            Account Type
          </Caption>
          <Select
            values={[
              "Bot",
              "User",
            ]}
            onChange={(v) => accountType.value = v}
          />
        </Label>
        <Label>
          <Caption>Account Details</Caption>
          <Input
            placeholder={accountType.value == "Bot"
              ? "Bot token"
              : "Phone number in international format"}
            value={account.value}
            onChange={(e) => account.value = e.currentTarget.value}
          />
        </Label>
        <Label>
          <Button
            onClick={() => {
              loading.value = true;
              generateSessionString(library).finally(() => {
                loading.value = false;
              });
            }}
          >
            Next
          </Button>
          <Caption>
            The credentials you enter are used only in connections made directly
            to Telegram.
          </Caption>
        </Label>
      </div>
      <Error />
    </>
  );
}

function PickLibrary() {
  return (
    <div class="gap-4 flex flex-col w-full max-w-sm mx-auto">
      <div class="text-xl font-bold">Which library do you use?</div>
      {libraries.map((v) => (
        <button
          class="bg-gradient py-3 px-4 rounded-xl border-border border-2 cursor-pointer flex flex-col items-start justify-center"
          onClick={() => location.hash = `#${v.name.toLowerCase()}`}
        >
          <span class="text-lg">{v.name}</span>
          <a
            class="opacity-50 text-xs"
            href={v.link[1]}
            target="_blank"
            rel="noopener noreferrer"
          >
            {v.link[0]}
          </a>
        </button>
      ))}
    </div>
  );
}

async function generateSessionString(library: ValidLibrary) {
  if (accountType.value != "Bot") {
    error.value = "The chosen account type is currently not supported.";
    return;
  }

  const apiId_ = Number(apiId.value);
  const apiHash_ = apiHash.value;
  const account_ = account.value;
  if (isNaN(apiId_) || !apiId_ || !apiHash_) {
    error.value = "Invalid API credentials.";
    return;
  }
  if (!account_) {
    error.value = "Invalid account details.";
    return;
  }

  const client = new Client(new StorageMemory(), apiId_, apiHash_, {
    deviceModel: navigator.userAgent.trim().split(" ")[0] || "Unknown",
  });
  await client.start(account_);

  const dc = await client.storage.getDc();
  const authKey = await client.storage.getAuthKey();
  if (!dc || !authKey) {
    UNREACHABLE();
  }

  const ip = getDcIps(dc, "ipv4")[0]; // TODO
  const dcId = Number(dc.split("-")[0]);
  const testMode = environment.value == "Test" ? true : false;

  switch (library) {
    case "telethon":
      sessionString.value = serializeTelethon(dcId, ip, 80, authKey);
      break;
    case "pyrogram": {
      const me = await client.getMe();
      sessionString.value = serializePyrogram(
        dcId,
        apiId_,
        testMode,
        authKey,
        me.id,
        me.isBot,
      );
      break;
    }
    case "gramjs":
      sessionString.value = serializeGramJS(dcId, ip, 80, authKey);
      break;
    case "mtcute": {
      const me = await client.getMe();
      sessionString.value = serializeMtcute(
        testMode,
        dcId,
        ip,
        80,
        me.id,
        me.isBot,
        authKey,
      ); // TODO: tests
      return;
    }
    case "mtkruto":
      sessionString.value = await client.exportAuthString();
      break;
    default:
      error.value = "The chosen library is currently not supported.";
  }
}
