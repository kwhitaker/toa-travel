export type Seed = string | number;
export type Weather = "sun" | "rain" | "storm";
export type Direction = "N" | "NE" | "SE" | "S" | "SW" | "NW";
export type EncounterRoll = number | "none";

export type Encounter =
  { type: string; count: number } | { type: string; info: string };

export interface EncounterDetail {
  terrain: string;
  encounter: Encounter;
}

export type EncounterDetailsData = EncounterDetail[][];

export interface JourneyDayData {
  id: string;
  weather: Weather;
  distance: [number, number];
  lost: [Direction, Direction];
  encounters: [EncounterRoll, EncounterRoll, EncounterRoll];
  encounterDetails?: EncounterDetailsData;
  hasPassed: boolean;
}

export interface SavedJourney {
  dayCount: number;
  seed: Seed;
  journey: JourneyDayData[];
}
