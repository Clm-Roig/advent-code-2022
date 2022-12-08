import { Response } from "express";
import { basename } from "path";
import getAvailableSolutions from "../../getAvailableSolutions";
import { parseFile } from "../utils";

let errorMessage: string;

type Forest = {
  height: number;
  trees: number[][];
  width: number;
};

/*
   0    width
  0----------------> x
h  | 1 7 2 3
e  | 2 1 4 7
i  | 6 3 6 9
g  | 3 8 2 1
h  |
t  V
   y
*/

const isVisible = (forest: Forest, x: number, y: number): boolean => {
  let visible = {
    top: true,
    bottom: true,
    right: true,
    left: true,
  };
  const { width, height, trees } = forest;
  const treeHeight = trees[y][x];

  if (y !== 0 && y !== height - 1 && x !== 0 && x !== width - 1) {
    let currentTreeHeight = 0;
    // Explore top
    for (let offset = 1; y - offset >= 0; offset++) {
      currentTreeHeight = trees[y - offset][x];
      if (currentTreeHeight >= treeHeight) {
        visible.top = false;
        break;
      }
    }

    // Explore bottom
    for (let offset = 1; y + offset < height; offset++) {
      currentTreeHeight = trees[y + offset][x];
      if (currentTreeHeight >= treeHeight) {
        visible.bottom = false;
        break;
      }
    }

    // Explore right
    for (let offset = 1; x + offset < width; offset++) {
      currentTreeHeight = trees[y][x + offset];
      if (currentTreeHeight >= treeHeight) {
        visible.right = false;
        break;
      }
    }

    // Explore left
    for (let offset = 1; x - offset >= 0; offset++) {
      currentTreeHeight = trees[y][x - offset];
      if (currentTreeHeight >= treeHeight) {
        visible.left = false;
        break;
      }
    }
  }

  return visible.top || visible.bottom || visible.left || visible.right;
};

const getScenicScore = (forest: Forest, x: number, y: number): number => {
  let scores = {
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
  };
  const { height, trees, width } = forest;
  const treeHeight = trees[y][x];

  if (y !== 0 && y !== height - 1 && x !== 0 && x !== width - 1) {
    let currentTreeHeight = 0;
    // Explore top
    for (let offset = 1; y - offset >= 0; offset++) {
      currentTreeHeight = trees[y - offset][x];
      scores.top += 1;
      if (currentTreeHeight >= treeHeight) {
        break;
      }
    }

    // Explore bottom
    for (let offset = 1; y + offset < height; offset++) {
      currentTreeHeight = trees[y + offset][x];
      scores.bottom += 1;
      if (currentTreeHeight >= treeHeight) {
        break;
      }
    }

    // Explore right
    for (let offset = 1; x + offset < width; offset++) {
      currentTreeHeight = trees[y][x + offset];
      scores.right += 1;
      if (currentTreeHeight >= treeHeight) {
        break;
      }
    }

    // Explore left
    for (let offset = 1; x - offset >= 0; offset++) {
      currentTreeHeight = trees[y][x - offset];
      scores.left += 1;
      if (currentTreeHeight >= treeHeight) {
        break;
      }
    }
  }

  return scores.top * scores.bottom * scores.left * scores.right;
};

function parseData(dataArray: string[]): Forest {
  let trees: number[][] = [];
  for (const [y, line] of dataArray.entries()) {
    for (const [x, char] of line.split("").entries()) {
      // @ts-ignore
      if (!trees[y]) trees[y] = [];
      // @ts-ignore
      trees[y][x] = char;
    }
  }
  const forest: Forest = {
    trees,
    width: trees[0].length,
    height: trees.length,
  };
  return forest;
}

// Part 1 algo
function getSolution1(forest: Forest): number {
  let res = 0;
  for (let y = 0; y < forest.height; y++) {
    for (let x = 0; x < forest.width; x++) {
      res += isVisible(forest, x, y) ? 1 : 0;
    }
  }
  return res;
}

// Part 2 algo
function getSolution2(forest: Forest): number {
  let bestScenicScore = 0;
  for (let y = 0; y < forest.height; y++) {
    for (let x = 0; x < forest.width; x++) {
      const newScore = getScenicScore(forest, x, y);
      bestScenicScore = newScore > bestScenicScore ? newScore : bestScenicScore;
    }
  }
  return bestScenicScore;
}

module.exports = async function solution(res: Response) {
  parseFile(__dirname, (testDataArray, dataArray) => {
    // Parse data
    const test_forest = parseData(testDataArray);
    const forest = parseData(dataArray);

    // Compute solutions
    const sol1 = getSolution1(forest);
    const sol2 = getSolution2(forest);
    const testSol1 = getSolution1(test_forest);
    const testSol2 = getSolution2(test_forest);

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
