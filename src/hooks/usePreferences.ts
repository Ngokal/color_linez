import { useEffect, useState } from "react";
export interface Preferences {
  sound: boolean;
  animations: boolean;
  theme: "dark" | "light";
}
export function readStored<T>(
  key: string,
  fallback: T,
  validate: (value: unknown) => value is T,
): T {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
    return validate(value) ? value : fallback;
  } catch {
    return fallback;
  }
}
export function writeStored(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Storage can be unavailable in private browsing. */
  }
}
export function usePreferences() {
  const [preferences, setPreferences] = useState(() =>
    readStored<Preferences>(
      "linez.settings",
      { sound: true, animations: true, theme: "dark" },
      (v): v is Preferences =>
        typeof v === "object" &&
        v !== null &&
        "sound" in v &&
        typeof v.sound === "boolean" &&
        "animations" in v &&
        typeof v.animations === "boolean" &&
        "theme" in v &&
        (v.theme === "dark" || v.theme === "light"),
    ),
  );
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    writeStored("linez.settings", preferences);
    document.documentElement.dataset.theme = preferences.theme;
    document.documentElement.dataset.motion = String(
      preferences.animations && !reduced,
    );
  }, [preferences, reduced]);
  return {
    preferences,
    setPreferences,
    animate: preferences.animations && !reduced,
    reduced,
  };
}
