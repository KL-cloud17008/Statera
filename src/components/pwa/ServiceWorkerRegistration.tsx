"use client";

import { useEffect } from "react";

const SW_URL = "/sw.js";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      return;
    }

    if (!("serviceWorker" in navigator)) {
      return;
    }

    const hadControllerOnLoad = Boolean(navigator.serviceWorker.controller);
    let isActive = true;
    let hasReloadedForUpdate = false;
    let registrationRef: ServiceWorkerRegistration | null = null;

    const updateRegistration = () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      void registrationRef?.update().catch(() => {
        // Update checks should fail quietly; users should still be able to use the app.
      });
    };

    const handleVisibilityChange = () => {
      updateRegistration();
    };

    const handleWindowFocus = () => {
      updateRegistration();
    };

    const handleControllerChange = () => {
      if (!hadControllerOnLoad || hasReloadedForUpdate) {
        return;
      }

      hasReloadedForUpdate = true;
      window.location.reload();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);
    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    void navigator.serviceWorker
      .register(SW_URL, {
        scope: "/",
        updateViaCache: "none",
      })
      .then((registration) => {
        if (!isActive) {
          return;
        }

        registrationRef = registration;

        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;

          if (!worker) {
            return;
          }

          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              updateRegistration();
            }
          });
        });

        updateRegistration();
      })
      .catch(() => {
        // Registration should fail quietly; the app must remain usable without PWA support.
      });

    return () => {
      isActive = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  return null;
}
