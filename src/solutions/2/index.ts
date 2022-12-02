import { Response } from "express";
import path from "path";
import { createReadStream, readFile } from "fs";
import readline from "readline";

const dataPath = path.join(__dirname, "input.txt");
const testDataPath = path.join(__dirname, "test-input.txt");

type HisChoice = "A" | "B" | "C";
type MyChoice = "X" | "Y" | "Z";

const POINTS_PER_CHOICE: Record<MyChoice, number> = {
  X: 1,
  Y: 2,
  Z: 3,
};

const POINTS_PER_OUTCOME = {
  loss: 0,
  draw: 3,
  win: 6,
};

// X, Y or Z is what I play (Rock, Paper Scissor)
const getPointsPart1 = (hisChoice: HisChoice, myChoice: MyChoice) => {
  let res = POINTS_PER_CHOICE[myChoice];
  switch (hisChoice) {
    case "A": {
      if (myChoice === "X") res += POINTS_PER_OUTCOME.draw;
      else if (myChoice === "Y") res += POINTS_PER_OUTCOME.win;
      else res += POINTS_PER_OUTCOME.loss;
      break;
    }
    case "B": {
      if (myChoice === "Y") res += POINTS_PER_OUTCOME.draw;
      else if (myChoice === "Z") res += POINTS_PER_OUTCOME.win;
      else res += POINTS_PER_OUTCOME.loss;
      break;
    }
    case "C": {
      if (myChoice === "Z") res += POINTS_PER_OUTCOME.draw;
      else if (myChoice === "X") res += POINTS_PER_OUTCOME.win;
      else res += POINTS_PER_OUTCOME.loss;
      break;
    }
  }
  return res;
};

// X, Y or Z is the desired outcome (loss, draw, win)
const getPointsPart2 = (hisChoice: HisChoice, myChoice: MyChoice) => {
  let res =
    myChoice === "X"
      ? POINTS_PER_OUTCOME.loss
      : myChoice === "Y"
      ? POINTS_PER_OUTCOME.draw
      : POINTS_PER_OUTCOME.win;

  switch (hisChoice) {
    case "A": {
      if (myChoice === "X") res += POINTS_PER_CHOICE["Z"];
      else if (myChoice === "Y") res += POINTS_PER_CHOICE["X"];
      else res += POINTS_PER_CHOICE["Y"];
      break;
    }
    case "B": {
      if (myChoice === "X") res += POINTS_PER_CHOICE["X"];
      else if (myChoice === "Y") res += POINTS_PER_CHOICE["Y"];
      else res += POINTS_PER_CHOICE["Z"];
      break;
    }
    case "C": {
      if (myChoice === "X") res += POINTS_PER_CHOICE["Y"];
      else if (myChoice === "Y") res += POINTS_PER_CHOICE["Z"];
      else res += POINTS_PER_CHOICE["X"];
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

    let totalPart1 = 0;
    let totalPart2 = 0;
    for (const round of dataArray) {
      const [hisChoice, myChoice] = round.split(" ");
      if (hisChoice && myChoice) {
        totalPart1 += getPointsPart1(
          hisChoice as HisChoice,
          myChoice as MyChoice
        );
        totalPart2 += getPointsPart2(
          hisChoice as HisChoice,
          myChoice as MyChoice
        );
      }
    }

    // Format solutions, render view
    firstPartSolution = totalPart1;
    secondPartSolution = totalPart2;
    res.render("solution", {
      dayNb: 2,
      errorMessage,
      firstPartSolution,
      secondPartSolution,
      useTestData,
    });
  });
};
