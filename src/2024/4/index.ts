import fs from "fs/promises";
import { identity } from "lodash";
import { join } from "path";

async function loadInput(): Promise<string[][]> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  return data
    .split("\n")
    .filter(identity)
    .map((line) => line.split(""));
}

type Pair = [number, number];

const part1Target = "XMAS";

const part1Directions: Pair[] = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

function part1Search(
  grid: string[][],
  pos: Pair,
  direction: Pair,
  offset: number
): boolean {
  if (
    pos[0] < 0 ||
    pos[0] >= grid.length ||
    pos[1] < 0 ||
    pos[1] >= grid[0].length
  ) {
    return false;
  }

  const char = grid[pos[0]][pos[1]];
  if (char !== part1Target[offset]) {
    return false;
  }

  if (offset === part1Target.length - 1) {
    return true;
  }

  return part1Search(
    grid,
    [pos[0] + direction[0], pos[1] + direction[1]],
    direction,
    offset + 1
  );
}

async function part1(): Promise<number> {
  const grid = await loadInput();

  let matches = 0;

  for (const [r, row] of grid.entries()) {
    for (let c = 0; c < row.length; c++) {
      const pos: Pair = [r, c];
      for (const direction of part1Directions) {
        if (part1Search(grid, pos, direction, 0)) {
          matches++;
        }
      }
    }
  }

  return matches;
}

const part2Offsets: [Pair, Pair][] = [
  [
    [1, 1],
    [-1, -1],
  ],
  [
    [1, -1],
    [-1, 1],
  ],
];

function matchesPart2(grid: string[][], pos: Pair): boolean {
  if (
    pos[0] < 1 ||
    pos[0] >= grid.length - 1 ||
    pos[1] < 1 ||
    pos[1] >= grid[0].length - 1
  ) {
    return false;
  }

  if (grid[pos[0]][pos[1]] !== "A") {
    return false;
  }

  for (const [offset1, offset2] of part2Offsets) {
    const chars =
      grid[pos[0] + offset1[0]][pos[1] + offset1[1]] +
      grid[pos[0] + offset2[0]][pos[1] + offset2[1]];
    if (chars !== "MS" && chars !== "SM") {
      return false;
    }
  }

  return true;
}

async function part2(): Promise<number> {
  const grid = await loadInput();

  let matches = 0;

  for (const [r, row] of grid.entries()) {
    for (let c = 0; c < row.length; c++) {
      if (matchesPart2(grid, [r, c])) {
        matches++;
      }
    }
  }

  return matches;
}

async function main() {
  console.log(await part1());
  console.log(await part2());
}

main();
