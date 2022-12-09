import { Response } from "express";
import { basename } from "path";
import getAvailableSolutions from "../../getAvailableSolutions";
import { getMin, getMax, parseFiles, parseFile } from "../utils";

let errorMessage: string;

type Move = {
  direction: Direction;
  steps: number;
};
enum Direction {
  R = "Right",
  L = "Left",
  U = "Up",
  D = "Down",
}

type Coord = {
  x: number;
  y: number;
};

const printVisitedPositions = (visited: Coord[]) => {
  const minX = getMin(visited.map((c) => c.x));
  const maxX = getMax(visited.map((c) => c.x));
  const minY = getMin(visited.map((c) => c.y));
  const maxY = getMax(visited.map((c) => c.y));
  for (let y = maxY; y >= minY; y--) {
    let line = "";
    for (let x = minX; x <= maxX; x++) {
      const found = visited.find((c) => c.x === x && c.y === y);
      line += found ? "# " : ". ";
    }
    console.log(line);
  }
};

const moveTo = (coord: Coord, dir: Direction): Coord => {
  const { x: prevX, y: prevY } = coord;
  switch (dir) {
    case Direction.D:
      return { x: prevX, y: prevY - 1 };
    case Direction.U:
      return { x: prevX, y: prevY + 1 };
    case Direction.L:
      return { x: prevX - 1, y: prevY };
    default:
      return { x: prevX + 1, y: prevY };
  }
};

const parseData = (dataArray: string[]) => {
  const moves = dataArray.map((line) => {
    const [dirStr, steps] = line.split(" ");
    const stepsNbr = Number(steps);
    let direction = Direction.D;
    if (dirStr === "U") direction = Direction.U;
    if (dirStr === "L") direction = Direction.L;
    if (dirStr === "R") direction = Direction.R;
    return { steps: stepsNbr, direction } as Move;
  });
  return moves;
};

// For a rope with two knots : Head and tail
function tailMustMove(head: Coord, tail: Coord): boolean {
  const { abs } = Math;
  const yDiff = abs(head.y - tail.y);
  const xDiff = abs(head.x - tail.x);
  // Same row
  if (head.x === tail.x && yDiff > 1) {
    return true;
  }
  // Same column
  if (head.y === tail.y && xDiff > 1) {
    return true;
  }
  // Not same row or column
  return xDiff > 1 || yDiff > 1;
}

function tailMustMoveSol2(head: Coord, tail: Coord, ropeSize: number): boolean {
  const { abs } = Math;
  const yDiff = abs(head.y - tail.y);
  const xDiff = abs(head.x - tail.x);
  // Same row
  if (head.x === tail.x && yDiff > ropeSize - 1) {
    return true;
  }
  // Same column
  if (head.y === tail.y && xDiff > ropeSize - 1) {
    return true;
  }
  // Not same row or column
  return xDiff > ropeSize - 1 || yDiff > ropeSize - 1;
}

// Part 1 algo
function getSolution1(moves: Move[]): number {
  let x = 0;
  let y = 0;
  let head = { x, y };
  let prevHead = { x, y };
  let tail = { x, y };
  let visited: Coord[] = [];
  visited.push(tail);
  for (const move of moves) {
    const { direction, steps } = move;
    for (let i = 0; i < steps; i++) {
      if (tailMustMove(head, tail)) {
        tail = prevHead;
        visited.push(tail);
      }
      prevHead = head;
      head = moveTo(head, direction);
    }
  }

  // Remove duplicates
  let uniquePositions: Coord[] = [];
  for (const c of visited) {
    if (!uniquePositions.find((c2) => c2.x === c.x && c2.y === c.y)) {
      uniquePositions.push(c);
    }
  }

  return uniquePositions.length;
}

// Part 2 algo
function getSolution2(moves: Move[]) {
  return undefined;
}

module.exports = async function solution(res: Response) {
  parseFiles(__dirname, (testDataArray, dataArray) => {
    parseFile(__dirname, "test-input-2.txt", (test2DataArray) => {
      // Parse data
      const data = parseData(dataArray);
      const test_data = parseData(testDataArray);
      const test2_data = parseData(test2DataArray);

      // Compute solutions
      const sol1 = getSolution1(data);
      const sol2 = getSolution2(data);
      const testSol1 = getSolution1(test_data);
      const testSol2 = getSolution2(test2_data);

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
};
