import { Response } from "express";
import path from "path";
import { createReadStream, readFile } from "fs";
import readline from "readline";

const dataPath = path.join(__dirname, "input.txt");
const testDataPath = path.join(__dirname, "test-input.txt");

enum ITS_CHOICES {
  A,
  B,
  C,
}
enum MY_CHOICES {
  X,
  Y,
  Z,
}

const getItsChoice = (choice: string) => {
  if (choice === "A") return ITS_CHOICES.A;
  if (choice === "B") return ITS_CHOICES.B;
  return ITS_CHOICES.C;
};

const getMyChoice = (choice: string) => {
  if (choice === "X") return MY_CHOICES.X;
  if (choice === "Y") return MY_CHOICES.Y;
  return MY_CHOICES.Z;
};

const getPointsPerChoice = (choice: MY_CHOICES) => {
  switch (choice) {
    case MY_CHOICES.X:
      return 1;
    case MY_CHOICES.Y:
      return 2;
    case MY_CHOICES.Z:
      return 3;
  }
};

const POINTS_PER_OUTCOME = {
  win: 6,
  draw: 3,
  loss: 0,
};

// If newValue is greater than the min value of threeMaxValues, replace it.
const getPoints = (hisChoice: ITS_CHOICES, myChoice: MY_CHOICES) => {
  let res = getPointsPerChoice(myChoice);
  switch (hisChoice) {
    case ITS_CHOICES.A: {
      if (myChoice === MY_CHOICES.X) res += POINTS_PER_OUTCOME.draw;
      else if (myChoice === MY_CHOICES.Y) res += POINTS_PER_OUTCOME.win;
      else res += POINTS_PER_OUTCOME.loss;
      break;
    }
    case ITS_CHOICES.B: {
      if (myChoice === MY_CHOICES.Y) res += POINTS_PER_OUTCOME.draw;
      else if (myChoice === MY_CHOICES.Z) res += POINTS_PER_OUTCOME.win;
      else res += POINTS_PER_OUTCOME.loss;
      break;
    }
    case ITS_CHOICES.C: {
      if (myChoice === MY_CHOICES.Z) res += POINTS_PER_OUTCOME.draw;
      else if (myChoice === MY_CHOICES.X) res += POINTS_PER_OUTCOME.win;
      else res += POINTS_PER_OUTCOME.loss;
      break;
    }
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

    let currentTotal = 0;
    for (const round of dataArray) {
      const [hisChoice, myChoice] = round.split(" ");
      if (hisChoice && myChoice) {
        currentTotal += getPoints(
          getItsChoice(hisChoice),
          getMyChoice(myChoice)
        );
      }
    }

    // Handle latest iteration (there is no line break at the end of the file)

    // Format solutions, render view
    firstPartSolution = currentTotal;
    secondPartSolution = "...";
    res.render("solution", {
      dayNb: 2,
      errorMessage,
      firstPartSolution,
      secondPartSolution,
      useTestData,
    });
  });
};
