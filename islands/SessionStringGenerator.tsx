import { IS_BROWSER } from "$fresh/runtime.ts";
import { computed, Signal, signal } from "@preact/signals";

import { Client, StorageMemory } from "mtkruto/mod.ts";
import { UNREACHABLE } from "mtkruto/1_utilities.ts";
import { getDcIps } from "mtkruto/transport/2_transport_provider.ts";

import {
  serializeGramjs,
  serializeMtcute,
  serializeMtkruto,
  serializePyrogram,
  serializeTelethon,
} from "../lib/session_string.ts";
import { storedString } from "../lib/stored_signals.tsx";
import { getHashSignal, setHash } from "../lib/hash.ts";
import { Db, SessionString } from "../lib/session_string_generator_db.ts";

import { Button } from "../components/Button.tsx";
import { Caption } from "../components/Caption.tsx";
import { Input } from "../components/Input.tsx";
import { Label } from "../components/Label.tsx";
import { Select } from "../components/Select.tsx";
import { Spinner2 } from "../components/icons/Spinner.tsx";

import { hideModal, Modal, setModalContent } from "./Modal.tsx";

const db = new Db();

const hash = getHashSignal();
const getHashParts = () => {
  const parts = hash.value.toLowerCase().slice(1).split(",");
  if (parts.length > 3) {
    return [];
  } else {
    console.log(parts);
    return parts;
  }
};
const setEnv = (env: "Production" | "Test") => {
  const newParts = getHashParts().filter((v) => v != "test");
  if (env == "Test") {
    newParts.push("test");
  }
  setHash(newParts.sort((a, b) => a.localeCompare(b)).join(","));
};
const setAccountType = (env: "Bot" | "User") => {
  const newParts = getHashParts().filter((v) => v != "user");
  if (env == "User") {
    newParts.push("user");
  }
  setHash(newParts.sort((a, b) => a.localeCompare(b)).join(","));
};
const sessionString = signal("");
const loading = signal(false);

const apiId = storedString("", "string-session-generator_apiId");
const apiHash = storedString("", "string-session-generator_apiHash");
const environment = computed<"Production" | "Test">(() => {
  const parts = getHashParts();
  if (parts.length == 1) {
    return "Production";
  } else {
    return parts.includes("test") ? "Test" : "Production";
  }
});
const accountType = computed<"Bot" | "User">(() => {
  const parts = getHashParts();
  if (parts.length == 1) {
    return "Bot";
  } else {
    return parts.includes("user") ? "User" : "Bot";
  }
});
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
    link: "telethon.dev",
  },
  {
    name: "Pyrogram",
    link: "pyrogram.org",
  },
  {
    name: "GramJS",
    link: "gram.js.org",
  },
  {
    name: "mtcute",
    link: "mtcute.dev",
  },
  {
    name: "MTKruto",
    link: "mtkru.to",
  },
];

async function generate(library: ValidLibrary) {
  const generate = () => {
    loading.value = true;
    hideModal();
    generateSessionString(library).finally(() => {
      loading.value = false;
    });
  };
  const string = await db.strings.get({ account: account.value });
  if (string && "string" in string) {
    setModalContent(
      <>
        <p>
          A session string was recently generated for this account. Do you want
          to see that one?
        </p>
        <Button
          onClick={() => {
            fromStorage(string.string, library);
            hideModal();
          }}
        >
          Yes
        </Button>
        <Button muted onClick={generate}>No, regenerate</Button>
      </>,
      undefined,
      false,
    );
    return;
  }
  generate();
}
export function SessionStringGenerator() {
  if (!IS_BROWSER) {
    return null;
  }
  const parts = getHashParts();
  const library = parts[0];
  if (!isValidLibrary(library)) {
    return <LibraryPicker />;
  }

  if (loading.value) {
    return (
      <>
        <div class="gap-1.5 text-xs opacity-50 flex w-full items-center justify-center max-w-lg mx-auto">
          <Spinner2 size={10} /> <span>Generating session string</span>
        </div>
        <Modal />
      </>
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
                setModalContent("Copied to clipboard.");
              });
            }}
          >
            Copy
          </Button>
        </div>
        <Modal />
      </>
    );
  }
  return (
    <>
      <form
        class="gap-4 flex flex-col w-full max-w-lg mx-auto"
        onSubmit={(e) => {
          e.preventDefault();
          generate(library);
        }}
      >
        <Label>
          <Caption>
            Environment
          </Caption>
          <Select
            value={environment.value}
            values={[
              "Production",
              "Test",
            ]}
            onChange={(v) => setEnv(v)}
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
            value={accountType.value}
            onChange={(v) => setAccountType(v)}
          />
        </Label>
        <Label>
          <Caption>Account Details</Caption>
          <Input
            placeholder={accountType.value == "Bot"
              ? "Bot token"
              : "Phone number in international format"}
            value={account.value}
            required
            onChange={(e) => account.value = e.currentTarget.value}
          />
        </Label>
        <Label>
          <Button>
            Next
          </Button>
          <Caption>
            The credentials you enter are used only in connections made directly
            to Telegram.
          </Caption>
        </Label>
      </form>
      <Modal />
    </>
  );
}

function LibraryPicker() {
  return (
    <div class="gap-4 flex flex-col w-full max-w-sm mx-auto">
      <div class="text-xl font-bold">Which library do you use?</div>
      {libraries.map((v) => (
        <button
          class="bg-gradient py-3 px-4 rounded-xl border-border border-2 cursor-pointer flex flex-col items-start justify-center"
          onClick={(e) =>
            e.currentTarget == e.target &&
            setHash(v.name.toLowerCase())}
        >
          <span class="text-lg pointer-events-none">{v.name}</span>
          <span class="opacity-50 text-xs">{v.link}</span>
        </button>
      ))}
    </div>
  );
}

async function fromStorage(
  { apiId, dcId, ip, testMode, me, authKey }: SessionString["string"],
  library: ValidLibrary,
) {
  switch (library) {
    case "telethon":
      sessionString.value = serializeTelethon(dcId, ip, 80, authKey);
      break;
    case "pyrogram": {
      sessionString.value = serializePyrogram(
        dcId,
        apiId,
        testMode,
        authKey,
        me.id,
        me.isBot,
      );
      break;
    }
    case "gramjs":
      sessionString.value = serializeGramjs(dcId, ip, 80, authKey);
      break;
    case "mtcute": {
      sessionString.value = serializeMtcute(
        testMode,
        { id: dcId, ip, port: 80 },
        null,
        me.id,
        me.isBot,
        authKey,
      );
      break;
    }
    case "mtkruto":
      sessionString.value = await serializeMtkruto(
        `${dcId}${testMode ? "-test" : ""}`,
        authKey,
      );
      break;
    default:
      setModalContent("The chosen library is currently not supported.");
      return;
  }
}

async function generateSessionString(library: ValidLibrary) { // TODO: report errors
  const apiId_ = Number(apiId.value);
  const apiHash_ = apiHash.value;
  const account_ = account.value;
  if (isNaN(apiId_) || !apiId_ || !apiHash_) {
    setModalContent("Invalid API credentials.");
    return;
  }
  if (!account_) {
    setModalContent("Invalid account details.");
    return;
  }
  if (accountType.value != "Bot" && !account.value.startsWith("+")) {
    setModalContent("The phone number must start with a plus sign.");
    return;
  }

  const client = new Client(new StorageMemory(), apiId_, apiHash_, {
    deviceModel: navigator.userAgent.trim().split(" ")[0] || "Unknown",
    initialDc: environment.value == "Test" ? "2-test" : undefined,
  });

  let firstCodeAttempt_ = true;
  const firstCodeAttempt = signal(true);
  let firstPasswordAttempt_ = true;
  const firstPasswordAttempt = signal(true);
  await client.start(
    accountType.value == "Bot" ? account_ : {
      phone: account_,
      code: () =>
        new Promise((resolve, reject) => {
          if (!firstCodeAttempt_ && firstCodeAttempt.value) {
            firstCodeAttempt.value = false;
          }
          setModalContent(
            () => (
              <Code
                first={firstCodeAttempt}
                resolve={(code) => {
                  resolve(code);
                }}
                cancel={() => {
                  hideModal();
                  reject();
                }}
              />
            ),
            false,
            false,
          );
          firstCodeAttempt_ = false;
        }),
      password: (hint) =>
        new Promise((resolve, reject) => {
          if (!firstPasswordAttempt_ && firstPasswordAttempt.value) {
            firstPasswordAttempt.value = false;
          }
          setModalContent(
            () => (
              <Password
                hint={hint}
                first={firstPasswordAttempt}
                resolve={(code) => {
                  resolve(code);
                }}
                cancel={() => {
                  hideModal();
                  reject();
                }}
              />
            ),
            false,
            false,
          );
          firstPasswordAttempt_ = false;
        }),
    },
  );
  hideModal();

  const dc = await client.storage.getDc();
  const authKey = await client.storage.getAuthKey();
  if (!dc || !authKey) {
    UNREACHABLE();
  }

  const ip = getDcIps(dc, "ipv4")[0]; // TODO
  const dcId = Number(dc.split("-")[0]);
  const testMode = environment.value == "Test" ? true : false;
  const me = await client.getMe();

  switch (library) {
    case "telethon":
      sessionString.value = serializeTelethon(dcId, ip, 80, authKey);
      break;
    case "pyrogram": {
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
      sessionString.value = serializeGramjs(dcId, ip, 80, authKey);
      break;
    case "mtcute": {
      sessionString.value = serializeMtcute(
        testMode,
        { id: dcId, ip, port: 80 },
        null,
        me.id,
        me.isBot,
        authKey,
      );
      break;
    }
    case "mtkruto":
      sessionString.value = await client.exportAuthString();
      break;
    default:
      setModalContent("The chosen library is currently not supported.");
      return;
  }

  await db.strings.put({
    account: account_,
    string: { apiId: apiId_, ip, dcId, testMode, me, authKey },
  });
}

function Code(
  { first, resolve, cancel }: {
    first: Signal<boolean>;
    resolve: (code: string) => void;
    cancel: () => void;
  },
) {
  if (!first.value) {
    return (
      <>
        <div>Invalid code.</div>
        <Button onClick={() => first.value = true}>Retry</Button>
        <Button
          type="button"
          danger
          onClick={cancel}
        >
          Cancel
        </Button>
      </>
    );
  }
  return (
    <form
      class="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        resolve(new FormData(e.currentTarget).get("code") as string);
      }}
    >
      <Label>
        <Input
          name="code"
          placeholder="Code"
          pattern="^[0-9]{4,}$"
          required
        />
        <Caption>Enter the code you received.</Caption>
      </Label>
      <Button>Next</Button>
      <Button
        type="button"
        danger
        onClick={cancel}
      >
        Cancel
      </Button>
    </form>
  );
}

function Password(
  { hint, first, resolve, cancel }: {
    hint: string | null;
    first: Signal<boolean>;
    resolve: (password: string) => void;
    cancel: () => void;
  },
) {
  if (!first.value) {
    return (
      <>
        <div>Invalid code.</div>
        <Button onClick={() => first.value = true}>Retry</Button>
        <Button
          danger
          onClick={cancel}
        >
          Cancel
        </Button>
      </>
    );
  }
  return (
    <form
      class="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        resolve(new FormData(e.currentTarget).get("password") as string);
      }}
    >
      <Label>
        <Input
          type="password"
          name="password"
          placeholder={hint || "Password"}
          pattern=".+"
          required
        />
        <Caption>Enter your account’s password.</Caption>
      </Label>
      <Button>Next</Button>
      <Button
        type="button"
        danger
        onClick={cancel}
      >
        Cancel
      </Button>
    </form>
  );
}
