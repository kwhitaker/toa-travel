import { MAX_DAYS } from "./journey";
import type {
  Direction,
  Encounter,
  EncounterDetail,
  EncounterDetailsData,
  EncounterRoll,
  JourneyDayData,
  SavedJourney,
  Weather,
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);
function parseWeather(value: unknown): Weather | null {
  switch (value) {
    // Preserve the old labels: "sun" meant occasional rain, "rain" heavy rain.
    case "sun":
    case "light-rain":
      return "light-rain";
    case "rain":
    case "heavy-rain":
      return "heavy-rain";
    case "sunny":
    case "storm":
      return value;
    default:
      return null;
  }
}
const isDirection = (value: unknown): value is Direction =>
  value === "N" ||
  value === "NE" ||
  value === "SE" ||
  value === "S" ||
  value === "SW" ||
  value === "NW";
const isEncounterRoll = (value: unknown): value is EncounterRoll =>
  value === "none" ||
  (isNumber(value) && Number.isInteger(value) && value >= 1 && value <= 100);

function isPair<T>(
  value: unknown,
  isItem: (item: unknown) => item is T,
): value is [T, T] {
  return Array.isArray(value) && value.length === 2 && value.every(isItem);
}

function isEncounter(value: unknown): value is Encounter {
  return (
    isRecord(value) &&
    typeof value.type === "string" &&
    ((isNumber(value.count) &&
      Number.isInteger(value.count) &&
      value.count > 0) ||
      typeof value.info === "string")
  );
}

function isEncounterDetail(value: unknown): value is EncounterDetail {
  return (
    isRecord(value) &&
    typeof value.terrain === "string" &&
    isEncounter(value.encounter)
  );
}

function isEncounterDetails(value: unknown): value is EncounterDetailsData {
  return (
    Array.isArray(value) &&
    value.every(
      (group: unknown) =>
        Array.isArray(group) && group.every(isEncounterDetail),
    )
  );
}

function isEncounterRolls(
  value: unknown,
): value is [EncounterRoll, EncounterRoll, EncounterRoll] {
  return (
    Array.isArray(value) && value.length === 3 && value.every(isEncounterRoll)
  );
}

function parseDay(value: unknown, index: number): JourneyDayData {
  const weather = isRecord(value) ? parseWeather(value.weather) : null;
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    !value.id ||
    !weather ||
    !isPair(value.distance, isNumber) ||
    !isPair(value.lost, isDirection) ||
    !isEncounterRolls(value.encounters) ||
    (value.hasPassed !== undefined && typeof value.hasPassed !== "boolean")
  ) {
    throw new Error(`Invalid journey data for day ${index + 1}.`);
  }

  const details = value.encounterDetails;
  if (details !== undefined && !isEncounterDetails(details)) {
    throw new Error(`Invalid encounter details for day ${index + 1}.`);
  }

  return {
    id: value.id,
    weather,
    distance: value.distance,
    lost: value.lost,
    encounters: value.encounters,
    ...(details !== undefined ? { encounterDetails: details } : {}),
    // Older saves can omit this field for days added after extending a journey.
    hasPassed: value.hasPassed ?? false,
  };
}

/** Validate the legacy Lockr envelope without trusting imported JSON types. */
export function parseSavedJourney(value: unknown): SavedJourney {
  if (!isRecord(value) || !isRecord(value.data)) {
    throw new Error("Expected saved journey data inside a data object.");
  }
  const { seed, dayCount, journey } = value.data;
  if (!(
    (typeof seed === "string" && seed.trim().length > 0) ||
    isNumber(seed)
  )) {
    throw new Error("No valid seed value provided.");
  }

  const count = typeof dayCount === "string" ? Number(dayCount) : dayCount;
  if (
    !isNumber(count) ||
    !Number.isInteger(count) ||
    count < 1 ||
    count > MAX_DAYS
  ) {
    throw new Error(`Day count must be between 1 and ${MAX_DAYS}.`);
  }
  if (!Array.isArray(journey) || journey.length !== count) {
    throw new Error("Journey length must match the day count.");
  }

  const days = journey.map((day: unknown, index: number) =>
    parseDay(day, index),
  );
  if (new Set(days.map((day) => day.id)).size !== days.length) {
    throw new Error("Journey days must have unique IDs.");
  }
  return { seed, dayCount: count, journey: days };
}

export function importJourney(json: string): SavedJourney {
  return parseSavedJourney(JSON.parse(json) as unknown);
}
