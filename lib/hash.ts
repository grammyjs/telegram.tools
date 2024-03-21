///<reference lib="dom" />
import { IS_BROWSER } from "$fresh/runtime.ts";
import { ReadonlySignal, signal } from "@preact/signals";

export function getHashSignal() {
  const signal_ = signal(IS_BROWSER ? location.hash : "");

  IS_BROWSER && addEventListener("hashchange", () => {
    signal_.value = location.hash;
  });
  IS_BROWSER && addEventListener("popstate", () => {
    signal_.value = location.hash;
  });

  return signal_ as ReadonlySignal<string>;
}

export function setHash(hash: string) {
  const url = new URL(location.href);
  url.hash = hash;
  history.replaceState({}, "", url);
}
