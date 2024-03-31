import { ComponentChildren } from "preact";
import { useSignal, useSignalEffect } from "@preact/signals";

import {
  deserializeFileId,
  deserializeUniqueFileId,
  FileId,
  fileTypeMap,
  UniqueFileId,
} from "../lib/file_id.ts";
import { setHash } from "../lib/hash.ts";

import { Input } from "../components/Input.tsx";

export function FileIdAnalyzer() {
  const fileId = useSignal(
    typeof location !== "undefined" ? location?.hash?.slice(1) ?? "" : "",
  );
  const data = useSignal<FileId | UniqueFileId | null>(null);

  useSignalEffect(() => {
    if (!fileId.value.trim()) {
      return;
    }
    if (typeof location !== "undefined") {
      setHash(fileId.value);
    }
    try {
      data.value = deserializeFileId(fileId.value);
    } catch (err1) {
      try {
        data.value = deserializeUniqueFileId(fileId.value);
      } catch (err2) {
        console.error("1", err1);
        console.error("2", err1);
        data.value = null;
      }
    }
  });

  return (
    <div class="flex flex-col w-full px-5">
      <Input
        type="text"
        value={fileId.value}
        placeholder="File ID"
        onKeyDown={(e) => fileId.value = e.currentTarget.value}
        onKeyPress={(e) => fileId.value = e.currentTarget.value}
      />
      <div class="text-xs opacity-50 pl-2 mt-2">
        Enter a file ID to analyze. Both file IDs and unqiue file IDs are
        supported as provided by Bot API, TDLib, or any other source adhering to
        their format.
      </div>
      {data.value && "unique" in data.value && data.value.unique && (
        <div class="gap-5 grid grid-cols-2 mt-5">
          <Kv k="Type" v={data.value.type} />
          {data.value.url && <Kv k="URL" v={data.value.url} />}
          {data.value.id && <Kv k="ID" v={String(data.value.id)} />}
        </div>
      )}
      {data.value && !("unique" in data.value) && (
        <div class="grid grid-cols-2 gap-5 mt-5">
          <Kv k="Type" v={fileTypeMap[data.value.type]} />
          <Kv k="DC" v={data.value.dcId} />
          {data.value.location.type == "web" && (
            <>
              <Kv k="URL" v={data.value.location.url} c="col-span-2" />
              <Kv
                k="Access Hash"
                v={String(data.value.location.accessHash)}
                c="col-span-2"
              />
            </>
          )}
          {data.value.location.type == "common" && (
            <>
              <Kv k="ID" v={String(data.value.location.id)} />
              <Kv k="Access Hash" v={String(data.value.location.accessHash)} />
            </>
          )}
          {data.value.location.type == "photo" && (
            <>
              <Kv k="ID" v={String(data.value.location.id)} />
              <Kv k="Access Hash" v={String(data.value.location.accessHash)} />
              {"chatId" in data.value.location.source &&
                (
                  <>
                    <Kv k="Chat ID" v={data.value.location.source.chatId} />
                    <Kv
                      k="Chat Access Hash"
                      v={data.value.location.source.chatAccessHash}
                    />
                  </>
                )}
              {"thumbnailType" in data.value.location.source && (
                <>
                  <Kv
                    k="Thumbnail File Type"
                    v={fileTypeMap[data.value.location.source.fileType]}
                  />
                  <Kv
                    k="Thumbnail Size"
                    v={String.fromCharCode(
                      data.value.location.source.thumbnailType,
                    )}
                  />
                </>
              )}
              {"stickerSetId" in data.value.location.source &&
                (
                  <>
                    <Kv
                      k="Sticker Set ID"
                      v={data.value.location.source.stickerSetId}
                    />
                    <Kv
                      k="Sticker Set Access Hash"
                      v={data.value.location.source.stickerSetAccessHash}
                    />
                  </>
                )}
              {"volumeId" in data.value.location.source && (
                <>
                  <Kv k="Volume ID" v={data.value.location.source.volumeId} />
                  <Kv k="Local ID" v={data.value.location.source.localId} />
                </>
              )}
            </>
          )}
          {data.value.fileReference && (
            <Kv
              c="col-span-2"
              k="Reference"
              v={"0x" +
                [...data.value.fileReference ?? new Uint8Array([0])].map((v) =>
                  v.toString(16).padStart(2, "0")
                ).join("").toUpperCase()}
            />
          )}
        </div>
      )}
    </div>
  );
}

function Kv({ k, v, c }: { k: string; v: ComponentChildren; c?: string }) {
  return (
    <div class={"flex flex-col gap-0.5 " + (c ?? "")}>
      <div class="font-bold text-xs">{k}</div>
      <div class="select-text text-ellipsis overflow-hidden">{v}</div>
    </div>
  );
}
