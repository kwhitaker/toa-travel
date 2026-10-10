import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { allNone, generateJourney, MAX_DAYS } from "./journey";
import fixtures from "./test/fixtures/legacy-journeys.json";
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
    "preserves the original rolls for seed $seed",
    ({ seed, dayCount, sha256 }) => {
      const journey = withoutIds(generateJourney(dayCount, seed));
      expect(
        createHash("sha256").update(JSON.stringify(journey)).digest("hex"),
      ).toBe(sha256);
    },
  );

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
