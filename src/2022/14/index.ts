import assert from "assert";
import fs from "fs/promises";
import { flatten, max, min, range, sumBy } from "lodash";
import { join } from "path";

type Coordinate = { x: number; y: number };

type Path = Coordinate[];

type Material = "." | "#" | "o" | "+";

type Grid = Material[][];

async function loadInput(): Promise<Path[]> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  return data.split("\n").map((line) => {
    return line.split(" -> ").map((coordRaw) => {
      const numbers = coordRaw.split(",");

      return {
        x: parseInt(numbers[0]),
        y: parseInt(numbers[1]),
      };
    });
  });
}

function createGrid(paths: Path[]): Grid {
  const xs = flatten(
    paths.map((path) => flatten(path.map((coord) => coord.x)))
  );
  const ys = flatten(
    paths.map((path) => flatten(path.map((coord) => coord.y)))
  );

  const minX = min(xs);
  const maxX = max(xs);
  const maxY = max(ys);

  assert(minX && maxX && maxY);

  const width = maxX - minX + 1;
  const height = maxY + 1;

  const holeX = 500 - minX;

  const grid = range(0, height).map((y) =>
    range(0, width).map((x) => {
      if (y === 0 && x === holeX) {
        return "+" as Material;
      } else {
        return "." as Material;
      }
    })
  );

  for (const path of paths) {
    for (let c = 1; c < path.length; c++) {
      const from = path[c - 1];
      const to = path[c];

      if (from.x === to.x) {
        const x = from.x;
        const fromY = min([from.y, to.y]) as number;
        const toY = max([from.y, to.y]) as number;

        for (let y = fromY; y <= toY; y++) {
          grid[y][x - minX] = "#";
        }
      } else if (from.y === to.y) {
        const y = from.y;
        const fromX = min([from.x, to.x]) as number;
        const toX = max([from.x, to.x]) as number;

        for (let x = fromX; x <= toX; x++) {
          grid[y][x - minX] = "#";
        }
      } else {
        throw new Error("Diagonal path");
      }
    }
  }

  return grid;
}

function dripSand(grid: Grid): void {
  const hole = grid[0].indexOf("+");

  let abyss = false;

  while (!abyss) {
    const sand: Coordinate = { x: hole, y: 0 };

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (sand.y + 1 >= grid.length) {
        abyss = true;
        break;
      } else if (grid[sand.y + 1][sand.x] === ".") {
        sand.y = sand.y + 1;
      } else if (sand.x - 1 < 0 || sand.x + 1 >= grid[0].length) {
        abyss = true;
        break;
      } else if (grid[sand.y + 1][sand.x - 1] === ".") {
        sand.x = sand.x - 1;
        sand.y = sand.y + 1;
      } else if (grid[sand.y + 1][sand.x + 1] === ".") {
        sand.x = sand.x + 1;
        sand.y = sand.y + 1;
      } else {
        grid[sand.y][sand.x] = "o";
        break;
      }
    }
  }
}

function part1(grid: Grid): number {
  dripSand(grid);

  printGrid(grid);

  return sumBy(grid, (row) => row.filter((c) => c === "o").length);
}

function printGrid(grid: Grid): void {
  for (const row of grid) {
    console.log(row.join(""));
  }
}

function part2(grid: Grid): number {
  return 0;
}

async function main() {
  const paths = await loadInput();

  const grid = createGrid(paths);

  console.log(part1(grid));
  console.log(part2(grid));
}

main();
