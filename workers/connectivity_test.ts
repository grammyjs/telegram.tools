///<reference lib="webworker"/>
// Run _build.ts after editing this file.
import {
  Client,
  ClientPlain,
  DC,
  getRandomId,
  StorageMemory,
  TLWriter,
} from "mtkruto/mod.ts";
import { base64EncodeUrlSafe, rleEncode } from "mtkruto/1_utilities.ts";

addEventListener("message", async (e) => {
  await handleMessage(e.data);
}, { once: true });

async function handleMessage(
  data: [DC, Uint8Array | null],
  regenerateAuthKey = false,
) {
  let client;
  try {
    let [initialDc, authKey] = data;
    postMessage("connecting");
    if (!authKey || regenerateAuthKey) {
      const clientPlain = new ClientPlain({ initialDc });
      await clientPlain.connect();
      postMessage("exchanging-encryption-keys");
      authKey = await getAuthKey(initialDc);
    }
    let authString: string;
    {
      const writer = new TLWriter();
      writer.writeString(initialDc);
      writer.writeBytes(authKey);
      writer.writeInt32(0);
      writer.write(new Uint8Array([0]));
      writer.writeInt64(0n);
      authString = base64EncodeUrlSafe(rleEncode(writer.buffer));
    }
    postMessage(authKey);
    client = new Client({ storage: new StorageMemory() });
    await client.importAuthString(authString);
    await client.connect();
  } catch (err) {
    console.error(err);
    postMessage("failed");
    postMessage("done");
    return;
  }
  postMessage("pinging");
  try {
    for (let i = 0; i < 10; i++) {
      const then = now();
      try {
        await client.invoke({ _: "ping", ping_id: getRandomId() });
      } catch (err) {
        if (
          i == 0 && !regenerateAuthKey && String(err).includes("was closed") // TODO: Use MTKruto's ConnectionError with instanceof
        ) {
          await handleMessage(data, true);
          break;
        } else {
          console.error(err);
          postMessage("failed");
          break;
        }
      }
      postMessage(Math.ceil(now() - then));
      await new Promise((r) => setTimeout(r, 1000));
    }
  } finally {
    postMessage("done");
    await client.disconnect();
  }
}

function now() {
  if (typeof performance === "undefined") {
    return Date.now();
  } else {
    return performance.now();
  }
}

async function getAuthKey(dc: DC) {
  const clientPlain = new ClientPlain({ initialDc: dc });
  await clientPlain.connect();
  const authKey = await clientPlain.createAuthKey().then((v) => v[0]);
  await clientPlain.disconnect();
  return authKey;
}
