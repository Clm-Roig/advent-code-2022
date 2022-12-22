import { Response } from "express";
import { basename } from "path";
import getAvailableSolutions from "../../getAvailableSolutions";
import { getMax, parseFiles } from "../utils";
import ValveTreeNode from "./ValveTreeNode";

let errorMessage: string;

const parseData = (dataArray: string[]) => {
  const allNodes: ValveTreeNode[] = [];
  for (const line of dataArray) {
    const [flowRate] = line.match(/-?\d+/g)!;
    const [currentValve, ...tunnels] = line.match(/[A-Z]{2}/g)!;
    const node = new ValveTreeNode(currentValve);
    node.value = Number(flowRate);
    allNodes.push(node);
  }
  for (const line of dataArray) {
    const [currentValve, ...tunnels] = line.match(/[A-Z]{2}/g)!;
    const valve = allNodes.find((n) => n.name === currentValve);

    for (const tunnel of tunnels) {
      const childValve = allNodes.find((n) => n.name === tunnel)!;
      valve?.addChild(childValve);
    }
  }

  return allNodes;
};

function exploreNodes(
  currentNode: ValveTreeNode,
  allNodes: ValveTreeNode[],
  score: number,
  remainingMinutes: number
): number {
  if (remainingMinutes === 0) return score;
  if (allNodes.filter((n) => !n.isOpen).length === 0) {
    return exploreNodes(currentNode, allNodes, score, remainingMinutes - 1);
  }

  let allScores = [];
  if (!currentNode.isOpen) {
    currentNode.isOpen = true;
    allScores.push({
      node: currentNode,
      score: score + currentNode.value! * remainingMinutes,
    });
  }
  for (const child of currentNode.children) {
    allScores.push({
      node: child,
      score: exploreNodes(child, allNodes, score, remainingMinutes - 1),
    });
  }

  const bestScoreAndNode = allScores.reduce(
    (scoreAndNode, best) =>
      best.score < scoreAndNode.score ? scoreAndNode : best,
    allScores[0]
  );

  return exploreNodes(
    bestScoreAndNode.node,
    allNodes,
    bestScoreAndNode.score,
    remainingMinutes - 1
  );
}

// Part 1 algo
function getSolution1(allNodes: ValveTreeNode[]): number {
  const res = exploreNodes(allNodes[0], allNodes, 0, 30);
  console.log("finished", res);
  return res;
}

// Part 2 algo
function getSolution2(): string {
  return "sol2";
}

module.exports = async function solution(res: Response) {
  parseFiles(__dirname, (testDataArray, dataArray) => {
    // Parse data
    // const data = parseData(dataArray);
    const test_data = parseData(testDataArray);

    // Compute solutions
    let testSol1, testSol2, sol1, sol2;
    // sol1 = getSolution1(data);
    // sol2 = getSolution2(data);
    // testSol1 = getSolution1(test_data);
    // testSol2 = getSolution2();

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
