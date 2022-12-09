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
  console.log("\n");
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

/**
 * Move a knot relatively to its previous knot and return the new knot coordinates
 * @param {Coord} knot
 * @param {Coord} prevKnot
 * @returns {Coord}
 */
function moveKnot(knot: Coord, prevKnot: Coord): Coord {
  const { abs } = Math;
  const xDiff = prevKnot.x - knot.x;
  const yDiff = prevKnot.y - knot.y;

  // Simple diagonal or just 1 step further: don't move
  if (
    (abs(xDiff) === 1 && abs(yDiff) === 1) ||
    (abs(xDiff) === 1 && abs(yDiff) === 0) ||
    (abs(xDiff) === 0 && abs(yDiff) === 1) ||
    (abs(xDiff) === 0 && abs(yDiff) === 0)
  ) {
    return { ...knot };
  }

  // By default, go to the previous knot. In the following lines, we adjust the destination by +/-1
  let { x: destX, y: destY } = prevKnot;

  // Diagonal: move knot in diagonal
  // .  .  .  .      .  .  .  .
  // .  Pk .  .  =>  .  Pk .  .
  // .  .  .  .      .  .  k  .
  // .  .  .  k      .  .  .  .
  if (xDiff === 2 && yDiff === 2) {
    // Top right
    return { x: destX - 1, y: destY - 1 };
  }
  if (xDiff === 2 && yDiff === -2) {
    // Bottom right
    return { x: destX - 1, y: destY + 1 };
  }
  if (xDiff === -2 && yDiff === 2) {
    // Top left
    return { x: destX + 1, y: destY - 1 };
  }
  if (xDiff === -2 && yDiff === -2) {
    // Bottom left
    return { x: destX + 1, y: destY + 1 };
  }

  // Same row
  if (prevKnot.x === knot.x) {
    if (yDiff == 2) return { x: destX, y: destY - 1 };
    if (yDiff == -2) return { x: destX, y: destY + 1 };
  }

  // Same column
  if (prevKnot.y === knot.y) {
    if (xDiff == 2) return { x: destX - 1, y: destY };
    if (xDiff == -2) return { x: destX + 1, y: destY };
  }

  // Not same column or same row (diagonally)
  if (abs(xDiff) === 2 || abs(yDiff) === 2) {
    // ===== Horizontally close =====//
    // Previous knot at top right or bottom right: k comes at the left of Pk
    // *  *  Pk   ||    k  *  *
    // k  *  *    ||    *  *  Pk

    if ((xDiff === 2 && yDiff === 1) || (xDiff === 2 && yDiff === -1)) {
      return { x: destX - 1, y: destY };
    }

    // Previous knot at top left or bottom left: k comes at the right of Pk
    // Pk  *  *     ||    *   *  k
    // *   *  k     ||    Pk  *  *
    if ((xDiff === -2 && yDiff === 1) || (xDiff === -2 && yDiff === -1)) {
      return { x: destX + 1, y: destY };
    }

    // ===== Vertically close =====//
    // Previous knot at top left or top right: k comes at the bottom of Pk
    // Pk  *    ||    *   Pk
    // *   *    ||    *   *
    // *   k    ||    k   *
    if ((xDiff === -1 && yDiff === 2) || (xDiff === 1 && yDiff === 2)) {
      return { x: destX, y: destY - 1 };
    }

    // Previous knot at bottom left or bottom right: k comes at the top of Pk
    // *   k    ||    k   *
    // *   *    ||    *   *
    // Pk  *    ||    *   Pk
    if ((xDiff === -1 && yDiff === -2) || (xDiff === 1 && yDiff === -2)) {
      return { x: destX, y: destY + 1 };
    }
  }

  console.error("Trying to move: ");
  console.error("Knot: x=" + knot.x + " y=" + knot.y);
  console.error("Previous knot: x=" + prevKnot.x + " y=" + prevKnot.y);
  throw new Error("Error while moving knot");
}

function removeDuplicates(visited: Coord[]): Coord[] {
  let uniquePositions: Coord[] = [];
  for (const c of visited) {
    if (!uniquePositions.find((c2) => c2.x === c.x && c2.y === c.y)) {
      uniquePositions.push(c);
    }
  }
  return uniquePositions;
}

function moveRope(moves: Move[], ropeLength: number): Coord[] {
  const knots = [];
  for (let i = 0; i < ropeLength; i++) {
    knots.push({ x: 0, y: 0 });
  }
  let visitedByTail = [];
  for (const move of moves) {
    const { direction, steps } = move;
    for (let i = 0; i < steps; i++) {
      knots[0] = moveTo(knots[0], direction);
      for (let j = 1; j < knots.length; j++) {
        knots[j] = moveKnot(knots[j], knots[j - 1]);
        if (j === knots.length - 1) {
          visitedByTail.push(knots[j]);
        }
      }
    }
  }
  return visitedByTail;
}

// Part 1 algo
function getSolution1(moves: Move[]): number {
  return removeDuplicates(moveRope(moves, 2)).length;
}

// Part 2 algo
function getSolution2(moves: Move[]) {
  return removeDuplicates(moveRope(moves, 10)).length;
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
