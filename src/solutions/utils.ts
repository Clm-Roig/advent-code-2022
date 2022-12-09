import { createReadStream } from "fs";
import readline from "readline";
import path from "path";

export const parseFile = (
  dirnameToImportFrom: string,
  fileName: string,
  callbackOnClose: (dataArray: string[]) => void
) => {
  const dataPath = path.join(dirnameToImportFrom, fileName);
  let dataArray: string[] = [];

  const file = readline.createInterface({
    input: createReadStream(dataPath),
    output: process.stdout,
    terminal: false,
  });
  file.on("line", (line) => {
    dataArray.push(line);
  });

  // Process data
  file.on("close", () => callbackOnClose(dataArray));
};

export const parseFiles = (
  dirnameToImportFrom: string,
  callbackOnClose: (testDataArray: string[], dataArray: string[]) => void
) => {
  let nbOfFilesRead = 0;
  const dataPath = path.join(dirnameToImportFrom, "input.txt");
  const testDataPath = path.join(dirnameToImportFrom, "test-input.txt");
  let dataArray: string[] = [];
  let testDataArray: string[] = [];

  // Test file
  const testFile = readline.createInterface({
    input: createReadStream(testDataPath),
    output: process.stdout,
    terminal: false,
  });
  testFile.on("line", (line) => {
    testDataArray.push(line);
  });

  // "Real" file
  const file = readline.createInterface({
    input: createReadStream(dataPath),
    output: process.stdout,
    terminal: false,
  });
  file.on("line", (line) => {
    dataArray.push(line);
  });

  const cb = () =>
    nbOfFilesRead === 1
      ? callbackOnClose(testDataArray, dataArray)
      : (nbOfFilesRead += 1);

  // Process data
  file.on("close", () => cb());
  testFile.on("close", () => cb());
};

export const getMin = (arr: number[]) => Math.min(...arr);
export const getMax = (arr: number[]) => Math.max(...arr);
