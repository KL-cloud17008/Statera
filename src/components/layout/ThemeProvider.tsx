"use client";

import { useEffect, type ReactNode } from "react";

const THEME_STORAGE_KEY = "theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.remove("light", "system");
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";

    try {
      if (window.localStorage.getItem(THEME_STORAGE_KEY) !== "dark") {
        window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
      }
    } catch {
      // Storage can be unavailable in strict privacy modes; the UI remains dark.
    }
  }, []);

  return <>{children}</>;
}
