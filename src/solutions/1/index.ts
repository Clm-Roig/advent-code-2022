import { Response } from "express";
import path from "path";
import { createReadStream, readFile } from "fs";
import readline from "readline";
import getAvailableSolutions from "../../getAvailableSolutions";

const dataPath = path.join(__dirname, "input.txt");
const testDataPath = path.join(__dirname, "test-input.txt");

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
  // Read file and store it in an array
  const filePath = useTestData ? testDataPath : dataPath;
  const file = readline.createInterface({
    input: createReadStream(filePath),
    output: process.stdout,
    terminal: false,
  });
  let dataArray: string[] = [];
  file.on("line", (line) => {
    dataArray.push(line);
  });

  // Process data
  file.on("close", function () {
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
