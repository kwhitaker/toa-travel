import { assoc, pipe } from "ramda";
import { v4 } from "uuid";

const genRandomInt = max => Math.floor(Math.random() * (max - 1 + 1)) + 1;
const rollDie = dieCount => () => genRandomInt(dieCount);
const coinToss = rollDie(2);
const d6 = rollDie(6);
const d20 = rollDie(20);
const d100 = rollDie(100);

const genWeather = () => {
  const roll = d20();
  return roll <= 16 ? "sun" : roll <= 19 ? "rain" : "storm";
};

const toDirection = {
  1: "N",
  2: "NE",
  3: "SE",
  4: "S",
  5: "SW",
  6: "NW"
};

const genWandering = () => [0, 1].map(() => toDirection[d6()]);
const genEncounter = () => (d20() >= 16 ? d100() : "none");

const getWeather = day => assoc("weather", genWeather(), day);
const getPace = day =>
  assoc("distance", [coinToss() === 1 ? 0 : 1, coinToss()], day);
const getLost = day => assoc("lost", genWandering(), day);
const getEncounters = day =>
  assoc("encounters", [0, 1, 2].map(genEncounter), day);

const setPast = day => assoc("hasPassed", false, day);

export const generateDay = pipe(
  () => ({ id: v4() }),
  getWeather,
  getPace,
  getLost,
  getEncounters,
  setPast
);
