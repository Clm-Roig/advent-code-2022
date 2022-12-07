import { Response } from "express";
import { basename } from "path";
import getAvailableSolutions from "../../getAvailableSolutions";
import { parseFile } from "../utils";

let errorMessage: string;

const parseData = (dataArray: string[]) => {
  for (const line of dataArray) {
    for (const char of line) {
    }
  }
};

// Part 1 algo
function getSolution1(): string {
  return "sol1";
}

// Part 2 algo
function getSolution2(): string {
  return "sol2";
}

module.exports = async function solution(res: Response) {
  parseFile(__dirname, (testDataArray, dataArray) => {
    // Parse data
    const data = parseData(dataArray);
    const test_data = parseData(testDataArray);

    // Compute solutions
    // const sol1 = getSolution1(data);
    // const sol2 = getSolution2(data);
    const sol1 = "";
    const sol2 = "";
    const testSol1 = getSolution1();
    const testSol2 = getSolution2();

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
