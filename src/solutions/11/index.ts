import { Response } from "express";
import { basename } from "path";
import getAvailableSolutions from "../../getAvailableSolutions";
import { parseFiles } from "../utils";

let errorMessage: string;

function parseOperation(
  var1: string,
  operator: string,
  var2: string
): (x: number) => number {
  const var1Int = parseInt(var1);
  const var2Int = parseInt(var2);
  const var1IsOld = Number.isNaN(var1Int);
  const var2IsOld = Number.isNaN(var2Int);

  if (var1IsOld && var2IsOld) {
    if (operator === "+") return (x: number) => x + x;
    if (operator === "-") return (x: number) => x - x;
    if (operator === "*") return (x: number) => x * x;
    if (operator === "/") return (x: number) => x / x;
  }
  if (var1IsOld && !var2IsOld) {
    if (operator === "+") return (x: number) => x + var2Int;
    if (operator === "-") return (x: number) => x - var2Int;
    if (operator === "*") return (x: number) => x * var2Int;
    if (operator === "/") return (x: number) => x / var2Int;
  }
  if (!var1IsOld && var2IsOld) {
    if (operator === "+") return (x: number) => var1Int + x;
    if (operator === "-") return (x: number) => var1Int - x;
    if (operator === "*") return (x: number) => var1Int * x;
    if (operator === "/") return (x: number) => var1Int / x;
  } else {
    if (operator === "+") return (x: number) => var1Int + var2Int;
    if (operator === "-") return (x: number) => var1Int - var2Int;
    if (operator === "*") return (x: number) => var1Int * var2Int;
    if (operator === "/") return (x: number) => var1Int / var2Int;
  }

  errorMessage = "getOperation(): can't parse operation";
  return (x: number) => -1;
}

class Monkey {
  id: number;
  items: number[] = [];
  nbOfInspection: number = 0;
  operation: (x: number) => number;
  testDivisor: number;
  testTrue: number; // Monkey id
  testFalse: number; // Monkey id

  // Inspect first item, remove it from the Monkey list and change its value
  // Return the newMonkeyId and the item with its value updated
  inspectAndThrowSolution1():
    | { newMonkeyId: number; newItem: number }
    | undefined {
    const { items, operation, testDivisor, testFalse, testTrue } = this;
    const item = items.shift();
    if (item) {
      const newItem = Math.floor(operation(item) / 3);
      const newMonkeyId = newItem % testDivisor === 0 ? testTrue : testFalse;
      this.nbOfInspection += 1;
      return { newMonkeyId, newItem };
    }
    return undefined;
  }

  inspectAndThrowSolution2(
    biggestMod: number
  ): { newMonkeyId: number; newItem: number } | undefined {
    const { items, operation, testDivisor, testFalse, testTrue } = this;
    const item = items.shift();
    if (item) {
      const newItem = operation(item);
      const newMonkeyId = newItem % testDivisor === 0 ? testTrue : testFalse;
      this.nbOfInspection += 1;
      return { newMonkeyId, newItem: newItem % biggestMod };
    }
    return undefined;
  }
}

const parseData = (dataArray: string[]): Monkey[] => {
  let monkeys: Monkey[] = [];
  let currentMonkey = new Monkey();
  for (const line of dataArray) {
    const [part1, part2] = line.split(":");

    if (part1.startsWith("Monkey")) {
      currentMonkey.id = Number(part1.split(" ")[1]);
    }

    if (part1.includes("Starting items")) {
      currentMonkey.items = part2.split(", ").map((x) => Number(x));
    }

    if (part1.includes("Operation")) {
      // ignore first 3 str: ' ', 'new', '='
      const [, , , var1, operator, var2] = part2.split(" ");
      currentMonkey.operation = parseOperation(var1, operator, var2);
    }

    if (part1.includes("Test")) {
      const splitted = part2.split(" ");
      currentMonkey.testDivisor = Number(splitted[splitted.length - 1]);
    }

    if (part1.includes("If true")) {
      const splitted = part2.split(" ");
      currentMonkey.testTrue = Number(splitted[splitted.length - 1]);
    }

    if (part1.includes("If false")) {
      const splitted = part2.split(" ");
      currentMonkey.testFalse = Number(splitted[splitted.length - 1]);
    }

    // End of monkey
    if (part1 === "") {
      monkeys.push(currentMonkey);
      currentMonkey = new Monkey();
    }
  }
  monkeys.push(currentMonkey);

  return monkeys;
};

// Part 1 algo
function getSolution1(monkeys: Monkey[]): number {
  const NB_OF_ROUNDS = 20;
  for (let i = 0; i < NB_OF_ROUNDS; i++) {
    for (const monkey of monkeys) {
      while (monkey.items.length > 0) {
        const result = monkey.inspectAndThrowSolution1();
        if (result) {
          const { newItem, newMonkeyId } = result;
          const newMonkey = monkeys.find((m) => m.id === newMonkeyId);
          if (newMonkey) {
            newMonkey.items.push(newItem);
          } else {
            errorMessage =
              "Error in getSolution1(): can't find new monkey to throw new item at.";
          }
        }
      }
    }
  }
  const sortedMonkeys = monkeys.sort(
    (m1, m2) => m2.nbOfInspection - m1.nbOfInspection
  );
  return sortedMonkeys[0].nbOfInspection * sortedMonkeys[1].nbOfInspection;
}

// Part 2 algo
function getSolution2(monkeys: Monkey[]): number {
  // Every time a new item is calculated, reduce it by using the biggest mod, common to all monkeys
  const mods = monkeys.map((m) => m.testDivisor);
  const biggestMod = mods.reduce((acc, mod) => acc * mod, 1);

  const NB_OF_ROUNDS = 10000;
  for (let i = 0; i < NB_OF_ROUNDS; i++) {
    for (const monkey of monkeys) {
      while (monkey.items.length > 0) {
        const result = monkey.inspectAndThrowSolution2(biggestMod);
        if (result) {
          const { newItem, newMonkeyId } = result;
          const newMonkey = monkeys.find((m) => m.id === newMonkeyId);
          if (newMonkey) {
            newMonkey.items.push(newItem);
          } else {
            errorMessage =
              "Error in getSolution2(): can't find new monkey to throw new item at.";
          }
        }
      }
    }
  }
  const sortedMonkeys = monkeys.sort(
    (m1, m2) => m2.nbOfInspection - m1.nbOfInspection
  );
  return sortedMonkeys[0].nbOfInspection * sortedMonkeys[1].nbOfInspection;
}

module.exports = async function solution(res: Response) {
  parseFiles(__dirname, (testDataArray, dataArray) => {
    // Compute solutions
    // Parse data for every run to avoid reusing mutated monkeys
    const sol1 = getSolution1(parseData(dataArray));
    const sol2 = getSolution2(parseData(dataArray));
    const testSol1 = getSolution1(parseData(testDataArray));
    const testSol2 = getSolution2(parseData(testDataArray));

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
