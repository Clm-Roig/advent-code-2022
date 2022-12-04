import { Response } from "express";
import { basename } from "path";
import getAvailableSolutions from "../../getAvailableSolutions";
import { getMax, getMin, parseFile } from "../utils";

let errorMessage: string;

const parseData = (dataArray: string[]) =>
  dataArray.map((line) =>
    // From [2-4,3-6] to [[2,4],[3,6]]
    line.split(",").map((assignment) => {
      // From [2,4] to [2,3,4]
      const [sectionMin, sectionMax] = assignment.split("-");
      return Array.from(
        { length: Number(sectionMax) - Number(sectionMin) + 1 },
        (_, i) => i + Number(sectionMin)
      );
    })
  );

// Part 1 algo
function getSolution1(splittedAssignments: number[][][]) {
  const doAssignmentsTotallyOverlap = (
    assignment1: number[],
    assignment2: number[]
  ) => {
    return (
      // 1 bigger than 2
      (getMin(assignment1) <= getMin(assignment2) &&
        getMax(assignment1) >= getMax(assignment2)) ||
      // 2 bigger than 1
      (getMin(assignment1) >= getMin(assignment2) &&
        getMax(assignment1) <= getMax(assignment2))
    );
  };
  return splittedAssignments.reduce((acc, pair) => {
    const [assignment1, assignment2] = pair;
    return doAssignmentsTotallyOverlap(assignment1, assignment2)
      ? acc + 1
      : acc;
  }, 0);
}

// Part 2 algo
function getSolution2(splittedAssignments: number[][][]) {
  const doAssignmentsOverlap = (assignment1: number[], assignment2: number[]) =>
    assignment2.includes(getMin(assignment1)) ||
    assignment2.includes(getMax(assignment1)) ||
    assignment1.includes(getMin(assignment2)) ||
    assignment1.includes(getMax(assignment2));

  return splittedAssignments.reduce((acc, pair) => {
    const [assignment1, assignment2] = pair;
    return doAssignmentsOverlap(assignment1, assignment2) ? acc + 1 : acc;
  }, 0);
}

module.exports = async function solution(res: Response) {
  parseFile(__dirname, (testDataArray, dataArray) => {
    // Parse data
    const splittedAssignments = parseData(dataArray);
    const test_splittedAssignments = parseData(testDataArray);

    // Compute solutions
    const sol1 = getSolution1(splittedAssignments);
    const sol2 = getSolution2(splittedAssignments);
    const testSol1 = getSolution1(test_splittedAssignments);
    const testSol2 = getSolution2(test_splittedAssignments);

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
