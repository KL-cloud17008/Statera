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

let memorySettings = DEFAULT_APP_SETTINGS;
let cachedStorageValue: string | null | undefined;
let cachedStorageSettings = DEFAULT_APP_SETTINGS;
let preferMemorySettings = false;

function readStoredSettingsValue() {
  try {
    return {
      available: true,
      value: window.localStorage.getItem(APP_SETTINGS_STORAGE_KEY),
    } as const;
  } catch {
    return {
      available: false,
      value: null,
    } as const;
  }
}

function readSettingsSnapshot() {
  if (typeof window === "undefined") {
    return DEFAULT_APP_SETTINGS;
  }

  if (preferMemorySettings) {
    return memorySettings;
  }

  const storedSettings = readStoredSettingsValue();
  if (!storedSettings.available) {
    return memorySettings;
  }

  if (storedSettings.value === cachedStorageValue) {
    return cachedStorageSettings;
  }

  cachedStorageValue = storedSettings.value;
  cachedStorageSettings = parseAppSettings(storedSettings.value);
  memorySettings = cachedStorageSettings;

  return cachedStorageSettings;
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
  const serializedSettings = serializeAppSettings(nextSettings);

  memorySettings = nextSettings;

  try {
    window.localStorage.setItem(APP_SETTINGS_STORAGE_KEY, serializedSettings);
    cachedStorageValue = serializedSettings;
    cachedStorageSettings = nextSettings;
    preferMemorySettings = false;
  } catch {
    preferMemorySettings = true;
  }

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

