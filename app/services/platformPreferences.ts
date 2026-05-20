"use client";

import { useEffect, useState } from "react";

export type PlatformTheme = "claro" | "oscuro" | "automatico";
export type PlatformLanguage = "es" | "en" | "auto";

export type PlatformPreferences = {
  theme: PlatformTheme;
  language: PlatformLanguage;
};

const PLATFORM_PREFERENCES_KEY = "ce_platform_preferences";
const PANEL_CONFIG_STORAGE_KEY = "ce_panel_config";
const PREFERENCES_EVENT = "ce-platform-preferences-change";

const defaultPreferences: PlatformPreferences = {
  theme: "oscuro",
  language: "es",
};

function applyPlatformPreferences(preferences: PlatformPreferences) {
  if (typeof document === "undefined") return;

  const theme = resolvePlatformTheme(preferences.theme);
  const language = resolvePlatformLanguage(preferences.language);
  document.documentElement.dataset.ceTheme = theme;
  document.documentElement.dataset.ceLanguage = language;
  document.documentElement.style.colorScheme = theme;
}

function isTheme(value: unknown): value is PlatformTheme {
  return value === "claro" || value === "oscuro" || value === "automatico";
}

function isLanguage(value: unknown): value is PlatformLanguage {
  return value === "es" || value === "en" || value === "auto";
}

function safeParse(value: string | null) {
  if (!value) return null;

  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function readPlatformPreferences(): PlatformPreferences {
  if (typeof window === "undefined") return defaultPreferences;

  const globalPreferences = safeParse(
    window.localStorage.getItem(PLATFORM_PREFERENCES_KEY)
  );
  if (globalPreferences) {
    return {
      theme: isTheme(globalPreferences.theme)
        ? globalPreferences.theme
        : defaultPreferences.theme,
      language: isLanguage(globalPreferences.language)
        ? globalPreferences.language
        : defaultPreferences.language,
    };
  }

  const panelConfig = safeParse(window.localStorage.getItem(PANEL_CONFIG_STORAGE_KEY));
  return {
    theme: isTheme(panelConfig?.modoSistema)
      ? panelConfig.modoSistema
      : defaultPreferences.theme,
    language: isLanguage(panelConfig?.idiomaSistema)
      ? panelConfig.idiomaSistema
      : defaultPreferences.language,
  };
}

export function resolvePlatformTheme(theme: PlatformTheme): "light" | "dark" {
  if (theme === "claro") return "light";
  if (theme === "oscuro") return "dark";

  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  return "dark";
}

export function resolvePlatformLanguage(language: PlatformLanguage): "es" | "en" {
  if (language === "en") return "en";
  return "es";
}

export function savePlatformPreferences(
  preferences: Partial<PlatformPreferences>
) {
  if (typeof window === "undefined") return;

  const current = readPlatformPreferences();
  const next: PlatformPreferences = {
    theme: isTheme(preferences.theme) ? preferences.theme : current.theme,
    language: isLanguage(preferences.language)
      ? preferences.language
      : current.language,
  };

  window.localStorage.setItem(PLATFORM_PREFERENCES_KEY, JSON.stringify(next));

  const panelConfig = safeParse(window.localStorage.getItem(PANEL_CONFIG_STORAGE_KEY));
  window.localStorage.setItem(
    PANEL_CONFIG_STORAGE_KEY,
    JSON.stringify({
      ...(panelConfig || {}),
      modoSistema: next.theme,
      idiomaSistema: next.language,
    })
  );

  window.dispatchEvent(new CustomEvent(PREFERENCES_EVENT, { detail: next }));
  applyPlatformPreferences(next);
}

export function usePlatformPreferences() {
  const [preferences, setPreferences] =
    useState<PlatformPreferences>(() => readPlatformPreferences());

  useEffect(() => {
    const initialPreferences = readPlatformPreferences();
    setPreferences(initialPreferences);
    applyPlatformPreferences(initialPreferences);

    const syncPreferences = () => {
      const nextPreferences = readPlatformPreferences();
      setPreferences(nextPreferences);
      applyPlatformPreferences(nextPreferences);
    };

    window.addEventListener("storage", syncPreferences);
    window.addEventListener(PREFERENCES_EVENT, syncPreferences);

    return () => {
      window.removeEventListener("storage", syncPreferences);
      window.removeEventListener(PREFERENCES_EVENT, syncPreferences);
    };
  }, []);

  return preferences;
}
