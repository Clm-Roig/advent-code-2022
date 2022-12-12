import { Response } from "express";
import { basename } from "path";
import getAvailableSolutions from "../../getAvailableSolutions";
import { getMax, getMin, parseFiles } from "../utils";

let errorMessage: string;

type Point = {
  char: string;
  x: number;
  y: number;
  distance: number;
  height: number;
  isVisited: boolean;
};

function dijkstraPath(map: Point[]) {
  let visitedPoints = [];
  let unvisitedPoints = map;
  let source = unvisitedPoints.find((p) => p.char === "S")!;
  let destinationFound = false;

  while (!destinationFound || unvisitedPoints.length > 0) {
    const neighbors = unvisitedPoints.filter(
      (p) =>
        !p.isVisited &&
        ((p.x === source.x && (p.y === source.y - 1 || p.y === source.y + 1)) ||
          (p.y === source.y && (p.x === source.x - 1 || p.x === source.x + 1)))
    );

    for (const neighbor of neighbors) {
      neighbor.distance =
        neighbor.height <= source.height + 1
          ? Math.min(neighbor.distance, source.distance + 1)
          : Math.min(neighbor.distance, Infinity);
      if (source.char === "z" || source.char === "y") {
        // console.log("===============");
        // console.log(source);
        // console.log(neighbors);
      }
    }

    source.isVisited = true;
    unvisitedPoints = unvisitedPoints.filter(
      (p) => !(p.x === source.x && p.y === source.y) && !p.isVisited
    );
    visitedPoints.push(source);

    if (source.char === "E") {
      destinationFound = true;
    } else if (neighbors.length > 0) {
      const minDist = getMin(neighbors.map((n) => n.distance));
      source = neighbors.find((n) => n.distance === minDist)!;
      if (!source) {
        throw new Error("New source not found among neighbors");
      }
    } else if (unvisitedPoints.length > 0) {
      console.log("%%% starting again %%%");
      source = unvisitedPoints[0];
    }
  }
  console.log(visitedPoints);
}

function printMap(map: Point[]) {
  console.log("===============");
  const maxX = getMax(map.map((p) => p.x));
  const maxY = getMax(map.map((p) => p.y));
  for (let y = maxY; y >= 0; y--) {
    let currentLine = "";
    for (let x = 0; x < maxX; x++) {
      const point = map.find((p) => p.x === x && p.y === y)!;
      currentLine +=
        " " +
        ((point.distance === Infinity ? "°°" : point.distance) + "").padStart(
          2,
          " "
        );
    }
    console.log(currentLine);
  }
}

const parseData = (dataArray: string[]) => {
  const map: Point[] = [];
  for (let y = dataArray.length - 1; y >= 0; y--) {
    const line = dataArray[y].split("");
    for (let x = 0; x < line.length; x++) {
      const char = line[x];

      // See ASCII table: https://asecuritysite.com/coding/asc2
      const lowLimitLowerChars = 97;
      if (char === "S") {
        map.push({
          char,
          x,
          y: Math.abs(y - dataArray.length + 1),
          isVisited: false,
          height: 0,
          distance: 0,
        });
      } else if (char === "E") {
        map.push({
          char,
          x,
          y: Math.abs(y - dataArray.length + 1),
          isVisited: false,
          height: "z".charCodeAt(0) - lowLimitLowerChars,
          distance: Infinity,
        });
      } else {
        map.push({
          char,
          x,
          y: Math.abs(y - dataArray.length + 1),
          isVisited: false,
          height: char.charCodeAt(0) - lowLimitLowerChars,
          distance: Infinity,
        });
      }
    }
  }
  return map;
};

// Part 1 algo
function getSolution1(map: Point[]): string {
  dijkstraPath(map);
  return "ok";
}

// Part 2 algo
function getSolution2(): string {
  return "sol2";
}

module.exports = async function solution(res: Response) {
  parseFiles(__dirname, (testDataArray, dataArray) => {
    // Parse data
    // const data = parseData(dataArray);
    const test_map = parseData(testDataArray);

    // Compute solutions
    // const sol1 = getSolution1(data);
    // const sol2 = getSolution2(data);
    const sol1 = "";
    const sol2 = "";
    const testSol1 = getSolution1(test_map);
    const testSol2 = getSolution2();

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
