import { ComponentChildren } from "preact";

export function Select(
  { text, caption, checked, onChange }: {
    text: ComponentChildren;
    caption: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
  },
) {
  return (
    <div
      class={`flex cursor-pointer relative items-start gap-2 px-3 py-2 ${
        checked ? "border-grammy border-2" : "border-border border-2"
      } rounded-xl shadow-sm bg-gradient`}
      onClick={() => onChange(!checked)}
      tabIndex={0}
      onKeyDown={(e) => e.key == "Enter" && onChange(!checked)}
    >
      <div class="flex flex-col">
        <div>{text}</div>
        <div class="text-[10px] opacity-50">{caption}</div>
      </div>
    </div>
  );
}
