import * as path from "$std/path/mod.ts";
import * as esbuild from "https://deno.land/x/esbuild@v0.20.1/mod.js";
import { denoPlugins } from "https://deno.land/x/esbuild_deno_loader@0.8.5/mod.ts";

const importMapURL = path.toFileUrl(path.join(Deno.cwd(), "deno.json"))
  .toString();

await esbuild.build({
  plugins: [...denoPlugins({ importMapURL })],
  entryPoints: ["./workers/connectivity_test.ts"],
  outfile: "static/connectivity-test/worker.js",
  bundle: true,
  format: "esm",
  minifyIdentifiers: true,
  minifySyntax: true,
  minifyWhitespace: true,
});

await esbuild.build({
  plugins: [...denoPlugins({ importMapURL })],
  entryPoints: ["./workers/update_explorer.ts"],
  outfile: "static/update-explorer/worker.js",
  bundle: true,
  format: "esm",
  minifyIdentifiers: true,
  minifySyntax: true,
  minifyWhitespace: true,
});

esbuild.stop();
