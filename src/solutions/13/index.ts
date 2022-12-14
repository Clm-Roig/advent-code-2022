import { Response } from "express";
import { basename } from "path";
import getAvailableSolutions from "../../getAvailableSolutions";
import { parseFiles } from "../utils";

let errorMessage: string;

const parseData = (dataArray: string[]) => {
  let pairs: any[] = [];
  let i = 0,
    p = 0;
  for (const line of dataArray) {
    if (line !== "") {
      if (p === 0) {
        pairs[i] = [];
      }
      const value = eval(line);
      pairs[i].push(value);
      p += 1;
    } else {
      p = 0;
      i += 1;
    }
  }
  return pairs;
};

function compare(left: any[], right: any[]): boolean | undefined {
  const { isInteger } = Number;
  let res: boolean | undefined = false;

  if (isInteger(left) && isInteger(right)) {
    // Two integers
    res = left === right ? undefined : left < right;
  } else if (left instanceof Array && right instanceof Array) {
    // Two arrays
    const isRightShorter = right.length < left.length;
    let tmpRes: boolean | undefined;
    let i = 0;
    while (i < Math.min(left.length, right.length)) {
      tmpRes = compare(left[i], right[i]);
      if (tmpRes !== undefined) {
        break;
      }
      i += 1;
    }
    if (tmpRes === undefined) {
      if (right.length === left.length) {
        tmpRes = undefined;
      } else {
        tmpRes = !isRightShorter;
      }
    }
    res = tmpRes;
  } else {
    // One is integer, other one is Array
    res = isInteger(left) ? compare([left], right) : compare(left, [right]);
  }
  return res;
}

// Part 1 algo
function getSolution1(pairs: any[]): number {
  let comparedPairs = [];
  for (let i = 0; i < pairs.length; i++) {
    const [left, right] = pairs[i];
    comparedPairs.push({
      i: i + 1,
      result: compare(left, right),
    });
  }
  return comparedPairs.reduce(
    (total, cp) => (cp.result ? total + cp.i : total),
    0
  );
}

// Part 2 algo
function getSolution2(pairs: any[]): number {
  let allPairs = [...pairs.flat(), [[2]], [[6]]];
  const sortedPairs = allPairs.sort((p1, p2) => (compare(p1, p2) ? -1 : 1));
  const packet2Idx = sortedPairs.findIndex(
    (p) => p[0] && p[0].length === 1 && p[0].includes(2)
  );
  const packet6Idx = sortedPairs.findIndex(
    (p) => p[0] && p[0].length === 1 && p[0].includes(6)
  );
  return (packet2Idx + 1) * (packet6Idx + 1);
}

module.exports = async function solution(res: Response) {
  parseFiles(__dirname, (testDataArray, dataArray) => {
    // Parse data
    const data = parseData(dataArray);
    const test_data = parseData(testDataArray);

    // Compute solutions
    const sol1 = getSolution1(data);
    const sol2 = getSolution2(data);
    const testSol1 = getSolution1(test_data);
    const testSol2 = getSolution2(test_data);

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
