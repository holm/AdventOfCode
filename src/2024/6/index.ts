import fs from "fs/promises";
import { identity } from "lodash";
import assert from "node:assert";
import { join } from "path";

type Entry = "." | "#";
type Grid = Entry[][];
type Position = [number, number];
type Direction = "^" | "<" | ">" | "v";
type Guard = {
  position: Position;
  direction: Direction;
};
type Input = {
  grid: Grid;
  guard: Guard;
};

async function loadInput(): Promise<Input> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  const grid: Grid = [];
  let guard: Guard | undefined = undefined;

  for (const [r, line] of data.split("\n").filter(identity).entries()) {
    const row: Entry[] = [];
    for (const [c, char] of line.split("").entries()) {
      if (char !== "." && char !== "#") {
        guard = {
          position: [r, c],
          direction: char as Direction,
        };
        row.push(".");
      } else {
        row.push(char as Entry);
      }
    }
    grid.push(row);
  }

  assert(guard !== undefined);

  return { grid, guard };
}

function walk(grid: Grid, guard: Guard): Guard | null {
  let [r, c] = guard.position;
  let newDirection = guard.direction;
  switch (guard.direction) {
    case "^":
      r -= 1;
      newDirection = ">";
      break;
    case "<":
      c -= 1;
      newDirection = "^";
      break;
    case ">":
      c += 1;
      newDirection = "v";
      break;
    case "v":
      r += 1;
      newDirection = "<";
      break;
  }

  if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) {
    // Left the area
    return null;
  } else if (grid[r][c] === "#") {
    // Hit an obstacle
    return {
      position: guard.position,
      direction: newDirection,
    };
  } else {
    // Just moved forward
    return {
      position: [r, c],
      direction: guard.direction,
    };
  }
}

function isLooping(grid: Grid, guard: Guard): boolean {
  const visisted = new Set<string>();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const key = `${guard.position[0]}:${guard.position[1]}:${guard.direction}`;
    if (visisted.has(key)) {
      return true;
    }
    visisted.add(key);

    const newGuard = walk(grid, guard);
    if (newGuard === null) {
      return false;
    }
    guard = newGuard;
  }
}

async function part1(): Promise<number> {
  const { grid, guard: startGuard } = await loadInput();

  const visisted = new Set<string>();
  let guard = startGuard;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    visisted.add(`${guard.position[0]}:${guard.position[1]}`);

    const futureGuard = walk(grid, guard);
    if (futureGuard === null) {
      break;
    }
    guard = futureGuard;
  }

  return visisted.size;
}

async function part2(): Promise<number> {
  const { grid, guard: startGuard } = await loadInput();

  const loopingBlocks = new Set<string>();

  let guard = startGuard;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const futureGuard = walk(grid, guard);
    if (futureGuard === null) {
      break;
    }

    // Can't put a block just in front of where the guard started
    if (guard !== startGuard) {
      // Put block where the guard would have walked
      const gridWithBlock = grid.map((row) => [...row]);
      gridWithBlock[futureGuard.position[0]][futureGuard.position[1]] = "#";
      if (isLooping(gridWithBlock, startGuard)) {
        const key = `${futureGuard.position[0]}:${futureGuard.position[1]}`;
        loopingBlocks.add(key);
      }
    }

    guard = futureGuard;
  }

  return loopingBlocks.size;
}

async function main() {
  console.log(await part1());
  console.log(await part2());
}

main();
