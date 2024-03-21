import { ComponentChildren } from "preact";
import { useEffect, useState } from "preact/hooks";
import {
  deserializeFileId,
  deserializeUniqueFileId,
  FileId,
  fileTypeMap,
  UniqueFileId,
} from "../lib/file_id.ts";
import { Input } from "../components/Input.tsx";
import { setHash } from "../lib/utils.ts";

export function FileIdAnalyzer() {
  const [fileId, setFileId] = useState(
    typeof location !== "undefined" ? location?.hash?.slice(1) ?? "" : "",
  );
  const [data, setData] = useState<FileId | UniqueFileId | null>(null);

  useEffect(() => {
    if (!fileId.trim()) {
      return;
    }
    if (typeof location !== "undefined") {
      setHash(fileId);
    }
    try {
      setData(deserializeFileId(fileId));
    } catch (err1) {
      try {
        setData(deserializeUniqueFileId(fileId));
      } catch (err2) {
        console.error("1", err1);
        console.error("2", err1);
        setData(null);
      }
    }
  }, [fileId]);

  return (
    <div class="flex flex-col w-full px-5">
      <Input
        type="text"
        value={fileId}
        placeholder="File ID"
        onKeyDown={(e) => setFileId(e.currentTarget.value)}
        onKeyPress={(e) => setFileId(e.currentTarget.value)}
      />
      <div class="text-xs opacity-50 pl-2 mt-2">
        Enter a file ID to analyze. Both file IDs and unqiue file IDs are
        supported as provided by Bot API, TDLib, or any other source adhering to
        their format.
      </div>
      {data && "unique" in data && data.unique && (
        <div class="gap-5 grid grid-cols-2 mt-5">
          <Kv k="Type" v={data.type} />
          {data.url && <Kv k="URL" v={data.url} />}
          {data.id && <Kv k="ID" v={String(data.id)} />}
        </div>
      )}
      {data && !("unique" in data) && (
        <div class="grid grid-cols-2 gap-5 mt-5">
          <Kv k="Type" v={fileTypeMap[data.type]} />
          <Kv k="DC" v={data.dcId} />
          {data.location.type == "web" && (
            <>
              <Kv k="URL" v={data.location.url} c="col-span-2" />
              <Kv
                k="Access Hash"
                v={String(data.location.accessHash)}
                c="col-span-2"
              />
            </>
          )}
          {data.location.type == "common" && (
            <>
              <Kv k="ID" v={String(data.location.id)} />
              <Kv k="Access Hash" v={String(data.location.accessHash)} />
            </>
          )}
          {data.location.type == "photo" && (
            <>
              <Kv k="ID" v={String(data.location.id)} />
              <Kv k="Access Hash" v={String(data.location.accessHash)} />
              {"chatId" in data.location.source &&
                (
                  <>
                    <Kv k="Chat ID" v={data.location.source.chatId} />
                    <Kv
                      k="Chat Access Hash"
                      v={data.location.source.chatAccessHash}
                    />
                  </>
                )}
              {"thumbnailType" in data.location.source && (
                <>
                  <Kv
                    k="Thumbnail File Type"
                    v={fileTypeMap[data.location.source.fileType]}
                  />
                  <Kv
                    k="Thumbnail Size"
                    v={String.fromCharCode(data.location.source.thumbnailType)}
                  />
                </>
              )}
              {"stickerSetId" in data.location.source &&
                (
                  <>
                    <Kv
                      k="Sticker Set ID"
                      v={data.location.source.stickerSetId}
                    />
                    <Kv
                      k="Sticker Set Access Hash"
                      v={data.location.source.stickerSetAccessHash}
                    />
                  </>
                )}
              {"volumeId" in data.location.source && (
                <>
                  <Kv k="Volume ID" v={data.location.source.volumeId} />
                  <Kv k="Local ID" v={data.location.source.localId} />
                </>
              )}
            </>
          )}
          {data.fileReference && (
            <Kv
              c="col-span-2"
              k="Reference"
              v={"0x" +
                [...data.fileReference ?? new Uint8Array([0])].map((v) =>
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
