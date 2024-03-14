import fs from "fs/promises";
import { identity, max } from "lodash";
import { join } from "path";
import { Grid } from "../grid";
import assert from "assert";

type Indicator = "#" | "." | "<" | ">" | "^" | "v";

const LEFT = {
  x: -1,
  y: 0,
};
const RIGHT = {
  x: 1,
  y: 0,
};
const UP = {
  x: 0,
  y: -1,
};
const DOWN = {
  x: 0,
  y: 1,
};

const moves = [LEFT, RIGHT, UP, DOWN];

const forcedMoves: Partial<Record<Indicator, Coordinate>> = {
  "<": LEFT,
  ">": RIGHT,
  "^": UP,
  v: DOWN,
};

async function loadInput(): Promise<Grid<Indicator>> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  const grid = new Grid<Indicator>();

  const lines = data.split("\n").filter(identity);
  for (const [y, line] of lines.entries()) {
    for (const [x, c] of [...line].entries()) {
      grid.set(x, y, c as Indicator);
    }
  }

  return grid;
}

type Coordinate = {
  x: number;
  y: number;
};

function findStart(grid: Grid<Indicator>): Coordinate {
  const yRange = grid.getYRange();
  const y = yRange.min;
  assert(y !== undefined);

  const firstRow = grid.getXRange(y);
  const x = firstRow.asArray()?.find((x) => grid.get(x, y) === ".");
  assert(x !== undefined);

  return { x, y };
}

type Candidate = {
  position: Coordinate;
  visited: Set<string>;
  distance: number;
};

function findLongestPath(grid: Grid<Indicator>): number {
  const start = findStart(grid);
  const endY = grid.getYRange().max;

  const stack: Candidate[] = [
    {
      position: start,
      visited: new Set<string>(),
      distance: 0,
    },
  ];

  const solutions: number[] = [];

  while (stack.length > 0) {
    const candidate = stack.shift();
    assert(candidate !== undefined);
    const { position, visited, distance } = candidate;

    const positionStr = `${position.x},${position.y}`;
    if (visited.has(positionStr)) {
      // Already visited
      continue;
    }

    if (endY === position.y) {
      // Reached end
      solutions.push(distance);
      continue;
    }

    const i = grid.get(position.x, position.y);
    if (i === "#" || i === undefined) {
      // Cannot move to forrest or outside the grid
      continue;
    }

    let possibleMoves: Coordinate[];

    const forced = forcedMoves[i];
    if (forced !== undefined) {
      possibleMoves = [forced];
    } else {
      possibleMoves = moves;
    }

    const newVisisted = new Set([...visited, positionStr]);

    for (const move of possibleMoves) {
      const newPosition = {
        x: position.x + move.x,
        y: position.y + move.y,
      };

      stack.push({
        position: newPosition,
        visited: newVisisted,
        distance: distance + 1,
      });
    }
  }

  assert(solutions.length > 0);

  return max(solutions) as number;
}

async function part1() {
  const grid = await loadInput();

  const result = findLongestPath(grid);

  console.log("part1", result);
}

async function part2() {
  const input = await loadInput();

  const result = input;
  console.log("part2", result);
}

async function main() {
  await part1();
  // await part2();
}

main();
