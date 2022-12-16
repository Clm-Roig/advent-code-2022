import { Response } from "express";
import { basename } from "path";
import getAvailableSolutions from "../../getAvailableSolutions";
import { clearLastLine, parseFiles, removeDupplicates } from "../utils";

let errorMessage: string;

const AIR = "＿";
const BEACON = "Ｂ";
const NO_BEACON = "＃";
const SENSOR = "Ｓ";
const VOID = "  ";

interface Point {
  id: string; // xy concatenated
  x: number;
  y: number;
}

interface Beacon extends Point {}
interface Sensor extends Point {
  closestBeacon: Beacon;
  closestBeaconDistance: number;
  noBeaconPoints: Point[];
}

class Zone {
  beacons: Beacon[];
  sensors: Sensor[];
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

const getManhattanDistance = (x1: number, y1: number, x2: number, y2: number) =>
  Math.abs(x1 - x2) + Math.abs(y1 - y2);

const parseData = (dataArray: string[]): Zone => {
  let minX = Infinity,
    minY = Infinity;
  let maxX = -Infinity,
    maxY = -Infinity;
  const sensors: Sensor[] = [];
  const beacons: Beacon[] = [];
  for (const line of dataArray) {
    // Parse and build sensor and beacon
    const numbers = line.match(/-?\d+/g);
    const [sX, sY, beaconX, beaconY] = numbers!;
    const sensorX = Number(sX);
    const sensorY = Number(sY);
    const beacon = {
      id: beaconX + ";" + beaconY,
      x: Number(beaconX),
      y: Number(beaconY),
    };
    const closestBeaconDistance = getManhattanDistance(
      sensorX,
      sensorY,
      beacon.x,
      beacon.y
    );
    const noBeaconPoints: Point[] = [];

    // ===== DEBUG (solution not scalable for "real input")
    // const nbOfIterations =
    //   sensorX + closestBeaconDistance - (sensorX - closestBeaconDistance);
    // console.log(nbOfIterations + " iterations on i to do\n");
    let count = 0;
    for (
      let i = sensorX - closestBeaconDistance;
      i <= sensorX + closestBeaconDistance;
      i++
    ) {
      // ===== DEBUG
      // if (count % 100 === 0) {
      //   clearLastLine();
      //   console.log((count / nbOfIterations) * 100 + "% done");
      // }
      // count += 1;

      for (
        let j = sensorY - closestBeaconDistance;
        j <= sensorY + closestBeaconDistance;
        j++
      ) {
        const point = { id: "" + i + j, x: i, y: j };
        if (
          getManhattanDistance(point.x, point.y, sensorX, sensorY) <=
          closestBeaconDistance
        ) {
          noBeaconPoints.push({ id: i + ";" + j, x: i, y: j });
        }
      }
    }
    const sensor = {
      id: sensorX + ";" + sensorY,
      x: sensorX,
      y: sensorY,
      closestBeacon: beacon,
      closestBeaconDistance,
      noBeaconPoints,
    };

    // Update Zone data
    sensors.push(sensor);
    if (!beacons.find((b) => b.id === beacon.id)) {
      beacons.push(beacon);
    }
    minX = Math.min(
      minX,
      sensor.x - closestBeaconDistance,
      sensor.closestBeacon.x
    );
    minY = Math.min(
      minY,
      sensor.y - closestBeaconDistance,
      sensor.closestBeacon.y
    );
    maxX = Math.max(
      maxX,
      sensor.x + closestBeaconDistance,
      sensor.closestBeacon.x
    );
    maxY = Math.max(
      maxY,
      sensor.y + closestBeaconDistance,
      sensor.closestBeacon.y
    );
  }
  const zone = new Zone();
  zone.beacons = beacons;
  zone.sensors = sensors;
  zone.minX = minX;
  zone.minY = minY;
  zone.maxX = maxX;
  zone.maxY = maxY;

  return zone;
};

function printZone(zone: Zone) {
  const { beacons, sensors, minX, maxX, minY, maxY } = zone;
  const leftPaddingLength = (maxY + "").length + 1;

  // First line (x axis)
  let firstLine = VOID.repeat(leftPaddingLength);
  for (let i = minX; i <= maxX; i++) {
    firstLine += i % 5 === 0 ? i : VOID;
  }
  console.log(firstLine);

  // Other lines (zone)
  for (let j = minY; j <= maxY; j++) {
    let lineToPrint = (j % 5 === 0 ? "" + j : "").padEnd(
      leftPaddingLength,
      VOID
    );
    for (let i = minX; i <= maxX; i++) {
      if (beacons.find((b) => b.x === i && b.y === j)) {
        lineToPrint += BEACON;
      } else if (sensors.find((s) => s.x === i && s.y === j)) {
        lineToPrint += SENSOR;
      } else if (
        sensors
          .map((s) => s.noBeaconPoints)
          .flat()
          .find((p) => p.x === i && p.y === j)
      ) {
        lineToPrint += NO_BEACON;
      } else {
        lineToPrint += AIR;
      }
    }
    console.log(lineToPrint);
  }
}

// Part 1 algo
function getSolution1(zone: Zone, rowNumber: number): number {
  const occupiedPoints: Point[] = [
    ...zone.sensors.flatMap((s) => [
      { id: s.id, x: s.x, y: s.y },
      ...s.noBeaconPoints,
    ]),
  ];
  const uniqueOccupiedPoints = removeDupplicates<Point>(occupiedPoints, "id");

  return uniqueOccupiedPoints
    .filter((p) => p.y === rowNumber)
    .reduce((total, p) => (p.y === rowNumber ? (total += 1) : total), 0);
}

// Part 2 algo
function getSolution2(): string {
  return "sol2";
}

module.exports = async function solution(res: Response) {
  parseFiles(__dirname, (testDataArray, dataArray) => {
    // Parse data
    const test_data = parseData(testDataArray);
    // const data = parseData(dataArray);

    // Compute solutions
    // const sol1 = getSolution1(data, 10);
    // const sol2 = getSolution2(data);
    const sol1 = "";
    const sol2 = "";
    const testSol1 = getSolution1(test_data, 10);
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
