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

const HOLE: Coordinate = { x: 500, y: 0 };

function createGrid(paths: Path[]): Grid {
  const xs = flatten(
    paths.map((path) => flatten(path.map((coord) => coord.x)))
  );
  const ys = flatten(
    paths.map((path) => flatten(path.map((coord) => coord.y)))
  );

  const maxY = max(ys);

  assert(maxY);

  const width = HOLE.x * 2;
  const height = maxY + 1;

  const grid = range(0, height).map((y) =>
    range(0, width).map((x) => {
      if (y === HOLE.y && x === HOLE.x) {
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
          grid[y][x] = "#";
        }
      } else if (from.y === to.y) {
        const y = from.y;
        const fromX = min([from.x, to.x]) as number;
        const toX = max([from.x, to.x]) as number;

        for (let x = fromX; x <= toX; x++) {
          grid[y][x] = "#";
        }
      } else {
        throw new Error("Diagonal path");
      }
    }
  }

  return grid;
}

function addFloor(grid: Grid): void {
  const width = grid[0].length;

  grid.push(range(0, width).map(() => "."));
  grid.push(range(0, width).map(() => "#"));
}

function dripSandUntilAbyss(grid: Grid): void {
  const hole = grid[0].indexOf("+");

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const sand: Coordinate = { x: hole, y: 0 };

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (sand.y + 1 >= grid.length) {
        return;
      } else if (grid[sand.y + 1][sand.x] === ".") {
        sand.y = sand.y + 1;
      } else if (sand.x - 1 < 0 || sand.x + 1 >= grid[0].length) {
        return;
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

function dripSandUntilPlugHole(grid: Grid): void {
  const hole = grid[0].indexOf("+");

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const sand: Coordinate = { x: hole, y: 0 };

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (grid[sand.y + 1][sand.x] === ".") {
        sand.y = sand.y + 1;
      } else if (sand.x - 1 >= 0 && grid[sand.y + 1][sand.x - 1] === ".") {
        sand.x = sand.x - 1;
        sand.y = sand.y + 1;
      } else if (
        sand.x + 1 < grid[0].length &&
        grid[sand.y + 1][sand.x + 1] === "."
      ) {
        sand.x = sand.x + 1;
        sand.y = sand.y + 1;
      } else {
        grid[sand.y][sand.x] = "o";
        if (sand.y === 0) {
          return;
        }

        break;
      }
    }
  }
}

function printGrid(grid: Grid): void {
  const relevantRows = grid.filter((row) => !row.every((r) => r === "#"));

  const minX = min(
    relevantRows.map((row) => {
      const nonSandIdx = row.findIndex((v) => v !== ".");
      return nonSandIdx === -1 ? row.length - 1 : nonSandIdx;
    })
  );
  const maxX = max(
    relevantRows.map((row) => {
      const nonSandIdx = [...row].reverse().findIndex((v) => v !== ".");
      if (nonSandIdx === -1) {
        return 0;
      } else {
        return row.length - nonSandIdx;
      }
    })
  );

  for (const row of grid) {
    console.log(row.slice(minX, maxX).join(""));
  }
}

function countSand(grid: Grid): number {
  return sumBy(grid, (row) => row.filter((c) => c === "o").length);
}

function part1(paths: Path[]): number {
  const grid = createGrid(paths);
  dripSandUntilAbyss(grid);

  printGrid(grid);

  return countSand(grid);
}

function part2(paths: Path[]): number {
  const grid = createGrid(paths);
  addFloor(grid);

  dripSandUntilPlugHole(grid);

  printGrid(grid);

  return countSand(grid);
}

async function main() {
  const paths = await loadInput();

  console.log(part1(paths));
  console.log(part2(paths));
}

main();
