import { defineConfig, Preset } from "@twind/core";
import presetTailwind from "@twind/preset-tailwind";
import presetAutoprefix from "@twind/preset-autoprefix";

export default {
  ...defineConfig({
    hash: true,
    presets: [presetTailwind() as Preset, presetAutoprefix() as Preset],
    theme: {
      extend: {
        fontFamily: {
          "inter": "InterVariable, system-ui, sans-serif",
        },
        colors: {
          background: "var(--background)",
          foreground: "var(--foreground)",
          "foreground-transparent": "var(--foreground-transparent)",
          grammy: "var(--grammy)",
          "button-text": "var(--button-text)",
          border: "var(--border)",
          "button-background": "var(--button-background)",
        },
        backgroundImage: {
          "gradient": "var(--gradient)",
        },
        animation: {
          marquee: "marquee 2s linear infinite",
          "spin-fast": "spin .5s linear infinite",
        },
        keyframes: {
          marquee: {
            "0%": { transform: "translateX(-200%)" },
            "100%": { transform: "translateX(200%)" },
          },
        },
      },
    },
  }),
  selfURL: import.meta.url,
};
