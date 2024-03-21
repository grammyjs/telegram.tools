import { ComponentChildren } from "preact";
import { signal, useSignalEffect } from "@preact/signals";

import { base64DecodeUrlSafe } from "mtkruto/utilities/1_base64.ts";
import { TLReader } from "mtkruto/tl/3_tl_reader.ts";
import { id, types } from "mtkruto/2_tl.ts";

import { getHashSignal } from "../lib/hash.ts";
import { setHash } from "../lib/hash.ts";

import { Caption } from "../components/Caption.tsx";
import { Input } from "../components/Input.tsx";
import { Label } from "../components/Label.tsx";

const hash = getHashSignal();
const getId = () => decodeURIComponent(hash.value.slice(1));

interface UnpackedData {
  dc: string;
  userId?: string;
  id: string;
  accessHash: string;
}
const data = signal<UnpackedData | null>(null);

export function InlineMessageIdUnpacker() {
  const id = getId();

  useSignalEffect(() => {
    const id = getId();
    if (!id.trim()) {
      return;
    }

    try {
      const buffer = base64DecodeUrlSafe(id);

      const reader = new TLReader(buffer);

      const cid = buffer.byteLength == 20
        ? inputBotInlineMessageID_CTR
        : inputBotInlineMessageID64_CTR;

      const object = reader.readObject(cid);
      if (object instanceof types.InputBotInlineMessageID) {
        data.value = {
          dc: object.dc_id.toString(),
          id: object.id.toString(),
          accessHash: object.access_hash.toString(),
        };
      } else if (object instanceof types.InputBotInlineMessageID64) {
        data.value = {
          dc: object.dc_id.toString(),
          userId: object.owner_id.toString(),
          id: object.id.toString(),
          accessHash: object.access_hash.toString(),
        };
      }
    } catch {
      // yes
    }
  });

  return (
    <div class="w-full mx-auto max-w-lg gap-4 flex flex-col">
      <Label>
        <Input
          placeholder="Inline message ID"
          value={id}
          onKeyUp={(e) => setHash("#" + e.currentTarget.value)}
          onKeyPress={(e) => setHash("#" + e.currentTarget.value)}
        />
        <Caption>Enter an inline message ID to unpack.</Caption>
      </Label>
      {data.value && (
        <div class="gap-5 grid grid-cols-2">
          <Kv k="DC" v={data.value.dc} />
          <Kv k="User ID" v={data.value.userId || "N/A"} />
          <Kv k="ID" v={data.value.id} />
          <Kv k="Access Hash" v={data.value.accessHash} />
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
