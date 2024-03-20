import { type PageProps } from "$fresh/server.ts";
import { Partial } from "$fresh/runtime.ts";

export default function App({ Component, url }: PageProps) {
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
      </head>
      <body
        class="font-inter bg-background text-foreground select-none"
        f-client-nav
      >
        <Partial name="body">
          {["/update-explorer", "/connectivity-test"].includes(url.pathname)
            ? <Component />
            : (
              <main class="mx-auto w-full max-w-[900px] p-5 xl:(p-10) flex flex-col">
                <Component />
              </main>
            )}
        </Partial>
      </body>
    </html>
  );
}
