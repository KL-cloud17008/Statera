"use client";

import { useEffect, type ReactNode } from "react";

const THEME_STORAGE_KEY = "theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.remove("dark", "system");
    document.documentElement.classList.add("light");
    document.documentElement.style.colorScheme = "light";

    try {
      if (window.localStorage.getItem(THEME_STORAGE_KEY) !== "light") {
        window.localStorage.setItem(THEME_STORAGE_KEY, "light");
      }
    } catch {
      // Storage can be unavailable in strict privacy modes; the UI remains light.
    }
  }, []);

  return <>{children}</>;
}
