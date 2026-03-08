/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope &
  typeof globalThis &
  SerwistGlobalConfig & {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  };

const PWA_CONTROL_PATHS = new Set([
  "/manifest.json",
  "/sw.js",
  "/icons/apple-touch-icon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
]);

const pwaControlCaching = [
  {
    matcher: ({ sameOrigin, url }: { sameOrigin: boolean; url: URL }) =>
      sameOrigin && PWA_CONTROL_PATHS.has(url.pathname),
    handler: new NetworkOnly(),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: {
    cleanupOutdatedCaches: true,
  },
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [...pwaControlCaching, ...defaultCache],
});

serwist.addEventListeners();

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames.map(async (cacheName) => {
          const cache = await caches.open(cacheName);
          const requests = await cache.keys();

          await Promise.all(
            requests.map(async (request) => {
              const url = new URL(request.url);

              if (url.origin !== self.location.origin || !PWA_CONTROL_PATHS.has(url.pathname)) {
                return;
              }

              await cache.delete(request);
            }),
          );
        }),
      );
    })(),
  );
});
