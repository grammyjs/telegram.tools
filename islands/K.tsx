import { signal, useSignal } from "@preact/signals";
import { IS_BROWSER } from "$fresh/runtime.ts";
import {
  Client,
  InactiveChat,
  setLogVerbosity,
  StorageIndexedDB,
} from "mtkruto/mod.ts";
import { Spinner2 } from "../components/icons/Spinner.tsx";
import { timeAgo } from "time_ago/mod.ts";
import { ChatPhotoAlt } from "../components/ChatPhotoAlt.tsx";
import { decodeHex } from "../lib/hex.ts";

setLogVerbosity(8);
const client = IS_BROWSER
  ? new Client(
    new StorageIndexedDB("inactive-chats"),
    1,
    "a",
    { storeMessages: true },
  )
  : new Client();
const clientConnected = signal(false);

interface MyInactiveChat extends InactiveChat {
  photoUrl?: string;
  strippedThumbnail?: string;
}
const inactiveChats = signal(new Array<MyInactiveChat>());

const JPEG_HEADER = decodeHex(
  "ffd8ffe000104a46494600010100000100010000ffdb004300281c1e231e19282321232d2b28303c64413c37373c7b585d4964918099968f808c8aa0b4e6c3a0aadaad8a8cc8ffcbdaeef5ffffff9bc1fffffffaffe6fdfff8ffdb0043012b2d2d3c353c76414176f8a58ca5f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8ffc00011080000000003012200021101031101ffc4001f0000010501010101010100000000000000000102030405060708090a0bffc400b5100002010303020403050504040000017d01020300041105122131410613516107227114328191a1082342b1c11552d1f02433627282090a161718191a25262728292a3435363738393a434445464748494a535455565758595a636465666768696a737475767778797a838485868788898a92939495969798999aa2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae1e2e3e4e5e6e7e8e9eaf1f2f3f4f5f6f7f8f9faffc4001f0100030101010101010101010000000000000102030405060708090a0bffc400b51100020102040403040705040400010277000102031104052131061241510761711322328108144291a1b1c109233352f0156272d10a162434e125f11718191a262728292a35363738393a434445464748494a535455565758595a636465666768696a737475767778797a82838485868788898a92939495969798999aa2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae2e3e4e5e6e7e8e9eaf2f3f4f5f6f7f8f9faffda000c03010002110311003f00",
);
const JPEG_FOOTER = decodeHex("ffd9");
function getStrippedThumbnail(stripped: Uint8Array) {
  if (stripped.byteLength < 3 || stripped[0] !== 1) {
    return undefined;
  }
  const header = new Uint8Array(JPEG_HEADER);
  header[164] = stripped[1];
  header[166] = stripped[2];
  return URL.createObjectURL(
    new Blob([header, stripped.slice(3), JPEG_FOOTER], { type: "image/jpg" }),
  );
}


IS_BROWSER && Promise.resolve().then(async () => {
  client.on("connectionState", ({ connectionState }) => {
    clientConnected.value = connectionState == "ready";
  });
  await client.start();
  const a = localStorage.getItem("inactiveChats");
  if (a != null) {
    inactiveChats.value = JSON.parse(a);
  } else {
    inactiveChats.value = await client.getInactiveChats();
    localStorage.setItem("inactiveChats", JSON.stringify(inactiveChats));
  }
  for (const [i, chat] of inactiveChats.value.entries()) {
    console.log('a')
    const a = await client.getChat(chat.chat.id);
    console.log(a)
    if (a.photo?.strippedThumbnail) {
      const k = getStrippedThumbnail(a.photo.strippedThumbnail);
      console.log(k)
      inactiveChats.value[i] = {
        ...chat,
        strippedThumbnail: k,
      };
      inactiveChats.value = Array.from(inactiveChats.value);
    }
    continue;
    // const fileId = chat.photo?.smallFileId ?? null;
    // if (i > 4) {
    //   break
    // }
    // if (!fileId) {
    //   continue;
    // }
    // const then = performance.now();
    // const chunks = new Array<Uint8Array>();
    // console.log("dl", chat.chat.id, fileId);
    // for await (const chunk of client.download(fileId)) {
    //   chunks.push(chunk);
    // }
    // console.log("Download took", performance.now() - then);
    // inactiveChats.value[i] = {
    //   ...chat,
    //   photoUrl: URL.createObjectURL(new Blob(chunks, { type: "image/jpg" })),
    // };
    // console.log(inactiveChats.value[i].photoUrl);
    // inactiveChats.value = Array.from(inactiveChats.value);
  }
});

export function K() {
  if (!IS_BROWSER || !clientConnected.value) {
    return null;
  }
  return (
    <div class="flex flex-col mb-20 max-w-lg w-full mx-auto">
      {!inactiveChats.value.length && (
        <div class="gap-1.5 flex text-xs opacity-50 items-center">
          <Spinner2 size={10} /> <span>Loading</span>
        </div>
      )}
      {!!inactiveChats.value.length && (
        <>
          <div class="flex gap-2 items-center justify-between pb-2 border-b border-border">
            <div class="text-xs opacity-50">
              {inactiveChats.value.length == 0
                ? "No"
                : inactiveChats.value.length}{" "}
              inactive chat{inactiveChats.value.length == 1 ? "" : "s"}
            </div>
            <div class="text-xs opacity-50 hover:underline cursor-pointer">
              Sign out
            </div>
          </div>
          {inactiveChats.value.map((v) => <Chat key={v.chat.id}>{v}</Chat>)}
        </>
      )}
    </div>
  );
}

function Chat({ children: ic }: { children: MyInactiveChat }) {
  const i = useSignal(false);

  return (
    <div
      class="w-full items-start flex gap-2 justify-between border-b border-border py-2 relative"
      tabIndex={1}
      onClick={() => i.value = !i.value}
      onfocusout={() => i.value = false}
      onKeyPress={(e) => e.key == "Enter" && (i.value = !i.value)}
    >
      <div class="flex shrink-0 items-center gap-2">
        {!ic.strippedThumbnail ? <ChatPhotoAlt>{ic.chat}</ChatPhotoAlt> : (
          <img
            src={ic.strippedThumbnail}
            class="w-[40px] h-[40px] rounded-full backdrop-blur-lg"
          />
        )}
        <div class="flex flex-col">
          <div class="font-semibold">
            {"title" in ic.chat ? ic.chat.title : ""}
          </div>
          <div class="text-xs opacity-50">
            Last active {timeAgo(new Date(ic.lastActivity))}
          </div>
        </div>
      </div>
      <div class="text-xs opacity-50">
        {ic.chat.type == "supergroup" ? "group" : ic.chat.type}
      </div>
      {i.value && (
        <div class="absolute top-full z-[100] bg-background w-full rounded-t-none border border-border rounded-lg p-1 shadow-sm">
          <button
            type="button"
            tabIndex={-1}
            class="px-3 py-1.5 w-full text-red-500 focus:(bg-border outline-none) rounded-lg text-left border-none cursor-default flex items-center justify-between"
            // {cn(

            // value == v && "font-semibold",
            // active == v && "bg-border",
            // )}
            onMouseEnter={(e) => {
              // setActive(e.currentTarget.getAttribute("data-value") as T | null);
            }}
            // data-value={v}
          >
            Evacuate & Leave
          </button>
          <button
            type="button"
            tabIndex={-1}
            class="px-3 py-1.5 w-full text-red-500 focus:(bg-border outline-none) rounded-lg text-left border-none cursor-default flex items-center justify-between"
            // {cn(

            // value == v && "font-semibold",
            // active == v && "bg-border",
            // )}
            onMouseEnter={(e) => {
              // setActive(e.currentTarget.getAttribute("data-value") as T | null);
            }}
            // data-value={v}
          >
            Evacuate
          </button>
          <button
            type="button"
            tabIndex={-1}
            class="px-3 py-1.5 w-full text-red-500 focus:(bg-border outline-none) rounded-lg text-left border-none cursor-default flex items-center justify-between"
            // {cn(

            // value == v && "font-semibold",
            // active == v && "bg-border",
            // )}
            onMouseEnter={(e) => {
              // setActive(e.currentTarget.getAttribute("data-value") as T | null);
            }}
            // data-value={v}
          >
            Leave
          </button>
        </div>
      )}
    </div>
  );
}
