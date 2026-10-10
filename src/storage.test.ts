import { describe, expect, it } from "vitest";
import { generateJourney } from "./journey";
import { importJourney } from "./saved-journey";
import { JOURNEY_STORAGE_KEY, loadJourney, saveJourney } from "./storage";
import type { SavedJourney, Weather } from "./types";

const makeJourney = (): SavedJourney => ({
  dayCount: 2,
  seed: 123456,
  journey: generateJourney(2, 123456),
});

describe("saved journeys", () => {
  it("round-trips the original Lockr key and envelope, including progress", () => {
    const saved = makeJourney();
    const first = saved.journey[0];
    if (!first) throw new Error("Missing fixture day.");
    first.hasPassed = true;
    localStorage.setItem("unrelated", "keep me");
    saveJourney(saved);
    expect(JOURNEY_STORAGE_KEY).toBe("toajourney");
    expect(localStorage.getItem(JOURNEY_STORAGE_KEY)).toBe(
      JSON.stringify({ data: saved }),
    );
    expect(loadJourney()).toEqual(saved);
    expect(localStorage.getItem("unrelated")).toBe("keep me");
  });

  it("returns null when there is no save", () => {
    expect(loadJourney()).toBeNull();
  });

  it.each<Weather>(["sunny", "light-rain", "heavy-rain", "storm"])(
    "preserves %s weather and progress through saving and reloading",
    (weather) => {
      const saved = makeJourney();
      saved.journey = saved.journey.map((day) => ({
        ...day,
        weather,
        hasPassed: true,
      }));
      saveJourney(saved);
      expect(loadJourney()).toEqual(saved);
    },
  );

  it.each([
    ["sun", "light-rain"],
    ["rain", "heavy-rain"],
    ["storm", "storm"],
  ])("migrates legacy %s weather to %s without rerolling", (old, weather) => {
    const saved = makeJourney();
    const legacy = {
      ...saved,
      journey: saved.journey.map((day) => ({
        ...day,
        weather: old,
        hasPassed: true,
      })),
    };
    const json = JSON.stringify({ data: legacy });
    localStorage.setItem(JOURNEY_STORAGE_KEY, json);
    const expected = {
      ...legacy,
      journey: legacy.journey.map((day) => ({ ...day, weather })),
    };
    expect(importJourney(json)).toEqual(expected);
    const restored = loadJourney();
    expect(restored).toEqual(expected);
    if (!restored) throw new Error("Missing restored journey.");
    saveJourney(restored);
    expect(loadJourney()).toEqual(expected);
  });

  it("accepts previous-version day counts and missing completion flags", () => {
    const saved = makeJourney();
    const oldDays = saved.journey.map(({ hasPassed, ...day }) => {
      expect(hasPassed).toBe(false);
      return day;
    });
    const result = importJourney(
      JSON.stringify({ data: { ...saved, dayCount: "2", journey: oldDays } }),
    );
    expect(result.dayCount).toBe(2);
    expect(result.seed).toBe(123456);
    expect(result.journey.every((day) => day.hasPassed === false)).toBe(true);
  });

  it.each([0, "chult"])("supports valid seed %s on import", (seed) => {
    expect(
      importJourney(JSON.stringify({ data: { ...makeJourney(), seed } })).seed,
    ).toBe(seed);
  });

  it.each([
    ["seed", ""],
    ["seed", null],
    ["dayCount", 366],
    ["dayCount", 1.5],
    ["journey", []],
    ["journey", [{ id: "missing fields" }]],
  ])("rejects invalid saved %s", (field, value) => {
    expect(() =>
      importJourney(
        JSON.stringify({ data: { ...makeJourney(), [String(field)]: value } }),
      ),
    ).toThrow();
  });

  it.each([
    ["weather", "snow"],
    ["distance", [1]],
    ["lost", ["N", "Q"]],
    ["encounters", [101, "none", "none"]],
    ["hasPassed", "yes"],
    [
      "encounterDetails",
      [[{ terrain: "beach", encounter: { type: "cat", count: -1 } }]],
    ],
  ])("rejects invalid day field %s", (field, value) => {
    const saved = makeJourney();
    const journey = saved.journey.map((day) => ({
      ...day,
      [String(field)]: value,
    }));
    expect(() =>
      importJourney(JSON.stringify({ data: { ...saved, journey } })),
    ).toThrow();
  });

  it("rejects duplicate day IDs and malformed JSON", () => {
    const saved = makeJourney();
    expect(() =>
      importJourney(
        JSON.stringify({
          data: { ...saved, journey: [saved.journey[0], saved.journey[0]] },
        }),
      ),
    ).toThrow(/unique IDs/);
    expect(() => importJourney("not JSON")).toThrow();
    expect(() => importJourney("{}")).toThrow(/data object/);
  });
});
