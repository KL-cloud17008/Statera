/// <reference lib="webworker" />
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";
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
] satisfies RuntimeCaching[];

const appRuntimeCaching = [
  {
    matcher: ({
      request,
      sameOrigin,
      url,
    }: {
      request: Request;
      sameOrigin: boolean;
      url: URL;
    }) =>
      sameOrigin &&
      (request.mode === "navigate" ||
        url.pathname.startsWith("/_next/") ||
        url.pathname.startsWith("/api/")),
    handler: new NetworkOnly(),
  },
] satisfies RuntimeCaching[];

const injectedPrecacheEntries = self.__SW_MANIFEST ?? [];

const serwist = new Serwist({
  precacheEntries: injectedPrecacheEntries.filter(() => false),
  precacheOptions: {
    cleanupOutdatedCaches: true,
  },
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [...pwaControlCaching, ...appRuntimeCaching],
});

serwist.addEventListeners();

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();

      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    })(),
  );
});
