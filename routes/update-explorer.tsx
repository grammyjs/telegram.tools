import { Head } from "$fresh/runtime.ts";
import { UpdateExplorer } from "../islands/UpdateExplorer.tsx";

export default () => (
  <>
    <Head>
      <link rel="stylesheet" href="/update-explorer/prism.css" />
    </Head>
    <UpdateExplorer />
  </>
);
