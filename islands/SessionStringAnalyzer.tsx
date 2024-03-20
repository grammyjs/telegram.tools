import { Caption } from "../components/Caption.tsx";
import { Input } from "../components/Input.tsx";
import { ComponentChildren } from "preact";
import { Label } from "../components/Label.tsx";
import { getHashSignal } from "../lib/hash_signal.ts";
import { signal, useSignalEffect } from "@preact/signals";
import { id, types } from "mtkruto/2_tl.ts";
import { encodeHex } from "$std/encoding/hex.ts";
import {
  CommonSessionStringFormat,
  deserializeGramjs,
  deserializeMtkruto,
  deserializePyrogram,
  deserializeTelethon,
} from "../lib/session_string.tsx";

const hash = getHashSignal();
const getString = () => decodeURIComponent(hash.value.slice(1));

const data = signal<
  | CommonSessionStringFormat & {
    format: "GramJS" | "Telethon" | "Pyrogram" | "MTKruto";
  }
  | null
>(
  null,
);

export function SessionStringAnalyzer() {
  const string = getString();

  useSignalEffect(() => {
    const string = getString();
    if (!string.trim()) {
      return;
    }

    try {
      data.value = { ...deserializeTelethon(string), format: "Telethon" };
      return;
    } catch {
      //
    }

    try {
      data.value = { ...deserializePyrogram(string), format: "Pyrogram" };
      return;
    } catch {
      //
    }

    try {
      data.value = { ...deserializeGramjs(string), format: "GramJS" };
      return;
    } catch {
      //
    }

    try {
      data.value = { ...deserializeMtkruto(string), format: "MTKruto" };
      return;
    } catch {
      //
    }
  });

  return (
    <div class="w-full gap-4 flex flex-col">
      <Label>
        <Input
          placeholder="Session string"
          value={string}
          onKeyUp={(e) => location.hash = e.currentTarget.value}
          onKeyPress={(e) => location.hash = e.currentTarget.value}
        />
        <Caption>Enter a session string to analyze.</Caption>
      </Label>
      {data.value && (
        <div class="gap-5 grid grid-cols-2">
          <Kv k="Format" v={data.value.format} />
          <Kv k="DC" v={data.value.dc} />
          {data.value.format == "Pyrogram" && (
            <>
              <Kv k="Test" v={data.value.testMode ? "Yes" : "No"} />
              <Kv k="API ID" v={data.value.apiId} />
              <Kv k="User ID" v={data.value.userId} />
              <Kv k="Bot" v={data.value.isBot ? "Yes" : "No"} />
            </>
          )}
          {["Telethon", "GramJS"].includes(data.value.format) && (
            <>
              <Kv k="IP" v={data.value.ip} />
              <Kv k="Port" v={data.value.port} />
            </>
          )}
          <Kv
            c="col-span-2"
            k="Auth Key"
            v={"0x" + encodeHex(data.value.authKey).toUpperCase()}
          />
        </div>
      )}
    </div>
  );
}

const inputBotInlineMessageID_CTR = new types.InputBotInlineMessageID({
  dc_id: 0,
  id: 0n,
  access_hash: 0n,
})[id];
const inputBotInlineMessageID64_CTR = new types.InputBotInlineMessageID64({
  dc_id: 0,
  owner_id: 0n,
  id: 0,
  access_hash: 0n,
})[id];

function Kv({ k, v, c }: { k: string; v: ComponentChildren; c?: string }) { // TODO: merge with FileIdAnalyzer's
  return (
    <div class={"flex flex-col gap-0.5 " + (c ?? "")}>
      <div class="font-bold text-xs">{k}</div>
      <div class="select-text text-ellipsis overflow-hidden">{v}</div>
    </div>
  );
}
