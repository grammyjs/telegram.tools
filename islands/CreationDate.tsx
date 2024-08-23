import { ComponentChildren } from "preact";
import { signal, useSignalEffect } from "@preact/signals";

import { getHashSignal } from "../lib/hash.ts";
import { setHash } from "../lib/hash.ts";

import { timeAgo } from "time_ago/mod.ts";
import { predictCreationDate } from "../lib/creation_date.ts";

const hash = getHashSignal();
const getId = () => decodeURIComponent(hash.value.slice(1));

const data = signal<[string, Date] | null>(null);

export function CreationDate() {
  const id = getId();

  useSignalEffect(() => {
    const id = Number(getId());
    if (isNaN(id) || !id) {
      data.value = null;
      return;
    }

    data.value = predictCreationDate(id);
  });

  return (
    <div class="w-full mx-auto max-w-lg gap-5 flex flex-col items-center text-center">
      <div class={"flex flex-col gap-0.5 "}>
        <div
          class={`font-bold text-xs ${id.length ? "opacity-1" : "opacity-0"}`}
        >
          User ID
        </div>
        <input
          class="select-text text-ellipsis overflow-hidden focus:outline-none text-center bg-transparent placeholder:(text-foreground opacity-[.55]) text-lg"
          placeholder="Enter User ID"
          value={id}
          onKeyUp={(e) => setHash("#" + e.currentTarget.value)}
          onKeyPress={(e) => setHash("#" + e.currentTarget.value)}
        />
      </div>
      {data.value && (
        <div class="flex flex-col">
          <Kv
            k="Creation Date"
            v={`${
              data.value[0] == ">"
                ? "After "
                : data.value[0] == "<"
                ? "Before "
                : "Approximately "
            }${data.value[1].toDateString()} (${timeAgo(data.value[1])})`}
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
      <div class="select-text text-ellipsis overflow-hidden text-lg">{v}</div>
    </div>
  );
}
