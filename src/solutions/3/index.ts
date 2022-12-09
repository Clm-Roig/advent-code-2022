import { Response } from "express";
import { basename } from "path";
import getAvailableSolutions from "../../getAvailableSolutions";
import { parseFiles } from "../utils";

let errorMessage: string;

const getCharPriority = (char: String): number => {
  let res = 0;
  const code = char.charCodeAt(0);
  // See ASCII table: https://asecuritysite.com/coding/asc2
  const lowLimitLowerChars = 97;
  const highLimitLowerChars = 122;
  if (code >= lowLimitLowerChars && code <= highLimitLowerChars) {
    res = code - lowLimitLowerChars + 1;
  }

  const lowLimitUpperChars = 65;
  const highLimitUpperChars = 90;
  if (code >= lowLimitUpperChars && code <= highLimitUpperChars) {
    res = code - lowLimitUpperChars + 1 + 26;
  }

  return res;
};

// Part 2 algo
function getBadges(dataArray: string[]) {
  const badges = [];
  let i = 0;
  let groupIdx = 0;

  // Construct all group sacks
  const allSacks: string[][] = [];
  while (i < dataArray.length) {
    const threeSacks = dataArray.slice(i, i + 3);
    allSacks[groupIdx] = threeSacks;
    i += 3;
    groupIdx += 1;
  }

  // For each group 3 sacks, find the badge
  for (const groupSacks of allSacks) {
    const [sack1, sack2, sack3] = groupSacks;

    // Remove duplicated chars (using Set) & iterate to eliminate items not in the 3 sacks
    let commonChars = Array.from(new Set(sack1.split(""))).filter(
      (char) => sack2.includes(char) && sack3.includes(char)
    );

    if (commonChars.length !== 1) {
      errorMessage = "Part 2: more than 1 common char between sacks";
    } else {
      badges.push(commonChars[0]);
    }
  }
  return badges;
}

// Part 1 algo
function getAllItemsInBothCompartment(dataArray: string[]) {
  let itemsInBoth = [];
  for (const rucksack of dataArray) {
    const middle = rucksack.length / 2;
    const compartment1 = rucksack.slice(0, middle).split("");
    const compartment2 = rucksack.slice(middle, rucksack.length).split("");
    let itemInBothCompartment = compartment1.find((char1) => {
      return compartment2.includes(char1);
    });
    if (itemInBothCompartment) itemsInBoth.push(itemInBothCompartment);
  }
  return itemsInBoth;
}

module.exports = async function solution(res: Response) {
  parseFiles(__dirname, (testDataArray, dataArray) => {
    // Part 1
    const itemsInBoth = getAllItemsInBothCompartment(dataArray);
    const test_itemsInBoth = getAllItemsInBothCompartment(testDataArray);

    // Part 2
    const badges = getBadges(dataArray);
    const test_badges = getBadges(testDataArray);

    // Format solutions, render view
    const getTotal = (items: string[]) =>
      items.reduce((acc, char) => acc + getCharPriority(char), 0);

    const sol1 = getTotal(itemsInBoth);
    const sol2 = getTotal(badges);
    const testSol1 = getTotal(test_itemsInBoth);
    const testSol2 = getTotal(test_badges);

    res.render("solution", {
      availableSolutions: getAvailableSolutions(),
      dayNb: basename(__dirname),
      errorMessage,
      testSol1,
      testSol2,
      sol1,
      sol2,
    });
  });
};
