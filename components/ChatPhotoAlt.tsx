import { ChatP } from "mtkruto/mod.ts";

const peerColors: Record<string, string> = {};
peerColors[0] = "#cc5049";
peerColors[1] = "#d67722";
peerColors[2] = "#955cdb";
peerColors[3] = "#40a920";
peerColors[4] = "#309eba";
peerColors[5] = "#368ad1";
peerColors[6] = "#c7508b";

export function ChatPhotoAlt({ children: chat }: { children: ChatP }) {
  return (
    <div
      class={`w-[40px] h-[40px] rounded-full bg-[${
        peerColors[chat.color] ?? "#333"
      }]`}
    >
    </div>
  );
}
