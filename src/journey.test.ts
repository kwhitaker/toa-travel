import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { allNone, generateJourney, MAX_DAYS } from "./journey";
import fixtures from "./test/fixtures/legacy-journeys.json";
import legacyWeather from "./test/fixtures/legacy-weather.json";
import type { JourneyDayData } from "./types";

function withoutIds(days: JourneyDayData[]) {
  return days.map(({ id, ...day }) => {
    expect(id).toMatch(
      /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i,
    );
    return day;
  });
}

describe("journey generation", () => {
  it.each(fixtures)(
    "preserves the original non-weather rolls for seed $seed",
    ({ seed, dayCount, sha256 }) => {
      const originalWeather = legacyWeather.find(
        (entry) => entry.seed === seed,
      );
      expect(originalWeather?.weather).toHaveLength(dayCount);
      // Restore the captured old weather labels solely for comparison with the
      // unchanged original hashes. All other seeded results must still match.
      const journey = withoutIds(generateJourney(dayCount, seed)).map(
        (day, index) => ({
          ...day,
          weather:
            originalWeather?.weather[index] === "s"
              ? "sun"
              : originalWeather?.weather[index] === "r"
                ? "rain"
                : "storm",
        }),
      );
      expect(
        createHash("sha256").update(JSON.stringify(journey)).digest("hex"),
      ).toBe(sha256);
    },
  );

  it.each([
    { roll: 1, seed: "weather-5", weather: "sunny" },
    { roll: 2, seed: "weather-42", weather: "sunny" },
    { roll: 3, seed: "weather-4", weather: "sunny" },
    { roll: 4, seed: "weather-10", weather: "sunny" },
    { roll: 5, seed: "weather-9", weather: "sunny" },
    { roll: 6, seed: "weather-20", weather: "sunny" },
    { roll: 7, seed: "weather-3", weather: "sunny" },
    { roll: 8, seed: "weather-54", weather: "sunny" },
    { roll: 9, seed: "weather-0", weather: "sunny" },
    { roll: 10, seed: "weather-2", weather: "sunny" },
    { roll: 11, seed: "weather-35", weather: "light-rain" },
    { roll: 12, seed: "weather-36", weather: "light-rain" },
    { roll: 13, seed: "weather-80", weather: "light-rain" },
    { roll: 14, seed: "weather-13", weather: "light-rain" },
    { roll: 15, seed: "weather-11", weather: "light-rain" },
    { roll: 16, seed: "weather-51", weather: "heavy-rain" },
    { roll: 17, seed: "weather-16", weather: "heavy-rain" },
    { roll: 18, seed: "weather-19", weather: "heavy-rain" },
    { roll: 19, seed: "weather-1", weather: "storm" },
    { roll: 20, seed: "weather-28", weather: "storm" },
  ])("maps d20 roll $roll to $weather", ({ seed, weather }) => {
    expect(generateJourney(1, seed)[0]?.weather).toBe(weather);
  });

  it("repeats rolls without reusing IDs or changing global randomness", () => {
    const originalRandom = Math.random;
    const first = generateJourney(10, "chult");
    const second = generateJourney(10, "chult");
    expect(withoutIds(first)).toEqual(withoutIds(second));
    expect(first[0]?.id).not.toBe(second[0]?.id);
    expect(Math.random).toBe(originalRandom);
  });

  it("preserves completed days by position when regenerating or extending", () => {
    const previous = generateJourney(2, 1).map((day, index) => ({
      ...day,
      hasPassed: index === 0,
    }));
    const next = generateJourney(4, "another seed", previous);
    expect(next.map((day) => day.hasPassed)).toEqual([
      true,
      false,
      false,
      false,
    ]);
    expect(previous.map((day) => day.hasPassed)).toEqual([true, false]);
  });

  it.each([0, -1, 1.5, MAX_DAYS + 1, NaN])(
    "rejects an invalid day count: %s",
    (count) => {
      expect(() => generateJourney(count, "test")).toThrow(RangeError);
    },
  );

  it("supports the maximum journey length with unique IDs", () => {
    const journey = generateJourney(MAX_DAYS, "test");
    expect(journey).toHaveLength(MAX_DAYS);
    expect(new Set(journey.map((day) => day.id)).size).toBe(MAX_DAYS);
  });

  it("recognizes days without encounters", () => {
    expect(allNone(["none", "none", "none"])).toBe(true);
    expect(allNone(["none", 1, "none"])).toBe(false);
  });
});
