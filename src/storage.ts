import { importJourney } from "./saved-journey";
import type { SavedJourney } from "./types";

// Keep both the key and envelope compatible with existing Lockr saves.
export const JOURNEY_STORAGE_KEY = "toajourney";

export function loadJourney(
  storage: Pick<Storage, "getItem"> = localStorage,
): SavedJourney | null {
  const value = storage.getItem(JOURNEY_STORAGE_KEY);
  return value === null ? null : importJourney(value);
}

export function saveJourney(
  journey: SavedJourney,
  storage: Pick<Storage, "setItem"> = localStorage,
): void {
  storage.setItem(JOURNEY_STORAGE_KEY, JSON.stringify({ data: journey }));
}
