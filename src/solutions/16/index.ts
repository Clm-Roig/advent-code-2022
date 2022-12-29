import { Response } from "express";
import { basename } from "path";
import getAvailableSolutions from "../../getAvailableSolutions";
import { parseFiles } from "../utils";
import ValveTreeNode from "./ValveTreeNode";

let errorMessage: string;

interface Distances {
  [node: string]: { [node: string]: number };
}
type Node = string;

function findDistance(distances: Distances, start: Node, end: Node): number {
  // Keep track of the nodes that have been visited
  const visited: Set<Node> = new Set();

  // Keep track of the distances to each node
  const trackedDistances: { [node: string]: number } = {};
  Object.keys(distances).forEach((node) => {
    trackedDistances[node] = Infinity;
  });
  trackedDistances[start] = 0;

  // Keep track of the nodes that are still unvisited
  const unvisited = new Set(Object.keys(distances));

  // Set the current node to the start node
  let current = start;

  while (unvisited.size > 0) {
    // Mark the current node as visited
    visited.add(current);
    unvisited.delete(current);

    // Update the distance to each unvisited neighbor
    Object.keys(distances[current]).forEach((neighbor) => {
      if (unvisited.has(neighbor)) {
        const newDistance =
          trackedDistances[current] + distances[current][neighbor];
        if (newDistance < trackedDistances[neighbor]) {
          trackedDistances[neighbor] = newDistance;
        }
      }
    });

    // Choose the next unvisited node with the smallest distance
    let minDistance = Infinity;
    let next: Node | undefined;
    unvisited.forEach((node) => {
      if (trackedDistances[node] < minDistance) {
        minDistance = trackedDistances[node];
        next = node;
      }
    });

    // @ts-ignore
    current = next;
  }

  return trackedDistances[end];
}

const parseData = (
  dataArray: string[]
): { allNodes: ValveTreeNode[]; distances: Distances } => {
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
      valve?.addConnection(childValve);
    }
  }

  let distances: Distances = {};
  // Compute 0 and 1 distances
  allNodes.forEach((node) => {
    distances[node.name] = { [node.name]: 0 };
    for (const valve of node.connectedToValves) {
      distances[node.name][valve.name] = 1;
    }
  });

  // Compute all distances
  allNodes.forEach((node) => {
    for (const valveName of [...new Set(allNodes.flatMap((n) => n.name))]) {
      distances[node.name][valveName] = findDistance(
        distances,
        node.name,
        valveName
      );
    }
  });

  return { allNodes, distances };
};

function exploreNodes(
  currentNode: ValveTreeNode,
  allNodes: ValveTreeNode[],
  distances: Distances,
  currentScore: number,
  remainingMinutes: number
): number {
  if (remainingMinutes === 0) return currentScore;
  if (allNodes.filter((n) => !n.isOpen).length === 0) {
    return currentScore;
  }

  let allScores = [];
  if (!currentNode.isOpen) {
    allScores.push({
      node: currentNode,
      score: currentNode.value! * (remainingMinutes - 1),
    });
  }
  for (const otherValve of allNodes.filter(
    (v) => v.name !== currentNode.name
  )) {
    if (!otherValve.isOpen && otherValve.value !== 0) {
      allScores.push({
        node: otherValve,
        score:
          otherValve.value! *
          (remainingMinutes - distances[currentNode.name][otherValve.name] - 1),
      });
    }
  }

  const bestScoreAndNode = allScores.reduce(
    (scoreAndNode, best) =>
      best.score < scoreAndNode.score ? scoreAndNode : best,
    allScores[0]
  );

  if (!bestScoreAndNode) {
    return exploreNodes(
      currentNode,
      allNodes,
      distances,
      currentScore,
      remainingMinutes - 1
    );
  }
  const { node: bestNode, score: bestScore } = bestScoreAndNode;
  bestNode.isOpen = true;
  console.log("=====================");
  console.log(allScores.map((n) => n.node.name + " " + n.score));
  console.log(
    `going to and opening ${bestNode.name} with p=${
      bestNode.value
    } and d=${findDistance(distances, currentNode.name, bestNode.name)}`
  );
  const newRemainingMinutes =
    remainingMinutes - distances[currentNode.name][bestNode.name] - 1;
  console.log(newRemainingMinutes + "min left, current score=" + currentScore);

  return exploreNodes(
    bestNode,
    allNodes,
    distances,
    currentScore + bestScore,
    newRemainingMinutes
  );
}

// Part 1 algo
function getSolution1(allNodes: ValveTreeNode[], distances: Distances): number {
  const res = exploreNodes(allNodes[0], allNodes, distances, 0, 30);
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
    const { allNodes: test_data, distances: test_distances } =
      parseData(testDataArray);

    // Compute solutions
    let testSol1, testSol2, sol1, sol2;
    // sol1 = getSolution1(data);
    // sol2 = getSolution2(data);
    testSol1 = getSolution1(test_data, test_distances);
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
