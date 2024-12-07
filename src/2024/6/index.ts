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

async function part1(): Promise<number> {
  // eslint-disable-next-line prefer-const
  let { grid, guard } = await loadInput();

  const visisted = new Set<string>();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    visisted.add(`${guard.position[0]}:${guard.position[1]}`);

    let [r, c] = guard.position;
    switch (guard.direction) {
      case "^":
        r -= 1;
        break;
      case "<":
        c -= 1;
        break;
      case ">":
        c += 1;
        break;
      case "v":
        r += 1;
        break;
    }

    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) {
      // Left the area
      break;
    } else if (grid[r][c] === "#") {
      // Hit an obstacle
      let newDirection = guard.direction;
      switch (guard.direction) {
        case "^":
          newDirection = ">";
          break;
        case "<":
          newDirection = "^";
          break;
        case ">":
          newDirection = "v";
          break;
        case "v":
          newDirection = "<";
          break;
      }

      guard = {
        position: guard.position,
        direction: newDirection,
      };
    } else {
      // Just moved forward
      guard = {
        position: [r, c],
        direction: guard.direction,
      };
    }
  }

  return visisted.size;
}

async function part2(): Promise<number> {
  const input = await loadInput();

  return 0;
}

async function main() {
  console.log(await part1());
  // console.log(await part2());
}

main();
