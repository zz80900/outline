import { useCallback } from "react";
import { useLocation } from "react-router-dom";
import { getSettingsMode, settingsPathForMode } from "~/utils/routeHelpers";
import { SettingsMode } from "~/utils/settings";

/**
 * Returns the settings mode represented by the current location.
 *
 * @returns the active settings mode, defaulting to simplified mode.
 */
export function useSettingsMode(): SettingsMode {
  const location = useLocation();
  return getSettingsMode(location.pathname) ?? SettingsMode.Simplified;
}

/**
 * Returns a path builder that preserves the active settings namespace.
 *
 * @returns a callback that builds settings paths for the current mode.
 */
export default function useSettingsPath() {
  const mode = useSettingsMode();

  return useCallback(
    (...args: string[]) => settingsPathForMode(mode, ...args),
    [mode]
  );
}
