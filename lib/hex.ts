import * as hex from "$std/encoding/hex.ts";

export function encodeHex(buffer: Uint8Array) {
  return hex.encodeHex(buffer).toUpperCase();
}

export function decodeHex(src: string) {
  return hex.decodeHex(src);
}
