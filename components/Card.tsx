import { ComponentChildren } from "preact";

export function Card(
  { title, description, icon, href, disabled }: {
    title: string;
    description: ComponentChildren;
    icon: ComponentChildren;
    href: string;
    disabled?: boolean;
  },
) {
  return (
    <a
      href={disabled ? undefined : href}
      class={`flex relative items-start justify-between gap-2 p-3 border border-border rounded-xl w-full min-h-[120px] select-none overflow-hidden shadow-[0_10px_10px_rgba(76,76,109,.0705882353)] relative before:(absolute top-0 rounded-xl left-0 z-[-1] h-full w-[101%] bg-gradient) ${
        disabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer" 
      }`}
    >
      <div class="flex flex-col gap-1">
        <div class="font-semibold text-md">{title}</div>
        <div class="opacity-50 text-sm">{description}</div>
      </div>
      <div class="text-grammy pt-1">
        {icon}
      </div>
    </a>
  );
}
