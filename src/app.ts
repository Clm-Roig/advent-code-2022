import { Request, Response } from "express";
import { readdirSync } from "fs";
import path from "path";
import express from "express";

const solutionFolder = path.join(__dirname, "solutions");

const app = express();
const port = process.env.PORT || 3000;
app.set("views", "./views");
app.set("view engine", "ejs");

app.get("/", (req: Request, res: Response) => {
  let availableSolutions: string[] = [];
  readdirSync(solutionFolder).forEach((file) => {
    availableSolutions.push(file);
  });
  res.render("home", {
    subject: "C. Roig - Advent of Code 2022",
    availableSolutions,
  });
});

app.get("/days/:id", async (req: Request, res: Response) => {
  const dayNb = req.params.id;
  const useTestData = req.query.useTestData !== undefined;
  const solution = require("./solutions/" + dayNb);
  if (solution) {
    await solution(res, !!useTestData);
  } else {
    res.send("Solution not available (yet)!");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
