"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  APP_SETTINGS_STORAGE_KEY,
  DEFAULT_APP_SETTINGS,
  parseAppSettings,
  serializeAppSettings,
  type AppSettings,
} from "@/lib/app-settings";
import {
  DEFAULT_EXERCISE_LIBRARY,
  type LibraryExercise,
} from "@/lib/exercise-library";

type AppSettingsContextValue = {
  settings: AppSettings;
  updateSettings: (updater: (current: AppSettings) => AppSettings) => void;
  resetSettings: () => void;
  allExercises: LibraryExercise[];
};

const APP_SETTINGS_EVENT = "fittrack:app-settings";
const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

function readSettingsSnapshot() {
  if (typeof window === "undefined") {
    return DEFAULT_APP_SETTINGS;
  }

  return parseAppSettings(
    window.localStorage.getItem(APP_SETTINGS_STORAGE_KEY)
  );
}

function subscribeToSettings(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleChange = () => callback();
  window.addEventListener("storage", handleChange);
  window.addEventListener(APP_SETTINGS_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(APP_SETTINGS_EVENT, handleChange);
  };
}

function writeSettings(nextSettings: AppSettings) {
  window.localStorage.setItem(
    APP_SETTINGS_STORAGE_KEY,
    serializeAppSettings(nextSettings)
  );
  window.dispatchEvent(new Event(APP_SETTINGS_EVENT));
}

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const settings = useSyncExternalStore(
    subscribeToSettings,
    readSettingsSnapshot,
    () => DEFAULT_APP_SETTINGS
  );

  const value = useMemo<AppSettingsContextValue>(
    () => ({
      settings,
      updateSettings: (updater) => {
        writeSettings(updater(settings));
      },
      resetSettings: () => writeSettings(DEFAULT_APP_SETTINGS),
      allExercises: [...DEFAULT_EXERCISE_LIBRARY, ...settings.customExercises],
    }),
    [settings]
  );

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error("useAppSettings must be used inside AppSettingsProvider");
  }

  return context;
}

