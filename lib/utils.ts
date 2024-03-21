///<reference lib="dom" />
import { type ClassValue, clsx } from "https://esm.sh/clsx@2.1.0";
import { twMerge } from "https://esm.sh/tailwind-merge@2.2.1";

export function setHash(hash: string) {
  const url = new URL(location.href);
  url.hash = hash;
  history.replaceState({}, "", url);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function encodeHex(buffer: Uint8Array) { // TODO: replace with Deno std
  return [...buffer].map((v) => v.toString(16).padStart(2, "0")).join("")
    .toUpperCase();
}

export function decodeHex(hex: string) {
  return new Uint8Array(
    hex.split(/(.{2})/).filter((v) => v).map((v) => parseInt(v, 16)),
  );
}

export function prefixedLocalStorage(prefix: string) {
  if (!prefix.endsWith("_")) {
    prefix += "_";
  }
  return {
    getItem(key: string) {
      return localStorage.getItem(prefix + key);
    },
    removeItem(key: string) {
      return localStorage.removeItem(prefix + key);
    },
    setItem(key: string, value: string) {
      return localStorage.setItem(prefix + key, value);
    },
  };
}

export function prefixedSessionStorage(prefix: string) {
  if (!prefix.endsWith("_")) {
    prefix += "_";
  }
  return {
    getItem(key: string) {
      return sessionStorage.getItem(prefix + key);
    },
    removeItem(key: string) {
      return sessionStorage.removeItem(prefix + key);
    },
    setItem(key: string, value: string) {
      return sessionStorage.setItem(prefix + key, value);
    },
  };
}
