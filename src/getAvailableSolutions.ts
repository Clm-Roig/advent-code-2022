import { readdirSync } from "fs";
import path from "path";
import statementNames from "./solutions/statementNames";

const solutionFolder = path.join(__dirname, "solutions");

type AvailableSolution = {
  dayNb: string;
  name: string;
};

const getAvailableSolutions = () => {
  let availableSolutions: AvailableSolution[] = [];
  readdirSync(solutionFolder).forEach((file) => {
    // Solution folders have always 1 or 2 characters
    if (file.length <= 2) {
      availableSolutions.push({
        dayNb: file,
        // @ts-ignore
        name: statementNames[file],
      });
    }
  });
  return availableSolutions.sort(
    (s1, s2) => Number(s1.dayNb) - Number(s2.dayNb)
  );
};

export default getAvailableSolutions;
