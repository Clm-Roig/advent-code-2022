import { Request, Response } from "express";
import path from "path";
import express from "express";
import getAvailableSolutions from "./getAvailableSolutions";

const solutionFolder = path.join(__dirname, "solutions");

const app = express();
const port = process.env.PORT || 3000;
app.set("views", "./views");
app.set("view engine", "ejs");

app.get("/", (req: Request, res: Response) => {
  res.render("home", {
    dayNb: 0,
    subject: "C. ROIG - Advent of Code 2022",
    availableSolutions: getAvailableSolutions(),
  });
});

app.get("/days/:id", async (req: Request, res: Response) => {
  const dayNb = req.params.id;
  const solution = require("./solutions/" + dayNb);
  if (solution) {
    await solution(res);
  } else {
    res.send("Solution not available (yet)!");
  }
});

app.get("*", function (req, res) {
  res.status(404);
  res.render("404");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
