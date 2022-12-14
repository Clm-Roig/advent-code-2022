import { Response } from "express";
import { basename } from "path";
import getAvailableSolutions from "../../getAvailableSolutions";
import { parseFiles } from "../utils";

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
  // Get min & max x & y
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

  // Place sand source
  const source = { x: 500 - minX, y: 0 };
  map[500 - minX].pop();
  map[500 - minX].unshift(SAND_SOURCE);

  // Fill the cave
  for (const line of dataArray) {
    const lineCoords = line.split(" -> ");
    let prevCord: number[] = [];
    for (const linePoint of lineCoords) {
      const coords = linePoint.split(",");
      const x = Number(coords[0]) - minX;
      const y = Number(coords[1]) - minY;
      if (prevCord.length > 0) {
        const prevX = Number(prevCord[0]);
        const prevY = Number(prevCord[1]);
        for (let i = min(x, prevX); i <= max(x, prevX); i++) {
          map[i][y] = ROCK;
        }
        for (let j = min(y, prevY); j <= max(y, prevY); j++) {
          map[x][j] = ROCK;
        }
      } else {
        map[x][y] = ROCK;
      }
      prevCord = [x, y];
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
  map: Cave["map"],
  caveHeight: Cave["height"],
  caveWidth: Cave["width"],
  x: number,
  y: number
): { x: number; y: number } {
  if (y > caveHeight || x === 0 || x === caveWidth - 1)
    return { x: Infinity, y: Infinity };
  if (canStop(map, x, y)) return { x, y };
  if (!isOccupied(map[x][y + 1]))
    return getSandDestination(map, caveHeight, caveWidth, x, y + 1);
  if (x > 0 && !isOccupied(map[x - 1][y + 1]))
    return getSandDestination(map, caveHeight, caveWidth, x - 1, y + 1);
  if (!isOccupied(map[x + 1][y + 1]))
    return getSandDestination(map, caveHeight, caveWidth, x + 1, y + 1);
  return getSandDestination(map, caveHeight, caveWidth, x, y + 1);
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
      mapCopy,
      cave.height,
      cave.width,
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

// Part 1 algo
function getSolution1(cave: Cave): number {
  const {
    source: { x: sourceX, y: sourceY },
  } = cave;
  const { map: newMap, sandCount } = sandFall(sourceX, sourceY + 1, cave);
  printCave(cave);

  return sandCount;
}

// Part 2 algo
function getSolution2(cave: Cave): number {
  return -1;
}

module.exports = async function solution(res: Response) {
  parseFiles(__dirname, (testDataArray, dataArray) => {
    // Parse data

    // Compute solutions
    const sol1 = getSolution1(parseData(dataArray));
    // const sol2 = getSolution2(data);
    const sol2 = "";
    const testSol1 = getSolution1(parseData(testDataArray));
    const testSol2 = "";

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
