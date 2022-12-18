import fs from "fs/promises";
import { range } from "lodash";
import { join } from "path";
import { Grid } from "../grid";

type Direction = "<" | ">";

async function loadInput(name = "input"): Promise<Direction[]> {
  const data = await fs.readFile(join(__dirname, `${name}.txt`), {
    encoding: "utf-8",
  });

  return data.split("\n")[0].split("") as Direction[];
}

type Rock = boolean[][];

const ROCKS: Rock[] = [
  [[true, true, true, true]],
  [
    [false, true, false],
    [true, true, true],
    [false, true, false],
  ],
  [
    [true, true, true],
    [false, false, true],
    [false, false, true],
  ],
  [[true], [true], [true], [true]],
  [
    [true, true],
    [true, true],
  ],
];

const WIDTH = 7;

function printGrid(grid: Grid<string>): void {
  const yMin = grid.yMin;
  const yMax = grid.yMax;

  const rowIndices = range(0, WIDTH);

  for (let y = yMax; y >= yMin; y--) {
    const line = rowIndices.map((x) => grid.get(x, y, ".")).join("");
    console.log(line);
  }
}

function willHit(
  grid: Grid<unknown>,
  rock: Rock,
  x: number,
  y: number
): boolean {
  if (x < 0) {
    return true;
  } else if (x > WIDTH - rock[0].length) {
    return true;
  } else {
    for (let ty = 0; ty < rock.length; ty++) {
      for (let tx = 0; tx < rock[0].length; tx++) {
        if (rock[ty][tx] && grid.get(x + tx, y + ty) !== undefined) {
          return true;
        }
      }
    }
  }

  return false;
}

function solve(winds: Direction[], noRocks: number): number {
  let grid = new Grid<string>();
  for (let x = 0; x < WIDTH; x++) {
    grid.set(x, 0, "-");
  }

  let floor = 0;

  let windIdx = 0;
  for (let i = 0; i < noRocks; i++) {
    const rock = ROCKS[i % ROCKS.length];

    let [x, y] = [2, grid.yMax + 4];

    // eslint-disable-next-line no-constant-condition
    while (true) {
      // Blow wind
      const wind = winds[windIdx % winds.length];
      windIdx++;

      const dx = wind === "<" ? -1 : 1;
      if (!willHit(grid, rock, x + dx, y)) {
        x += dx;
      }

      const dy = -1;
      if (!willHit(grid, rock, x, y + dy)) {
        y += dy;
      } else {
        break;
      }
    }

    for (let ty = 0; ty < rock.length; ty++) {
      for (let tx = 0; tx < rock[0].length; tx++) {
        if (rock[ty][tx]) {
          grid.set(x + tx, y + ty, "#");
        }
      }
    }

    if (range(0, WIDTH).every((tx) => grid.get(tx, y) !== undefined)) {
      const yMax = grid.yMax;

      const newGrid = new Grid<string>();

      for (let ty = 0; ty <= yMax - y; ty++) {
        for (let tx = 0; tx < WIDTH; tx++) {
          const value = grid.get(tx, ty + y);
          if (value !== undefined) {
            newGrid.set(tx, ty, value);
          }
        }
      }

      grid = newGrid;
      floor += y;
      console.log("Resetting floor", floor);
    }
  }

  return floor + grid.yMax;
}

function part1(winds: Direction[]): number {
  return solve(winds, 2022);
}

function part2(winds: Direction[]): number {
  return solve(winds, 1000000000000);
}
async function main() {
  console.log(part1(await loadInput("test")));
  console.log(part1(await loadInput()));
  // console.log(part2(await loadInput("test")));
  // console.log(part2(await loadInput()));
}

main();
