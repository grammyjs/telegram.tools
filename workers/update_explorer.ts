///<reference lib="webworker"/>
// Run _build.ts after editing this file.
import { Bot, GrammyError } from "grammy/mod.ts";

import { Db } from "../lib/update_explorer_db.ts";

addEventListener("message", async (e) => {
  const bot = new Bot(e.data);
  // deno-lint-ignore no-explicit-any
  (globalThis as any).bot = bot; // for debugging
  const db = new Db(e.data);
  const startedAt = Date.now();
  try {
    await bot.init();
    // @ts-ignore: please
    postMessage({ _: "me", me: bot.me });
  } catch (err) {
    let error = "";
    if (err instanceof GrammyError) {
      error = err.description == "Unauthorized"
        ? "Invalid bot token"
        : err.description;
    } else {
      error = String(err);
    }
    error = `Authorization failed: ${error}`;
    postMessage({ _: "error", error });
    return;
  }
  bot.use((ctx, next) => {
    db.updates.put({
      updateId: ctx.update.update_id,
      data: ctx.update,
    });
    if (!ctx.msg?.date || ctx.msg.date <= startedAt) {
      postMessage({ _: "sound" });
    }
    return next(); // allow handlers added by the user
  });
  bot.start();
}, { once: true });

// }, { once: true });
