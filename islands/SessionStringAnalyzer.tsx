import { encodeHex } from "$std/encoding/hex.ts";
import { ComponentChildren } from "preact";
import { signal, useSignalEffect } from "@preact/signals";

import { Caption } from "../components/Caption.tsx";
import { Input } from "../components/Input.tsx";
import { Label } from "../components/Label.tsx";

import { getHashSignal, setHash } from "../lib/hash.ts";
import {
  CommonSessionStringFormat,
  deserializeGramjs,
  deserializeMtkruto,
  deserializePyrogram,
  deserializeTelethon,
} from "../lib/session_string.ts";

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
          onKeyUp={(e) => setHash(e.currentTarget.value)}
          onKeyPress={(e) => setHash(e.currentTarget.value)}
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

function Kv({ k, v, c }: { k: string; v: ComponentChildren; c?: string }) { // TODO: merge with FileIdAnalyzer's
  return (
    <div class={"flex flex-col gap-0.5 " + (c ?? "")}>
      <div class="font-bold text-xs">{k}</div>
      <div class="select-text text-ellipsis overflow-hidden">{v}</div>
    </div>
  );
}
