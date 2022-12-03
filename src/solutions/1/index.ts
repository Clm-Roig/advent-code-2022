import { Response } from "express";
import getAvailableSolutions from "../../getAvailableSolutions";
import { parseFile } from "../utils";

// If newValue is greater than the min value of threeMaxValues, replace it.
const checkAndReplace = (threeMaxValues: number[], newValue: number) => {
  let res = threeMaxValues;
  const minValue = Math.min.apply(Math, threeMaxValues);
  const minIdx = threeMaxValues.findIndex((v) => v === minValue);
  if (minValue < newValue) {
    res = [...threeMaxValues.filter((v, idx) => idx !== minIdx), newValue];
  }
  return res;
};

module.exports = async function solution(res: Response, useTestData: boolean) {
  parseFile(useTestData, __dirname, (dataArray) => {
    let errorMessage, firstPartSolution, secondPartSolution;
    let threeMaxValues: number[] = [0, 0, 0];

    // Aggregate calories by elf, keep only the 3 max
    let currentTotal = 0;
    for (const quantity of dataArray) {
      if (quantity === "") {
        threeMaxValues = checkAndReplace(threeMaxValues, currentTotal);
        currentTotal = 0;
      } else {
        currentTotal += Number(quantity);
      }
    }

    // Handle latest iteration (there is no line break at the end of the file)
    if (currentTotal !== 0) {
      threeMaxValues = checkAndReplace(threeMaxValues, currentTotal);
    }

    // Format solutions, render view
    firstPartSolution = Math.max.apply(Math, threeMaxValues) + "";
    secondPartSolution = threeMaxValues.reduce((total, v) => total + v, 0);
    res.render("solution", {
      availableSolutions: getAvailableSolutions(),
      dayNb: 1,
      errorMessage,
      firstPartSolution,
      secondPartSolution,
      useTestData,
    });
  });
};
