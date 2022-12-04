import { Response } from "express";
import getAvailableSolutions from "../../getAvailableSolutions";
import { parseFile } from "../utils";

let errorMessage: string;

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

function getSolution1(dataArray: string[]) {
  return dataArray.reduce((total, round) => {
    const [hisChoice, myChoice] = round.split(" ");
    return hisChoice && myChoice
      ? total + getPointsPart1(hisChoice as HisChoice, myChoice as MyChoice)
      : total;
  }, 0);
}

function getSolution2(dataArray: string[]) {
  return dataArray.reduce((total, round) => {
    const [hisChoice, myChoice] = round.split(" ");
    return hisChoice && myChoice
      ? total + getPointsPart2(hisChoice as HisChoice, myChoice as MyChoice)
      : total;
  }, 0);
}

module.exports = async function solution(res: Response) {
  parseFile(__dirname, (testDataArray, dataArray) => {
    // Compute solutions
    const sol1 = getSolution1(dataArray);
    const sol2 = getSolution2(dataArray);
    const testSol1 = getSolution1(testDataArray);
    const testSol2 = getSolution2(testDataArray);

    // Format solutions, render view
    res.render("solution", {
      availableSolutions: getAvailableSolutions(),
      dayNb: 2,
      errorMessage,
      sol1,
      sol2,
      testSol1,
      testSol2,
    });
  });
};
