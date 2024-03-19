import { ComponentChildren } from "preact";

export function Card(
  { title, description, icon, href }: {
    title: string;
    description: ComponentChildren;
    icon: ComponentChildren;
    href: string;
  },
) {
  return (
    <a
      href={href}
      class="flex relative items-start justify-between gap-2 p-3 border border-border rounded-xl w-full min-h-[120px] select-none cursor-pointer shadow-[0_10px_10px_rgba(76,76,109,.0705882353)] bg-gradient"
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
