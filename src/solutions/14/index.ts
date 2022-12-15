import { Response } from "express";
import { basename } from "path";
import getAvailableSolutions from "../../getAvailableSolutions";
import { parseFile, parseFiles } from "../utils";

let errorMessage: string;
const ROCK = "＠";
const SAND = "＊";
const SAND_SOURCE = "％";
const AIR = "＿";

type Cave = {
  height: number;
  map: string[][];
  source: {
    x: number;
    y: number;
  };
  width: number;
};

const transpose = (m: string[][]) => m[0].map((x, i) => m.map((x) => x[i]));

const parseData = (dataArray: string[]): Cave => {
  const { min, max } = Math;
  let minX = Infinity;
  let minY = 0;
  let maxX = 0;
  let maxY = 0;
  // Get min & max x & y to offset all the data
  for (const line of dataArray) {
    const splittedLine = line.split(" -> ").join().split(",");
    const allX = splittedLine
      .filter((v, i) => i % 2 === 0)
      .map((v) => Number(v));
    const allY = splittedLine
      .filter((v, i) => i % 2 !== 0)
      .map((v) => Number(v));
    maxX = max(max(...allX), maxX);
    maxY = max(max(...allY), maxY);
    minX = min(min(...allX), minX);
  }
  let map = Array(maxX - minX + 1)
    .fill(AIR)
    .map(() => Array(maxY - minY + 1).fill(AIR));

  console.table({ minX: minX, maxX: maxX, minY: minY, maxY: maxY });

  // Place sand source
  const source = { x: 500 - minX, y: 0 };
  map[500 - minX].pop();
  map[500 - minX].unshift(SAND_SOURCE);

  // Fill the cave
  for (const line of dataArray) {
    const lineCoords = line.split(" -> ");
    let prevCoord: number[] = [];
    for (const linePoint of lineCoords) {
      const coords = linePoint.split(",");
      const x = Number(coords[0]) - minX;
      const y = Number(coords[1]) - minY;
      if (prevCoord.length > 0) {
        const prevX = Number(prevCoord[0]);
        const prevY = Number(prevCoord[1]);
        // Build rock lines from previous rock coord
        for (let i = min(x, prevX); i <= max(x, prevX); i++) {
          map[i][y] = ROCK;
        }
        for (let j = min(y, prevY); j <= max(y, prevY); j++) {
          map[x][j] = ROCK;
        }
      } else {
        map[x][y] = ROCK;
      }
      prevCoord = [x, y];
    }
  }

  return {
    map,
    source,
    width: map.length,
    height: map[0].length,
  };
};

function printCave(cave: Cave) {
  console.log("\n====================");
  transpose(cave.map).map((line) => console.log(line.join("")));
}

const isOccupied = (point: string) => point === ROCK || point === SAND;

const canStop = (map: Cave["map"], x: number, y: number): boolean =>
  !isOccupied(map[x][y]) &&
  isOccupied(map[x][y + 1]) &&
  isOccupied(map[x + 1][y + 1]) &&
  isOccupied(map[x - 1][y + 1]);

function getSandDestination(
  cave: Cave,
  x: number,
  y: number
): { x: number; y: number } {
  const { height, map, width } = cave;
  // Out of bound
  if (y > height || x === 0 || x === width - 1)
    return { x: Infinity, y: Infinity };

  // Can't fall more: stop here
  if (canStop(map, x, y)) return { x, y };

  // Fall below
  if (!isOccupied(map[x][y + 1])) return getSandDestination(cave, x, y + 1);

  // Fall to left diagonal
  if (x > 0 && !isOccupied(map[x - 1][y + 1]))
    return getSandDestination(cave, x - 1, y + 1);

  // Fall to right diagonal
  if (!isOccupied(map[x + 1][y + 1]))
    return getSandDestination(cave, x + 1, y + 1);

  return { x: Infinity, y: Infinity };
}

function sandFall(
  x: number,
  y: number,
  cave: Cave
): { map: Cave["map"]; sandCount: number } {
  let sandCount = 0;
  let mapCopy = [...cave.map];
  let stop = false;
  while (!stop) {
    const { x: sandX, y: sandY } = getSandDestination(
      { ...cave, map: mapCopy },
      x,
      y
    );
    if (sandX === Infinity || sandY === Infinity) {
      stop = true;
    } else {
      mapCopy[sandX][sandY] = SAND;
      sandCount += 1;
    }
  }

  return { map: mapCopy, sandCount };
}

// Same algo for both solutions
function getSolution(cave: Cave): number {
  const {
    source: { x: sourceX, y: sourceY },
  } = cave;
  const { map: newMap, sandCount } = sandFall(sourceX, sourceY, cave);
  printCave(cave);
  return sandCount;
}

module.exports = async function solution(res: Response) {
  parseFiles(__dirname, (testDataArray, dataArray) => {
    // For Part 2, I added the bottom rock line to the input files, after reading the minX, maxX, minY & maxY values in parseData.
    parseFile(__dirname, "test-input-2.txt", (testData2Array) => {
      parseFile(__dirname, "input-2.txt", (data2Array) => {
        // Compute solutions
        const sol1 = getSolution(parseData(dataArray));
        const sol2 = getSolution(parseData(data2Array));
        const testSol1 = getSolution(parseData(testDataArray));
        const testSol2 = getSolution(parseData(testData2Array));

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
    });
  });
};
