import { type PageProps } from "$fresh/server.ts";
import { cn } from "../lib/cn.ts";

const metricsSnippet = Deno.env.get("METRICS_SNIPPET");

export default function App({ Component, url }: PageProps) {
  const layout = !["/update-explorer", "/connectivity-test"].includes(
    url.pathname,
  );
  return (
    <html>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: 'navigator.serviceWorker.register("/sw.js");',
          }}
        />
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/fonts.css" />
        <link rel="stylesheet" href="/main.css" />
        {metricsSnippet
          ? <script dangerouslySetInnerHTML={{ __html: metricsSnippet }} />
          : null}
      </head>
      <body
        class={cn(
          "font-inter bg-background text-foreground select-none",
          layout && "p-5 xl:p-10",
        )} // f-client-nav
      >
        {/* <Partial name="body"> */}
        {layout
          ? (
            <main class="mx-auto w-full max-w-[900px] flex flex-col">
              <Component />
            </main>
          )
          : <Component />}
        {/* </Partial> */}
      </body>
    </html>
  );
}
