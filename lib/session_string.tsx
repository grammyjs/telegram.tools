import { base64EncodeUrlSafe } from "mtkruto/utilities/1_base64.ts";
import { bufferFromBigInt } from "mtkruto/utilities/0_buffer.ts";
import { TLRawWriter } from "mtkruto/tl/0_tl_raw_writer.ts";
import { parse } from "ipaddr.js";
import { encodeBase64 } from "mtkruto/0_deps.ts";

function writeUint16(value: number, writer: TLRawWriter) {
  writer.write(new Uint8Array(2));
  new DataView(writer.buffer.buffer).setUint16(writer.buffer.length - 2, value);
}

function writeInt16(value: number, writer: TLRawWriter) {
  writer.write(new Uint8Array(2));
  new DataView(writer.buffer.buffer).setInt16(writer.buffer.length - 2, value);
}

export function base64EncodeUrlSafeNoTrim(data: ArrayBuffer | string) {
  return encodeBase64(data).replaceAll("+", "-").replaceAll("/", "_");
}

export function base64EncodeUrlSafeNoTrimNoUrlSafe(data: ArrayBuffer | string) {
  return encodeBase64(data);
}

/**
 * Serialize a Telethon session string.
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

/**
 * Serialize a GramJS session string.
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
export function serializeGramJS(
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

/**
 * Serialize a Pyrogram session string.
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
  return base64EncodeUrlSafe(writer.buffer).replace(/(=+)$/, "");
}

/**
 * Serialize an mtcute session string.
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
  dcId: number,
  ip: string,
  port: number,
  userId: number,
  isBot: boolean,
  authKey: Uint8Array,
) {
  const writer = new TLRawWriter();
  writer.write(new Uint8Array([0x03])); // version
  writer.writeInt32(
    MTCUTE_HAS_SELF_FLAG | (testMode ? MTCUTE_TEST_MODE_FLAG : 0),
  ); // flags

  writer.write(new Uint8Array([0x01])); // dc_version
  writer.writeBytes(new Uint8Array([dcId])); // dc_id
  writer.writeInt32(ip.includes(":") ? MTCUTE_IPV6_FLAG : 0); // dc_flags
  writer.writeString(ip); // dc_ip
  writer.writeInt32(port); // dc_port

  writer.writeInt64(BigInt(userId)); // user_id
  writer.write(new Uint8Array([isBot ? 1 : 0])); // is_bot
  writer.write(authKey); // authKey

  return base64EncodeUrlSafe(writer.buffer);
}
const MTCUTE_HAS_SELF_FLAG = 1;
const MTCUTE_TEST_MODE_FLAG = 2; // TODO: flag 4?
const MTCUTE_IPV6_FLAG = 1;
