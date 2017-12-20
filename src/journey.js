import { all, assoc, equals, findLast, pipe, reject } from "ramda";
import { v4 } from "uuid";

const genRandomInt = max => Math.floor(Math.random() * (max - 1 + 1)) + 1;
const rollDie = dieCount => () => genRandomInt(dieCount);
const coinToss = rollDie(2);
const d4 = rollDie(4);
const d6 = rollDie(6);
const d8 = rollDie(8);
const d10 = rollDie(10);
const d20 = rollDie(20);
const d100 = rollDie(100);

export const isNone = equals("none");
export const allNone = all(isNone);

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

const genEncounterCount = ({ maxCount, minCount }) => {
  const roll = genRandomInt(maxCount);
  return minCount && roll < minCount ? roll + (minCount - roll) : roll;
};

const rollEncounter = countObj => roll => ({ terrain, table }) => {
  const { type } = findLast(({ minRoll }) => minRoll <= roll, table);
  const params = countObj[type];
  const encounter = params.special
    ? { type, info: "see book for info" }
    : { type, count: genEncounterCount(params) };

  return {
    terrain,
    encounter
  };
};

const setEncounterDetails = day => {
  const { encounters } = day;

  if (allNone(encounters)) {
    return day;
  }

  const validEncounters = reject(isNone, encounters);
  const { byTerrain, counts } = require("./jungle-encounters.json");
  const encounterCounts = rollEncounter(counts);
  const details = validEncounters.reduce((detailsArr, roll) => {
    return detailsArr.concat([byTerrain.map(encounterCounts(roll))]);
  }, []);
  return assoc("encounterDetails", details, day);
};

const setPast = day => assoc("hasPassed", false, day);

export const generateDay = pipe(
  () => ({ id: v4() }),
  getWeather,
  getPace,
  getLost,
  getEncounters,
  setEncounterDetails,
  setPast
);
