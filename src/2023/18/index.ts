import fs from "fs/promises";
import { identity } from "lodash";
import { join } from "path";
import { Grid } from "../grid";
import assert from "assert";

type Direction = "R" | "L" | "U" | "D";
type Dig = {
  direction: Direction;
  count: number;
  color: string;
};
type Coordinate = [number, number];
type GridContent = "#" | "." | "?";

const moves: Record<Direction, Coordinate> = {
  R: [1, 0],
  L: [-1, 0],
  U: [0, -1],
  D: [0, 1],
};

async function loadInput(): Promise<Dig[]> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  return data
    .split("\n")
    .filter(identity)
    .map((line) => {
      const parts = line.split(" ");

      const direction = parts[0] as Direction;
      const count = parseInt(parts[1]);
      const color = parts[2].substring(1, parts[2].length - 1);

      return {
        direction,
        count,
        color,
      } as Dig;
    });
}

function fillInterior(grid: Grid<GridContent>): number {
  const xRange = grid.getXRange();
  const yRange = grid.getYRange();
  assert(
    yRange.min !== undefined &&
      yRange.max !== undefined &&
      xRange.min !== undefined &&
      xRange.max !== undefined
  );

  for (let x = xRange.min; x <= xRange.max; x++) {
    for (let y = yRange.min; y <= yRange.max; y++) {
      const v = grid.get(x, y);
      if (v !== undefined) {
        continue;
      }

      const start: Coordinate = [x, y];

      const fillQueue: Coordinate[] = [start];
      const filled: Coordinate[] = [];
      let outside = false;
      while (fillQueue.length > 0) {
        const point = fillQueue.shift();
        assert(point);

        if (
          point[0] < xRange.min ||
          point[0] > xRange.max ||
          point[1] < yRange.min ||
          point[1] > yRange.max
        ) {
          outside = true;
          continue;
        }

        const v = grid.get(point[0], point[1]);
        if (v === undefined) {
          grid.set(point[0], point[1], "?");
          filled.push(point);

          for (const move of Object.values(moves)) {
            fillQueue.push([point[0] + move[0], point[1] + move[1]]);
          }
        }
      }

      for (const point of filled) {
        grid.set(point[0], point[1], outside ? "." : "#");
      }
    }
  }

  let digged = 0;
  for (let x = xRange.min; x <= xRange.max; x++) {
    for (let y = yRange.min; y <= yRange.max; y++) {
      if (grid.get(x, y) === "#") {
        digged += 1;
      }
    }
  }

  return digged;
}

async function part1() {
  const digs = await loadInput();

  const grid = new Grid<GridContent>();

  let location: Coordinate = [0, 0];

  for (const dig of digs) {
    const move = moves[dig.direction];

    for (let m = 1; m <= dig.count; m++) {
      location = [location[0] + move[0], location[1] + move[1]];

      grid.set(location[0], location[1], "#");
    }
  }

  const result = fillInterior(grid);
  console.log("part1", result);
}

async function part2() {
  const digs = await loadInput();

  const result = digs;
  console.log("part2", result);
}

async function main() {
  await part1();
  // await part2();
}

main();
