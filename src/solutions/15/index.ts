import { Response } from "express";
import { basename } from "path";
import getAvailableSolutions from "../../getAvailableSolutions";
import {
  clearLastLine,
  displayProgressBar,
  parseFiles,
  removeDupplicates,
} from "../utils";

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
}

class Zone {
  beacons: Beacon[];
  sensors: Sensor[];
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

const makePointId = (x: string | number, y: string | number) => x + ";" + y;

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
      id: makePointId(beaconX, beaconY),
      x: Number(beaconX),
      y: Number(beaconY),
    };
    const closestBeaconDistance = getManhattanDistance(
      sensorX,
      sensorY,
      beacon.x,
      beacon.y
    );

    const sensor = {
      id: makePointId(sensorX, sensorY),
      x: sensorX,
      y: sensorY,
      closestBeacon: beacon,
      closestBeaconDistance,
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
      } else {
        lineToPrint += AIR;
      }
    }
    console.log(lineToPrint);
  }
}

// For part 1
// Return true if {x,y} is not spotted by the sensor as a "no beacon" point
function canBeaconBeHere(x: number, y: number, sensor: Sensor): boolean {
  const {
    x: sensorX,
    y: sensorY,
    closestBeaconDistance,
    closestBeacon,
  } = sensor;
  if (closestBeacon.x === x && closestBeacon.y === y) return true;
  if (sensorX === x && sensorY === y) return false;
  if (getManhattanDistance(x, y, sensorX, sensorY) <= closestBeaconDistance) {
    return false;
  }
  return true;
}

// On a given row, get the min and max X values covered by the sensor
function getMinAndMaxXWithoutBeacon(sensor: Sensor, rowNumber: number) {
  const { x, y, closestBeaconDistance } = sensor;
  const dY = Math.abs(rowNumber - y);
  if (
    rowNumber > y + closestBeaconDistance &&
    rowNumber < y - closestBeaconDistance
  ) {
    return { min: -Infinity, max: Infinity };
  }

  /*  
      m = minX, M = maxX, / and \ = sensor exclusion zone
      0
      |       . . . . . S . . . . . 
      |       \ . . . dY| . . . . / 
      |       . \ . . . | . . . / . 
    rowNb     ____m_____|_____M____
      |       . . . \ . . . / . . . 
      |       . . . . \ . / . . . .
      |       . . . . . - . . . . . 
      V
  */
  return {
    min: x - (closestBeaconDistance - dY),
    max: x + (closestBeaconDistance - dY),
  };
}

// Part 1 algo
function getSolution1(zone: Zone, rowNumber: number): number {
  const { minX, maxX, sensors } = zone;
  let count = 0;
  for (let i = minX; i <= maxX; i++) {
    for (const sensor of sensors) {
      if (!canBeaconBeHere(i, rowNumber, sensor)) {
        count += 1;
        break;
      }
    }
  }
  return count;
}

// Part 2 algo
function getSolution2(zone: Zone, highLimit: number): number {
  const { minX, maxX, minY, maxY, sensors } = zone;
  const yMaxValue = Math.min(maxY, highLimit);
  const xMaxValue = Math.min(maxX, highLimit);
  console.log();
  for (let j = Math.max(minY, 0); j <= yMaxValue; j++) {
    displayProgressBar(j, yMaxValue);
    const allRanges = [];
    for (const sensor of sensors) {
      const { min, max } = getMinAndMaxXWithoutBeacon(sensor, j);
      // Clamp ranges from 0 to highLimit
      if (min >= 0 || max <= highLimit) {
        allRanges.push({
          min: Math.max(min, 0),
          max: Math.min(max, highLimit),
        });
      }
    }

    // Search x value not enclosed on allRanges
    let i = 0;
    while (i <= xMaxValue) {
      const enclosingRange = allRanges.find((r) => r.min <= i && r.max >= i);
      if (!enclosingRange) {
        console.log("\nSolution 2 found:");
        console.log(`x=${i} y=${j}`);
        return i * 4000000 + j;
      } else {
        i = enclosingRange.max + 1;
      }
    }
  }
  return -1;
}

module.exports = async function solution(res: Response) {
  parseFiles(__dirname, (testDataArray, dataArray) => {
    // Parse data
    const test_data = parseData(testDataArray);
    const data = parseData(dataArray);
    let testSol1, testSol2, sol1, sol2;

    // Compute solutions
    testSol1 = getSolution1(test_data, 10);
    testSol2 = getSolution2(test_data, 20);
    sol1 = getSolution1(data, 2000000);
    sol2 = getSolution2(data, 4000000);

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
