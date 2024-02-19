import fs from "fs/promises";
import { identity, sumBy } from "lodash";
import { join } from "path";
import { Grid } from "../grid";
import assert from "assert";

type Indicator = "O" | "." | "#";

async function loadInput(): Promise<Grid<Indicator>> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  const grid = new Grid<Indicator>();

  data
    .split("\n")
    .filter(identity)
    .map((line, y) => {
      line.split("").map((i, x) => {
        grid.set(x, y, i as Indicator);
      });
    });

  return grid;
}

function roll(grid: Grid<Indicator>, direction: [number, number]): void {
  const xArray = grid.getXRange().asArray();
  const yArray = grid.getXRange().asArray();
  assert(xArray && yArray);

  let movement = true;
  while (movement) {
    movement = false;

    for (const y of yArray) {
      for (const x of xArray) {
        const i = grid.get(x, y);
        if (i === "O") {
          const [xNew, yNew] = [x + direction[0], y + direction[1]];

          const t = grid.get(xNew, yNew);
          if (t === ".") {
            grid.set(xNew, yNew, "O");
            grid.set(x, y, ".");
            movement = true;
          }
        }
      }
    }
  }
}

function calculateLoad(grid: Grid<Indicator>): number {
  const xArray = grid.getXRange().asArray();
  const yArray = grid.getXRange().asArray();
  assert(xArray && yArray);

  return sumBy(yArray, (y) => {
    return sumBy(xArray, (x) => {
      const i = grid.get(x, y);
      if (i === "O") {
        return yArray.length - y;
      } else {
        return 0;
      }
    });
  });
}

async function part1() {
  const grid = await loadInput();

  roll(grid, [0, -1]);

  const result = calculateLoad(grid);
  console.log("part1", result);
}

async function part2() {
  const grid = await loadInput();

  console.log(grid.toString());
  roll(grid, [0, -1]);
  console.log(grid.toString());

  const result = grid.toString();
  console.log("part2", result);
}

async function main() {
  await part1();
  // await part2();
}

main();
