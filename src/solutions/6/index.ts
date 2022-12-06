import { Response } from "express";
import { basename, resolve } from "path";
import getAvailableSolutions from "../../getAvailableSolutions";
import { parseFile } from "../utils";

let errorMessage: string;

function getStartCharPosition(text: string, nbOfDistinctChars: number): number {
  let currentChars = "";
  let found = false;
  let i = 0;
  while (!found && i < text.length) {
    currentChars += text[i];
    currentChars = currentChars.slice(-nbOfDistinctChars);
    found =
      currentChars.length === nbOfDistinctChars &&
      new Set(currentChars).size === currentChars.length;
    if (!found) i++;
  }
  return i + 1;
}

// Part 1 algo
const getSolution1 = (text: string): number => getStartCharPosition(text, 4);

// Part 2 algo
const getSolution2 = (text: string): number => getStartCharPosition(text, 14);

module.exports = async function solution(res: Response) {
  parseFile(__dirname, (testDataArray, dataArray) => {
    // Compute solutions
    const sol1 = getSolution1(dataArray[0]);
    const sol2 = getSolution2(dataArray[0]);
    const testSol1 = getSolution1(testDataArray[0]);
    const testSol2 = getSolution2(testDataArray[0]);

    // Render view
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
