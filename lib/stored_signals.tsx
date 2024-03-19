import { signal } from "@preact/signals";
import { IS_BROWSER } from "$fresh/runtime.ts";

export function storedBoolean(defaultValue: boolean, key: string) {
  const signal_ = signal(
    IS_BROWSER ? localStorage.getItem(key) != null : defaultValue,
  );
  IS_BROWSER && signal_.subscribe((v) => {
    if (v) {
      localStorage.setItem(key, "");
    } else {
      localStorage.removeItem(key);
    }
  });
  return signal_;
}
