import seedrandom from "seedrandom";
import { v4 } from "uuid";
import encounterData from "./jungle-encounters.json";
import type {
  Direction,
  EncounterDetail,
  EncounterRoll,
  JourneyDayData,
  Seed,
} from "./types";

export const DEFAULT_DAYS = 79;
export const MAX_DAYS = 365;

interface EncounterParameters {
  maxCount?: number | boolean;
  minCount?: number;
  special?: boolean;
}

interface EncounterTables {
  byTerrain: {
    terrain: string;
    table: { minRoll: number; type: string }[];
  }[];
  counts: Record<string, EncounterParameters>;
}

const tables: EncounterTables = encounterData;
const directions: Direction[] = ["N", "NE", "SE", "S", "SW", "NW"];

export const allNone = (encounters: readonly EncounterRoll[]): boolean =>
  encounters.every((encounter) => encounter === "none");

export const createSeed = (): number => Math.floor(Math.random() * 1_000_000);

/** Keep the original dice order and number-vs-string seed semantics. */
export function generateJourney(
  dayCount: number,
  seed: Seed,
  previousJourney: readonly JourneyDayData[] = [],
): JourneyDayData[] {
  if (!Number.isInteger(dayCount) || dayCount < 1 || dayCount > MAX_DAYS) {
    throw new RangeError(`Day count must be between 1 and ${MAX_DAYS}.`);
  }

  // seedrandom flattens numeric seeds with a trailing NUL. Preserve that
  // representation without overriding Math.random or coercing saved seeds.
  const random = seedrandom(typeof seed === "number" ? `${seed}\0` : seed);
  const roll = (sides: number): number => Math.floor(random() * sides) + 1;
  const direction = (): Direction => {
    const result = directions[roll(6) - 1];
    if (!result) throw new Error("Invalid direction roll.");
    return result;
  };
  const encounterRoll = (): EncounterRoll =>
    roll(20) >= 16 ? roll(100) : "none";

  const detailsForRoll = (encounter: number): EncounterDetail[] =>
    tables.byTerrain.map(({ terrain, table }) => {
      const entry = [...table]
        .reverse()
        .find(({ minRoll }) => minRoll <= encounter);
      const parameters = entry && tables.counts[entry.type];
      if (!entry || !parameters) {
        throw new Error(`Missing encounter definition for ${terrain}.`);
      }

      if (parameters.special) {
        return {
          terrain,
          encounter: { type: entry.type, info: "see book for info" },
        };
      }

      // The legacy table includes maxCount: true, which historically meant 1.
      const count = Math.max(
        roll(Number(parameters.maxCount)),
        parameters.minCount ?? 1,
      );
      return { terrain, encounter: { type: entry.type, count } };
    });

  return Array.from({ length: dayCount }, (_, index) => {
    const id = v4();
    const weatherRoll = roll(20);
    const weather =
      weatherRoll <= 10
        ? "sunny"
        : weatherRoll <= 15
          ? "light-rain"
          : weatherRoll <= 18
            ? "heavy-rain"
            : "storm";
    const distance: [number, number] = [roll(2) === 1 ? 0 : 1, roll(2)];
    const lost: [Direction, Direction] = [direction(), direction()];
    const encounters: [EncounterRoll, EncounterRoll, EncounterRoll] = [
      encounterRoll(),
      encounterRoll(),
      encounterRoll(),
    ];
    const encounterDetails = encounters
      .filter((encounter): encounter is number => encounter !== "none")
      .map(detailsForRoll);

    return {
      id,
      weather,
      distance,
      lost,
      encounters,
      ...(encounterDetails.length > 0 ? { encounterDetails } : {}),
      hasPassed: previousJourney[index]?.hasPassed ?? false,
    };
  });
}
