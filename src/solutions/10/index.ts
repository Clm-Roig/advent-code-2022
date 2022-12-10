import { Response } from "express";
import { basename } from "path";
import getAvailableSolutions from "../../getAvailableSolutions";
import { isInRange, parseFiles } from "../utils";

let errorMessage: string;

type CycleValue = {
  cycle: number;
  value: number;
};

class CPU {
  cycleCounter: number = 1;
  value: number = 1;
  interestingValues: CycleValue[] = [];
  output: string[] = [];
  initialCycle = 20;
  cycle = 40;

  addValue(newValue: number) {
    this.value += newValue;
  }

  incrementCounter() {
    // Part 1 computation
    if (
      (this.cycleCounter + this.initialCycle) % this.cycle === 0 ||
      this.cycleCounter === this.initialCycle
    ) {
      this.interestingValues.push({
        cycle: this.cycleCounter,
        value: this.value,
      });
    }

    // Part 2 computation
    if (
      isInRange(
        ((this.cycleCounter - 1) % this.cycle) - 1,
        this.value,
        ((this.cycleCounter - 1) % this.cycle) + 1
      )
    ) {
      this.output.push("█");
    } else {
      this.output.push(" ");
    }

    this.cycleCounter += 1;
  }

  // Part 2 result
  drawOutput(): void {
    let currentLine = "";
    for (let i = 0; i < this.output.length; i++) {
      if (i % this.cycle === 0) {
        console.log(currentLine);
        currentLine = "";
      }
      const char = this.output[i];
      currentLine += char;
    }
    console.log(currentLine);
  }

  // Part 1 result
  getTotal() {
    return this.interestingValues.reduce((total, cv) => {
      const { cycle, value } = cv;
      return total + value * cycle;
    }, 0);
  }
}

const parseData = (dataArray: string[]) =>
  dataArray.map((line) => line.split(" "));

function runCPU(data: string[][], cpu: CPU) {
  for (const [instruction, addedValue] of data) {
    if (instruction === "noop") {
      cpu.incrementCounter();
    } else if (instruction === "addx") {
      cpu.incrementCounter();
      cpu.incrementCounter();
      cpu.addValue(Number(addedValue));
    }
  }
}

// Part 1 algo
function getSolution1(data: string[][]): number {
  const cpu = new CPU();
  runCPU(data, cpu);
  return cpu.getTotal();
}

// Part 2 algo
function getSolution2(data: string[][]): void {
  const cpu = new CPU();
  runCPU(data, cpu);
  cpu.drawOutput();
}

module.exports = async function solution(res: Response) {
  parseFiles(__dirname, (testDataArray, dataArray) => {
    // Parse data
    const data = parseData(dataArray);
    const test_data = parseData(testDataArray);

    // Compute solutions
    const sol1 = getSolution1(data);
    getSolution2(data);
    const sol2 = "Solution found but nothing to display (ascii art)";
    const testSol1 = getSolution1(test_data);
    getSolution2(test_data);
    const testSol2 = "Solution found but nothing to display (ascii art)";

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
