import { Response } from "express";
import getAvailableSolutions from "../../getAvailableSolutions";
import { parseFile } from "../utils";

let errorMessage: string;

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

function getThreeMaxValues(dataArray: string[]) {
  let threeMaxValues: number[] = [0, 0, 0];
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
  return threeMaxValues;
}

module.exports = async function solution(res: Response) {
  parseFile(__dirname, (testDataArray, dataArray) => {
    // Aggregate calories by elf, keep only the 3 max
    let threeMaxValues: number[] = getThreeMaxValues(dataArray);
    let test_threeMaxValues: number[] = getThreeMaxValues(testDataArray);

    // Format solutions, render view
    const getSol1 = (threeMaxValues: number[]) =>
      Math.max.apply(Math, threeMaxValues) + "";
    const getSol2 = (threeMaxValues: number[]) =>
      threeMaxValues.reduce((total, v) => total + v, 0);

    const sol1 = getSol1(threeMaxValues);
    const testSol1 = getSol1(test_threeMaxValues);
    const sol2 = getSol2(threeMaxValues);
    const testSol2 = getSol2(test_threeMaxValues);

    res.render("solution", {
      availableSolutions: getAvailableSolutions(),
      dayNb: 1,
      errorMessage,
      testSol1,
      testSol2,
      sol1,
      sol2,
    });
  });
};
