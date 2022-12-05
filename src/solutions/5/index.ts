import { Response } from "express";
import { basename } from "path";
import getAvailableSolutions from "../../getAvailableSolutions";
import { parseFile } from "../utils";

let errorMessage: string;

type Move = {
  from: number;
  qty: number;
  to: number;
};

const parseData = (dataArray: string[]) => {
  const stacks: string[][] = [];
  const moves = [];
  let i = 0;

  // Build stacks
  while (dataArray[i] !== "") {
    const line = dataArray[i];
    for (let charIdx = 0; charIdx < line.length; charIdx++) {
      const char = line[charIdx];
      if (char.match(/[a-z]/i)) {
        // Compute which stack it's from
        // Stack 1 -> char 2
        // Stack 2 -> char 6
        // Stack 3 -> char 10
        // Stack 4 -> char 14
        // So :
        const stackIdx = (charIdx - 1) / 4 + 1;
        if (!stacks[stackIdx]) {
          stacks[stackIdx] = []; // create new sub-array before populating it to avoid an error
        }
        // Using unshift() instead of push() because we are building the stacks from the top
        stacks[stackIdx].unshift(char);
      }
    }
    i += 1;
  }

  // Skip blank line
  i += 1;

  // Build moves
  while (i < dataArray.length) {
    const line = dataArray[i];
    const numbers = line.match(/\d+/g);
    const [qty, from, to] = numbers!.map((x: string) => Number(x));
    moves.push({
      qty,
      from,
      to,
    } as Move);
    i += 1;
  }

  return { stacks, moves };
};

function getCratesOnTop(stacksCopy: string[][]): string {
  return stacksCopy
    .filter((stack) => stack !== undefined) // exclude stack n°0 which is undefined
    .reduce((acc, stack) => acc + stack.pop(), "");
}

// Part 1 algo
function getSolution1(stacks: string[][], moves: Move[]): string {
  const stacksCopy = stacks.map((s) => s.slice());
  for (const move of moves) {
    const { qty, from, to } = move;
    for (let i = 0; i < qty; i++) {
      const movedStack = stacksCopy[from].pop() as string; // force to string to avoid undefined (can't happen)
      stacksCopy[to].push(movedStack);
    }
  }
  return getCratesOnTop(stacksCopy);
}

// Part 2 algo
function getSolution2(stacks: string[][], moves: Move[]): string {
  const stacksCopy = stacks.map((s) => s.slice());
  for (const move of moves) {
    const { qty, from, to } = move;
    const movedStacks = stacksCopy[from].splice(-qty); // get latest qty crate
    stacksCopy[to].push(...movedStacks);
  }
  return getCratesOnTop(stacksCopy);
}

module.exports = async function solution(res: Response) {
  parseFile(__dirname, (testDataArray, dataArray) => {
    // Parse data
    const { stacks, moves } = parseData(dataArray);
    const { stacks: test_stacks, moves: test_moves } = parseData(testDataArray);

    // Compute solutions
    const sol1 = getSolution1(stacks, moves);
    const sol2 = getSolution2(stacks, moves);
    const testSol1 = getSolution1(test_stacks, test_moves);
    const testSol2 = getSolution2(test_stacks, test_moves);

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
