import {
  base64DecodeUrlSafe,
  base64EncodeUrlSafe,
} from "mtkruto/utilities/1_base64.ts";
import { bigIntFromBuffer } from "mtkruto/utilities/0_bigint.ts";
import { bufferFromBigInt } from "mtkruto/utilities/0_buffer.ts";
import { TLRawWriter } from "mtkruto/tl/0_tl_raw_writer.ts";
import { fromByteArray, parse } from "ipaddr.js";
import { decodeBase64, encodeBase64 } from "mtkruto/0_deps.ts";
import { TLRawReader } from "mtkruto/tl/0_tl_raw_reader.ts";

function writeUint16(value: number, writer: TLRawWriter) {
  writer.write(new Uint8Array(2));
  new DataView(writer.buffer.buffer).setUint16(writer.buffer.length - 2, value);
}
function readUint16(reader: TLRawReader) {
  return new DataView(reader.read(2).buffer).getUint16(0);
}

function writeInt16(value: number, writer: TLRawWriter) {
  writer.write(new Uint8Array(2));
  new DataView(writer.buffer.buffer).setInt16(writer.buffer.length - 2, value);
}
function readInt16(reader: TLRawReader) {
  return new DataView(reader.read(2).buffer).getInt16(0);
}

export const errInvalid = new Error("Invalid session string");

function base64EncodeUrlSafeNoTrim(data: ArrayBuffer | string) {
  return encodeBase64(data).replaceAll("+", "-").replaceAll("/", "_");
}
function base64DecodeUrlSafeNoTrim(data: string) {
  return decodeBase64(data.replaceAll("-", "+").replaceAll("_", "/"));
}

function base64EncodeUrlSafeNoTrimNoUrlSafe(data: ArrayBuffer | string) {
  return encodeBase64(data);
}
function base64DecodeUrlSafeNoTrimNoUrlSafe(data: string) {
  return decodeBase64(data);
}

export interface CommonSessionStringFormat {
  dc: number;
  ip?: string;
  ipv6?: boolean;
  port?: number;
  authKey: Uint8Array;
  testMode?: boolean;
  apiId?: number;
  userId?: number;
  isBot?: boolean;
}

/**
 * Telthon session strings
 *
 * +---------+------------------+-----------+
 * | Size    | Type             | Content   |
 * +---------+------------------+-----------+
 * | 1       | uint8 BE         | dc_id     |
 * | 4 or 16 | IPv4/IPv6 octets | ip        |
 * | 2       | uint16 BE        | port      |
 * | 255     | bytes            | auth_key  |
 * +---------+------------------+-----------+
 *
 * A constant "1" is appended after encoding in URL-safe Base64.
 */
export function serializeTelethon(
  dcId: number,
  ip: string,
  port: number,
  authKey: Uint8Array,
) {
  const writer = new TLRawWriter();
  writer.write(new Uint8Array([dcId, ...parse(ip).toByteArray()]));
  writeUint16(port, writer);
  writer.write(authKey);
  return "1" + base64EncodeUrlSafeNoTrim(writer.buffer);
}
export function deserializeTelethon(string: string): CommonSessionStringFormat {
  if (string[0] != "1") {
    throw errInvalid;
  }
  string = string.slice(1);
  const reader = new TLRawReader(base64DecodeUrlSafeNoTrim(string));

  const ipv4 = string.length == 352;
  const ipLen = ipv4 ? 4 : 16;

  const dc = reader.read(1)[0];
  const ip = fromByteArray(reader.read(ipLen)).toString();

  const port = readUint16(reader);
  const authKey = reader.buffer;

  return {
    dc,
    ip,
    ipv6: !ipv4,
    port,
    authKey,
  };
}

/**
 * GramJS session strings
 *
 * +-------------+------------------+-----------+
 * | Size        | Type             | Content   |
 * +-------------+------------------+-----------+
 * | 1           | uint8 BE         | dc_id     |
 * | 2           | int16 BE         | ip_length |
 * | <ip_length> | IPv4/IPv6 octets | ip        |
 * | 2           | int16 BE         | port      |
 * | 255         | bytes            | auth_key  |
 * +-------------+------------------+-----------+
 *
 * A constant "1" is appended after encoding in Base64 (not URL-safe).
 */
export function serializeGramjs(
  dcId: number,
  ip: string,
  port: number,
  authKey: Uint8Array,
) {
  const writer = new TLRawWriter();
  writer.write(new Uint8Array([dcId]));

  const ipBytes = parse(ip).toByteArray();
  writeInt16(ipBytes.length, writer);
  writer.write(new Uint8Array(ipBytes));

  writeInt16(port, writer);
  writer.write(authKey);

  return "1" + base64EncodeUrlSafeNoTrimNoUrlSafe(writer.buffer);
}
export function deserializeGramjs(string: string): CommonSessionStringFormat {
  if (string[0] != "1") {
    throw errInvalid;
  }
  string = string.slice(1);
  const reader = new TLRawReader(base64DecodeUrlSafeNoTrimNoUrlSafe(string));

  const dc = reader.read(1)[0];

  const ipLen = readInt16(reader);
  const ip = fromByteArray(reader.read(ipLen)).toString();

  const port = readInt16(reader);
  const authKey = reader.buffer;

  return {
    dc,
    ip,
    ipv6: ipLen != 4,
    port,
    authKey,
  };
}

/**
 * Pyrogram session strings
 *
 * +------+------------+------------+
 * | Size |   Type     |   Content  |
 * +------+------------+------------+
 * |    1 |  uint8     |  dc_id     |
 * |    4 |  uint32 BE |  api_id    |
 * |    1 |  boolean   |  test_mode |
 * |  255 |  bytes     |  auth_key  |
 * |    8 |  uint64 BE |  user_id   |
 * |    1 |  boolean   |  is_bot    |
 * +------+------------+------------+
 *
 * Encoded in URL-safe Base64, with the "=" at its end trimmed.
 */
export function serializePyrogram(
  dcId: number,
  apiId: number,
  testMode: boolean,
  authKey: Uint8Array,
  userId: number,
  isBot: boolean,
) {
  const writer = new TLRawWriter();
  writer.write(new Uint8Array([dcId]));
  writer.write(bufferFromBigInt(apiId, 32 / 8, false, false));
  writer.write(new Uint8Array([testMode ? 1 : 0]));
  writer.write(authKey);
  writer.write(bufferFromBigInt(userId, 64 / 8, false, false));
  writer.write(new Uint8Array([isBot ? 1 : 0]));
  return base64EncodeUrlSafe(writer.buffer);
}
export function deserializePyrogram(string: string): CommonSessionStringFormat {
  const reader = new TLRawReader(base64DecodeUrlSafe(string));
  if (reader.buffer.length != 271) {
    throw errInvalid;
  }
  const dc = reader.read(1)[0]; // 1
  const apiId = Number(bigIntFromBuffer(reader.read(32 / 8), false, false)); // 4
  const testMode = reader.read(1)[0] == 1; // 1
  const authKey = reader.read(256); // 256
  const userId = Number(bigIntFromBuffer(reader.read(64 / 8), false, false)); // 8
  const isBot = reader.read(1)[0] == 1; // 1

  return {
    dc,
    apiId,
    testMode,
    authKey,
    userId,
    isBot,
  };
}

/**
 * mtcute session strings
 *
 * +--------+------------+------------+
 * |  Size  |    Type    |  Content   |
 * +--------+------------+------------+
 * | 1      | 0x03 const | version    |
 * | 4      | int32 LE   | flags      |
 * | 1      | 0x01 const | dc_version |
 * | 1      | uint8      | dc_id      |
 * | 1      | uint8      | dc_flags   |
 * | varies | TL string  | dc_ip      |
 * | 4      | int32 LE   | dc_port    |
 * | 8      | int64 LE   | user_id    |
 * | 1      | boolean    | is_bot     |
 * | 256    | bytes      | auth_key   |
 * +--------+------------+------------+
 *
 * Encoded in URL-safe Base64, with the "=" at its end trimmed.
 */
export function serializeMtcute(
  testMode: boolean,
  primaryDc: MtcuteDC,
  mediaDc: MtcuteDC | null,
  userId: number,
  isBot: boolean,
  authKey: Uint8Array,
) {
  const writer = new TLRawWriter();
  writer.write(new Uint8Array([0x03])); // version

  let flags = MTCUTE_HAS_SELF_FLAG;
  if (mediaDc != null) {
    flags |= MTCUTE_MEDIA_DC_FLAG;
  }
  if (testMode) {
    flags |= MTCUTE_TEST_MODE_FLAG;
  }
  writer.writeInt32(flags); // flags

  writer.writeBytes(serializeMtcuteDc(primaryDc));
  if (mediaDc != null) {
    writer.writeBytes(serializeMtcuteDc(mediaDc));
  }

  writer.writeInt64(BigInt(userId)); // user_id
  writer.writeInt32(isBot ? 0x997275b5 : 0xbc799737, false); // is_bot
  writer.writeBytes(authKey); // authKey

  return base64EncodeUrlSafe(writer.buffer);
}
function serializeMtcuteDc(dc: MtcuteDC) {
  const writer = new TLRawWriter();
  writer.write(new Uint8Array([0x01])); // dc_version
  writer.write(new Uint8Array([dc.id])); // dc_id
  let flags = 0;
  if (dc.ip.includes(":")) {
    flags |= MTCUTE_DC_IPV6_FLAG;
  }
  if (dc.media) {
    flags |= MTCUTE_DC_MEDIA_FLAG;
  }
  writer.write(new Uint8Array([flags])); // dc_flags
  writer.writeString(dc.ip); // dc_ip
  writer.writeInt32(dc.port); // dc_port
  return writer.buffer;
}
export interface MtcuteDC {
  id: number;
  ip: string;
  port: number;
  media?: true;
}
const MTCUTE_HAS_SELF_FLAG = 1;
const MTCUTE_TEST_MODE_FLAG = 2;
const MTCUTE_MEDIA_DC_FLAG = 4;

const MTCUTE_DC_IPV6_FLAG = 1;
const MTCUTE_DC_MEDIA_FLAG = 2;
