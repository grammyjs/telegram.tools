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
          "background-transparent": "var(--background-transparent)",
          foreground: "var(--foreground)",
          "foreground-transparent": "var(--foreground-transparent)",
          grammy: "var(--grammy)",
          "button-text": "var(--button-text)",
          border: "var(--border)",
          "button-background": "var(--button-background)",
          "danger-background": "var(--danger-background)",
          "danger-foreground": "var(--danger-foreground)",
        },
        backgroundImage: {
          "gradient": "var(--gradient)",
        },
        animation: {
          marquee: "marquee 2s linear infinite",
          "spin-fast": "spin .5s linear infinite",
          "in-opacity": "inOpacity 100ms linear both",
          "out-opacity": "outOpacity 100ms linear both",
          "in-scale": "inScale 100ms linear both",
          "out-scale": "outScale 100ms linear both",
          "in-select": "inSelect 100ms linear both",
          "out-select": "outSelect 100ms linear both",
        },
        keyframes: {
          marquee: {
            "0%": { transform: "translateX(-200%)" },
            "100%": { transform: "translateX(200%)" },
          },
          inOpacity: {
            from: { opacity: 0 },
            to: { opacity: 1 },
          },
          outOpacity: {
            from: { opacity: 1 },
            to: { opacity: 0 },
          },
          inScale: {
            from: { scale: 0.9 },
            to: { scale: 1 },
          },
          outScale: {
            from: { scale: 1 },
            to: { scale: 0.9 },
          },
          inSelect: {
            from: { opacity: 0, transform: "translateY(-5px)" },
            to: { opcaity: 1, transform: "translateY(0)" },
          },
          outSelect: {
            from: { opcaity: 1, transform: "translateY(0)" },
            to: { opacity: 0, transform: "translateY(-5px)" },
          },
        },
        boxShadow: {
          slct: "0px 10px 30px var(--shadow)",
        },
      },
    },
  }),
  selfURL: import.meta.url,
};
