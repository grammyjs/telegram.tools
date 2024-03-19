importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js",
);

workbox.routing.registerRoute(
  ({ url }) =>
    url.hostname == "durov.deno.dev" &&
    (url.pathname.startsWith("/fonts/") || url.pathname.startsWith("/MTKruto")),
  new workbox.strategies.CacheFirst(),
);
