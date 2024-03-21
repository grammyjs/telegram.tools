import { assertEquals } from "$std/assert/mod.ts";

import {
  deserializeGramjs,
  deserializeMtkruto,
  deserializePyrogram,
  deserializeTelethon,
  serializeGramjs,
  serializeMtcute,
  serializePyrogram,
  serializeTelethon,
} from "./session_string.ts";

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
});

Deno.test("Telethon", async (t) => {
  const dc = 3;
  const ip = "0.0.0.0";
  const port = 80;
  const authKey = new Uint8Array(256);
  const serialized =
    "1AwAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

  await t.step("serialize", () => {
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

Deno.test("mtcute", async (t) => {
  const serialized =
    "AwUAAAAXAQIADjE0OS4xNTQuMTY3LjUwALsBAAAXAQICDzE0OS4xNTQuMTY3LjIyMrsBAAA5MAAAAAAAADeXebwgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
  const primaryDc = { id: 2, ip: "149.154.167.50", port: 443 } as const;
  const mediaDc = {
    id: 2,
    ip: "149.154.167.222",
    port: 443,
    media: true,
  } as const;
  const isBot = false;
  const userId = 12345;
  const testMode = false;
  const authKey = new Uint8Array(32);

  await t.step("serialize", () => {
    assertEquals(
      serializeMtcute(
        testMode,
        primaryDc,
        mediaDc,
        userId,
        isBot,
        authKey,
      ),
      serialized,
    );
  });
});

Deno.test("MTKruto", async (t) => {
  const dc = "2";
  const authKey = new Uint8Array(256);
  const serialized = "ATIAAv4AAQEA_wAC";

  await t.step("deserialize", () => {
    const deserialized = deserializeMtkruto(serialized);
    assertEquals(deserialized.dc, dc);
    assertEquals(deserialized.authKey, authKey);
  });
});
