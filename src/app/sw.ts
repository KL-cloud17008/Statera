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
const offlinePage = "/offline-workout";
const offlineCache = "athanor-offline-precache-v1";
const staticEntries = injectedPrecacheEntries.filter(entry => {
  const url = new URL(typeof entry === "string" ? entry : entry.url, self.location.origin);
  return url.origin === self.location.origin && url.pathname.startsWith("/_next/static/");
});
const buildManifest = staticEntries.find(entry => (typeof entry === "string" ? entry : entry.url).endsWith("/_buildManifest.js"));
const shellRevision = (typeof buildManifest === "string" ? buildManifest : buildManifest?.url)?.split("/").at(-2) ?? "1";

const serwist = new Serwist({
  // Only public assets and a page shell with no user data are precached.
  precacheEntries: [...staticEntries, { url: offlinePage, revision: shellRevision }],
  precacheOptions: {
    cacheName: offlineCache,
    cleanupOutdatedCaches: true,
  },
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [...pwaControlCaching, ...appRuntimeCaching],
  fallbacks: { entries: [{
    url: offlinePage,
    matcher: ({ request }) => request.mode === "navigate" && request.method === "GET" && new URL(request.url).pathname === "/workout",
  }] },
});

serwist.addEventListeners();

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();

      await Promise.all(cacheNames.filter(name => name !== offlineCache).map(name => caches.delete(name)));
    })(),
  );
});
