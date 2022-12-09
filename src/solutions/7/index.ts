import { Response } from "express";
import { basename } from "path";
import getAvailableSolutions from "../../getAvailableSolutions";
import { parseFiles } from "../utils";
import TreeNode from "../TreeNode";
let errorMessage: string;

const parseData = (dataArray: string[]): TreeNode<number> => {
  const rootTree = new TreeNode("/", 0);
  // ignore first line since it's just moving to the root
  const [_, ...dataArrayWithoutFirstLine] = dataArray;

  // Build the file tree
  let listingFiles = false;
  let currentTree = rootTree;
  for (const line of dataArrayWithoutFirstLine) {
    const [word1, word2, word3] = line.split(" ");

    if (word1 === "$") {
      // Typing a command (ls or cd)
      if (word2 === "cd") {
        listingFiles = false;
        if (word3 === ".." && currentTree.parent) {
          // cd ..
          currentTree = currentTree.parent;
        } else {
          // cd someFolder
          currentTree = currentTree.addNode(word3, 0);
        }
      }
      if (word2 === "ls") {
        listingFiles = true;
        continue;
      }
    }

    if (listingFiles) {
      if (word1 === "dir") {
        // dir aDirectory
        currentTree.addNode(word2, 0);
      } else {
        // 12345 someFile.ext
        currentTree.addNode(word2, Number(word1));
      }
    }
  }

  return rootTree;
};

const getSmallDirectoriesTotal = (
  tree: TreeNode<number>,
  total: number
): number => {
  const THRESHOLD = 100000;
  const treeValue = tree.getTreeValue();
  let newTotal = total;
  if (tree.value !== 0) return 0; // skip files
  if (treeValue < THRESHOLD) newTotal += treeValue; // accumulate small dir value

  const childTotal = [...tree.children].reduce(
    (acc, child) => (acc += getSmallDirectoriesTotal(child, total)),
    0
  );
  return childTotal + newTotal;
};

// Part 1 algo
function getSolution1(tree: TreeNode<number>): number {
  return getSmallDirectoriesTotal(tree, 0);
}

// Part 2 algo
function getSolution2(tree: TreeNode<number>): number {
  const NEEDED_SPACE = 30000000;
  const TOTAL_SPACE = 70000000;
  const totalDiskSpace = tree.getTreeValue();
  const freeDiskSpace = TOTAL_SPACE - totalDiskSpace;
  const toDeleteDiskSpace = NEEDED_SPACE - freeDiskSpace;

  let res = 0;

  const directories = tree.getAllNodesWithoutValue();
  const sortedDirectoriesWithSize = directories
    .map((dir) => ({
      dir: dir.name,
      size: dir.getTreeValue(),
    }))
    .sort((d1, d2) => d1.size - d2.size);

  let i = 0;
  while (!res && i < sortedDirectoriesWithSize.length) {
    const currentDir = sortedDirectoriesWithSize[i];
    if (currentDir.size >= toDeleteDiskSpace) {
      res = currentDir.size;
    }
    i += 1;
  }

  return res;
}

module.exports = async function solution(res: Response) {
  parseFiles(__dirname, (testDataArray, dataArray) => {
    // Parse data
    const tree = parseData(dataArray);
    const test_tree = parseData(testDataArray);

    // Compute solutions
    const sol1 = getSolution1(tree);
    const sol2 = getSolution2(tree);
    const testSol1 = getSolution1(test_tree);
    const testSol2 = getSolution2(test_tree);

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
