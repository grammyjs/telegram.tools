#!/usr/bin/env -S deno run -A --watch=static/,routes/

import dev from "$fresh/dev.ts";
import config from "./fresh.config.ts";

import "$std/dotenv/load.ts";

await dev(import.meta.url, "./main.ts", config);

// Fresh 1.6's native esbuild loader leaves a subprocess handle open on
// current Deno versions, so a successful production build never exits.
if (Deno.args.includes("build")) Deno.exit();
