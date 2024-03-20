import { Head } from "$fresh/runtime.ts";
import { UpdateExplorer } from "../islands/UpdateExplorer.tsx";

export default () => (
  <>
    <Head>
      <link
        rel="stylesheet"
        href="/update-explorer/coy.css"
        media="(prefers-color-scheme: light)"
      />
      <link
        rel="stylesheet"
        href="/update-explorer/prism.css"
        media="(prefers-color-scheme: dark)"
      />
    </Head>
    <UpdateExplorer />
  </>
);
