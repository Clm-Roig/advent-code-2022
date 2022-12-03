import { createReadStream } from "fs";
import readline from "readline";
import path from "path";

export const parseFile = (
  useTestData: boolean,
  dirnameToImportFrom: string,
  callbackOnClose: (dataArray: string[]) => void
) => {
  const dataPath = path.join(dirnameToImportFrom, "input.txt");
  const testDataPath = path.join(dirnameToImportFrom, "test-input.txt");
  const filePath = useTestData ? testDataPath : dataPath;
  const file = readline.createInterface({
    input: createReadStream(filePath),
    output: process.stdout,
    terminal: false,
  });
  let dataArray: string[] = [];
  file.on("line", (line) => {
    dataArray.push(line);
  });

  // Process data
  file.on("close", () => callbackOnClose(dataArray));
};
