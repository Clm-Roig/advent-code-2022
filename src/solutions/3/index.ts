import { Response } from "express";
import getAvailableSolutions from "../../getAvailableSolutions";
import { parseFile } from "../utils";

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
  let badges = [];
  let i = 0;
  let groupIdx = 0;
  const allSacks: string[][] = [];
  while (i < dataArray.length) {
    const threeSacks = dataArray.slice(i, i + 3);
    allSacks[groupIdx] = threeSacks;
    i += 3;
    groupIdx += 1;
  }
  for (const groupSacks of allSacks) {
    const [sack1, sack2, sack3] = groupSacks;
    let commonChars = Array.from(new Set(sack1.split(""))).toString(); // remove duplicated chars
    for (const char of commonChars) {
      if (!sack2.includes(char) || !sack3.includes(char)) {
        commonChars = commonChars.replace(char, "");
      }
    }
    if (commonChars.length !== 1) {
      errorMessage = "Part 2: more than 1 common char between sacks";
    } else {
      badges.push(commonChars[0]);
    }
  }
  return badges;
}

// Part 1 algo
function getItemAppearingInBothComparment(
  compartment1: string,
  compartment2: string
) {
  let appearsInBoth = null;
  let i = 0;
  while (appearsInBoth === null && i !== compartment1.length) {
    const item1 = compartment1[i];
    let j = 0;
    while (appearsInBoth === null && j !== compartment2.length) {
      const item2 = compartment2[j];
      if (item1 === item2) appearsInBoth = item1;
      j++;
    }
    i++;
  }
  return appearsInBoth;
}

module.exports = async function solution(res: Response, useTestData: boolean) {
  parseFile(useTestData, __dirname, (dataArray) => {
    let firstPartSolution, secondPartSolution;
    let itemsInBoth = [];

    // Part 1
    for (const rucksack of dataArray) {
      const middle = rucksack.length / 2;
      const compartment1 = rucksack.slice(0, middle);
      const compartment2 = rucksack.slice(middle, rucksack.length);
      let itemInBothCompartment = getItemAppearingInBothComparment(
        compartment1,
        compartment2
      );
      if (itemInBothCompartment) itemsInBoth.push(itemInBothCompartment);
    }

    // Part 2
    let badges = getBadges(dataArray);

    // Format solutions, render view
    firstPartSolution = itemsInBoth.reduce(
      (acc, char) => acc + getCharPriority(char),
      0
    );
    secondPartSolution = badges.reduce(
      (acc, char) => acc + getCharPriority(char),
      0
    );
    res.render("solution", {
      availableSolutions: getAvailableSolutions(),
      dayNb: 3,
      errorMessage,
      firstPartSolution,
      secondPartSolution,
      useTestData,
    });
  });
};
