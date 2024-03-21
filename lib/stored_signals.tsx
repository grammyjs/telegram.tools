import { IS_BROWSER } from "$fresh/runtime.ts";
import { signal } from "@preact/signals";

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

export function storedString(defaultValue: string, key: string) {
  const signal_ = signal(
    IS_BROWSER ? localStorage.getItem(key) ?? "" : defaultValue,
  );
  IS_BROWSER && signal_.subscribe((v) => {
    localStorage.setItem(key, v);
  });
  return signal_;
}
