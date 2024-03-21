import { useEffect, useState } from "preact/hooks";
import { cn } from "../lib/utils.ts";

export function Select<T extends string>(
  { value, values, onChange }: {
    value: T;
    values: T[];
    onChange: (value: T) => void;
  },
) {
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState<T | null>(null);

  useEffect(() => void (!focused && setActive(null)), [focused]);

  return (
    <div
      class="relative w-full rounded-lg"
      onBlurCapture={(e) => {
        if (e.relatedTarget instanceof HTMLButtonElement) {
          const value = e.relatedTarget.getAttribute("data-value");
          if (value) {
            return;
          }
        }
        setFocused(false);
      }}
      onClick={(e) => {
        const value = e.target instanceof HTMLElement
          ? e.target.getAttribute("data-value")
          : null;
        if (value) {
          onChange(value as T);
          setFocused(false);
        } else if (
          e.target == e.currentTarget ||
          (e.target instanceof HTMLElement &&
            e.target.getAttribute("data-x") != null)
        ) {
          setFocused(!focused);
        }
      }}
      onKeyPress={(e) => {
        if (e.key == "Enter" && focused) {
          active != null && onChange(active);
          setFocused(false);
        }
      }}
      onKeyDown={(e) => {
        if (!focused) return;
        switch (e.key) {
          case "ArrowUp": {
            const prev = values.indexOf(active != null ? active : value) - 1;
            if (prev < 0) {
              setActive(values[values.length - 1]);
            } else {
              setActive(values[prev]);
            }
            break;
          }
          case "ArrowDown": {
            const next = values.indexOf(active != null ? active : value) + 1;
            if (next <= values.length - 1) {
              setActive(values[next]);
            } else {
              setActive(values[0]);
            }
            break;
          }
          case "Escape":
            focused && setFocused(false);
        }
      }}
      tabIndex={0}
    >
      <div
        class={`bg-foreground-transparent placeholder:(text-foreground opacity-[.55]) rounded-lg w-full px-3 py-1.5 focus:(outline-none) ${
          focused ? "rounded-b-none" : "rounded-b-lg"
        }`}
        data-x
      >
        <div data-x>{value}</div>
        <div class="absolute h-full top-0 right-1 flex items-center" data-x>
          <Icon />
        </div>
        <div
          data-x
          class="w-full h-full absolute bg-transparent group-hover:cursor-pointer"
        />
        <div
          data-x
          class="w-full h-full absolute bg-transparent hidden group-focus:block"
        />
      </div>
      <div
        class={`bg-background z-[100] absolute top-[calc(100%+0rem)] w-full border border-border rounded-lg rounded-t-none p-1 shadow-sm ${
          focused ? "block" : "hidden"
        }`}
      >
        {values.map((v) => (
          <button
            type="button"
            tabIndex={-1}
            class={cn(
              "px-3 py-1.5 w-full focus:(bg-border outline-none) rounded-lg text-left border-none cursor-default flex items-center justify-between",
              value == v && "font-semibold",
              active == v && "bg-border",
            )}
            onMouseEnter={(e) => {
              setActive(e.currentTarget.getAttribute("data-value") as T | null);
            }}
            data-value={v}
          >
            <span data-value={v}>{v}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Icon() {
  return (
    <svg
      data-x
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="pointer-events-none h-4 w-4 opacity-50"
      aria-hidden="true"
    >
      <path
        d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.35753 11.9939 7.64245 11.9939 7.81819 11.8182L10.0682 9.56819Z"
        fill="currentColor"
        fill-rule="evenodd"
        clip-rule="evenodd"
      >
      </path>
    </svg>
  );
}
