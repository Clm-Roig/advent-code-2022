import { Response } from "express";
import { basename } from "path";
import getAvailableSolutions from "../../getAvailableSolutions";
import { parseFiles } from "../utils";

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
  parseFiles(__dirname, (testDataArray, dataArray) => {
    // Parse data
    const data = parseData(dataArray);
    const test_data = parseData(testDataArray);

    // Compute solutions
    let testSol1, testSol2, sol1, sol2;
    // sol1 = getSolution1(data);
    // sol2 = getSolution2(data);
    testSol1 = getSolution1();
    testSol2 = getSolution2();

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
