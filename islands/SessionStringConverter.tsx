import { IS_BROWSER } from "$fresh/runtime.ts";
import { computed, effect, signal } from "@preact/signals";

import { DC, getDcIps } from "mtkruto/mod.ts";

import {
  isValidLibrary,
  nameMap,
  validLibraries,
  ValidLibrary,
} from "../lib/misc.ts";
import { getHashSignal } from "../lib/hash.ts";
import { setHash } from "../lib/hash.ts";
import {
  CommonSessionStringFormat,
  deserializeGramjs,
  deserializeMtkruto,
  deserializePyrogram,
  deserializeTelethon,
  serializeGramjs,
  serializeMtcute,
  serializeMtkruto,
  serializePyrogram,
  serializeTelethon,
} from "../lib/session_string.ts";

import { Button } from "../components/Button.tsx";
import { Select } from "../components/Select.tsx";
import { Input } from "../components/Input.tsx";
import { Caption } from "../components/Caption.tsx";
import { Label } from "../components/Label.tsx";

import { Modal, setModalContent } from "./Modal.tsx";

const hash = getHashSignal();
const getHashParts = () => {
  const parts = hash.value.toLowerCase().slice(1).split(",");
  if (parts.length > 2) {
    return [];
  } else {
    return parts;
  }
};

const from = computed<ValidLibrary>(() => {
  const part = getHashParts()[0];
  if (isValidLibrary(part)) {
    return part;
  } else {
    return "telethon";
  }
});
const setFrom = (from: ValidLibrary) => {
  const newParts = getHashParts();
  if (newParts.length < 1) {
    newParts.push(from);
  } else {
    newParts[0] = from;
  }
  setHash(newParts.sort((a, b) => a.localeCompare(b)).join(","));
};
const to = computed<ValidLibrary>(() => {
  const part = getHashParts()[1];
  if (isValidLibrary(part)) {
    return part;
  } else {
    return "pyrogram";
  }
});
const setTo = (to: ValidLibrary) => {
  const newParts = getHashParts();
  if (newParts.length < 2) {
    newParts.push(to);
  } else {
    newParts[1] = to;
  }
  setHash(newParts.sort((a, b) => a.localeCompare(b)).join(","));
};
const needsUserDetails = computed(() => {
  if (from.value == "pyrogram") {
    return false;
  }
  return to.value == "pyrogram" || to.value == "mtcute";
});
const needsApiId = computed(() => to.value == "pyrogram");
const inputValid = computed(() => to.value != from.value);
const accountType = signal<"User" | "Bot">("Bot");
const userId = signal("");
const result = signal("");
const apiId = signal("");
const input = signal("");

IS_BROWSER && effect(() => {
  try {
    let string: CommonSessionStringFormat | null = null;

    switch (from.value) {
      case "telethon":
        string = deserializeTelethon(input.value);
        break;
      case "pyrogram":
        string = deserializePyrogram(input.value);
        break;
      case "gramjs":
        string = deserializeGramjs(input.value);
        break;
      case "mtcute":
        // TODO
        break;
      case "mtkruto":
        string = deserializeMtkruto(input.value);
        break;
    }

    if (!string) {
      return;
    }

    const dcId = typeof string.dc === "string"
      ? Number(string.dc.split("-")[0])
      : string.dc;
    const mtkrutoDc = `${dcId}${string.testMode ? "-test" : ""}` as DC;
    const ip = string.ip ??
      getDcIps(mtkrutoDc, "ipv4")[0]; // TODO: ipv6?
    const port = string.port ?? 80;
    const testMode = string.testMode ?? false;
    const mtcuteDc = { id: dcId, ip, port } as const;
    const apiId_ = Number(apiId.value);
    const isBot = accountType.value == "Bot";
    const userId_ = Number(userId.value);
    const authKey = string.authKey;
    if (needsUserDetails.value && !userId_) {
      return;
    }
    if (needsApiId.value && !apiId_) {
      return;
    }

    switch (to.value) {
      case "telethon":
        result.value = serializeTelethon(dcId, ip, port, authKey);
        break;
      case "pyrogram":
        result.value = serializePyrogram(
          dcId,
          apiId_,
          testMode,
          authKey,
          userId_,
          isBot,
        );
        break;
      case "gramjs":
        result.value = serializeGramjs(dcId, ip, port, authKey);
        break;
      case "mtcute":
        result.value = serializeMtcute(
          testMode,
          mtcuteDc,
          mtcuteDc,
          userId_,
          isBot,
          authKey,
        );
        break;
      case "mtkruto":
        result.value = serializeMtkruto(mtkrutoDc, authKey);
        break;
    }
  } catch (err) {
    console.trace(err);
  }
});

export function SessionStringConverter() {
  if (!IS_BROWSER) {
    return null;
  }
  return (
    <>
      <div class="w-full gap-4 flex flex-col">
        <Label>
          <Caption>From</Caption>
          <Select
            value={from.value}
            values={[...validLibraries]}
            nameMap={nameMap}
            onChange={setFrom}
          />
        </Label>
        <Label>
          <Caption>To</Caption>
          <Select
            value={to.value}
            values={[...validLibraries]}
            nameMap={nameMap}
            onChange={setTo}
          />
          {!inputValid.value && <Caption>Choose different formats.</Caption>}
        </Label>
        <div class="w-full border-t border-border"></div>
        <Label>
          {needsUserDetails.value && (
            <>
              <Caption>Account Type</Caption>
              <Select
                value={accountType.value}
                values={["Bot", "User"]}
                onChange={(v) => accountType.value = v}
              />
              <Input
                placeholder="User ID"
                value={userId.value}
                onChange={(e) => userId.value = e.currentTarget.value}
              />
            </>
          )}
          {needsApiId.value && (
            <Input
              placeholder="API ID"
              value={apiId.value}
              onChange={(e) => apiId.value = e.currentTarget.value}
            />
          )}
        </Label>
        {inputValid.value && (
          <>
            <Label>
              <Caption>Input</Caption>
              <Input
                value={input.value}
                onChange={(e) => input.value = e.currentTarget.value}
              />
            </Label>

            {result.value && (
              <>
                <Label>
                  <Caption>Result</Caption>
                  <div class="bg-border rounded-xl p-3 text-sm font-mono break-all select-text">
                    {result.value}
                  </div>
                </Label>

                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(result.value).then(() => {
                      setModalContent("Copied to clipboard.");
                    });
                  }}
                >
                  Copy
                </Button>
              </>
            )}
          </>
        )}
      </div>
      <Modal />
    </>
  );
}
