import { assertEquals } from "$std/assert/mod.ts";
import { deserializeTelethon } from "./session_string.tsx";
import {
  deserializeGramjs,
  deserializePyrogram,
  serializeGramjs,
  serializePyrogram,
  serializeTelethon,
} from "./session_string.tsx";

Deno.test("Pyrogram", async (t) => {
  const dc = 2;
  const apiId = 1;
  const testMode = false;
  const authKey = new Uint8Array(256);
  const userId = 12456;
  const isBot = true;

  const serialized =
    "AgAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADCoAQ";
  await t.step("serialize", () => {
    assertEquals(
      serializePyrogram(dc, apiId, testMode, authKey, userId, isBot),
      serialized,
    );
  });

  await t.step("deserialize", () => {
    const deserialized = deserializePyrogram(serialized);
    assertEquals(deserialized.dc, dc);
    assertEquals(deserialized.apiId, apiId);
    assertEquals(deserialized.testMode, testMode);
    assertEquals(deserialized.authKey, authKey);
    assertEquals(deserialized.userId, userId);
    assertEquals(deserialized.isBot, isBot);
  });

  await t.step("smoke", () => {
  });
});

Deno.test("Telethon", async (t) => {
  const dc = 3;
  const ip = "0.0.0.0";
  const port = 80;
  const authKey = new Uint8Array(256);
  const serialized =
    "1AwAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

  await t.step("serializeTelethon", () => {
    assertEquals(
      serializeTelethon(dc, ip, port, authKey),
      serialized,
    );
  });
  await t.step("deserialize", () => {
    const deserialized = deserializeTelethon(serialized);
    assertEquals(deserialized.dc, dc);
    assertEquals(deserialized.ip, ip);
    assertEquals(deserialized.port, port);
    assertEquals(deserialized.authKey, authKey);
  });
});

Deno.test("GramJS", async (t) => {
  const dc = 3;
  const ip = "0.0.0.0";
  const port = 80;
  const authKey = new Uint8Array(256);
  const serialized =
    "1AwAEAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

  await t.step("serialize", () => {
    assertEquals(
      serializeGramjs(dc, ip, port, authKey),
      serialized,
    );
  });

  await t.step("deserialize", () => {
    const deserialized = deserializeGramjs(serialized);
    assertEquals(deserialized.dc, dc);
    assertEquals(deserialized.ip, ip);
    assertEquals(deserialized.port, port);
    assertEquals(deserialized.authKey, authKey);
  });
});
