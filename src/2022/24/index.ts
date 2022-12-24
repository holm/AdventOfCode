import fs from "fs/promises";
import { identity } from "lodash";
import { join } from "path";
import { Grid } from "../grid";

type Direction = "^" | ">" | "v" | "<";
type Coordinate = { x: number; y: number };
type Wind = {
  start: Coordinate;
  direction: Direction;
};
type WindCalculator = (time: number) => number;
type WindCalculated = Wind & {
  calculator: WindCalculator;
};
type WindMap = Map<number, WindCalculated[]>;
type Input = {
  grid: Grid<boolean>;
  xWinds: WindMap;
  yWinds: WindMap;
};

const directionOffsets: Record<Direction, Coordinate> = {
  "^": { x: 0, y: -1 },
  ">": { x: 1, y: 0 },
  v: { x: 0, y: 1 },
  "<": { x: -1, y: 0 },
};
const moves: Coordinate[] = [
  ...Object.values(directionOffsets),
  { x: 0, y: 0 }, // Stay at same place
];

async function loadInput(name = "input"): Promise<Input> {
  const data = await fs.readFile(join(__dirname, `${name}.txt`), {
    encoding: "utf-8",
  });

  const grid = new Grid<boolean>();
  const winds: Wind[] = [];

  for (const [y, line] of data.split("\n").filter(identity).entries()) {
    for (const [x, sign] of line.split("").entries()) {
      if (sign === "#") {
        grid.set(x, y, true);
      } else if (sign !== ".") {
        winds.push({
          start: { x, y },
          direction: sign as Direction,
        });
      }
    }
  }

  const xRange = grid.getXRange();
  const xLength = (xRange.max as number) - (xRange.min as number) - 1;
  const yRange = grid.getYRange();
  const yLength = (yRange.max as number) - (yRange.min as number) - 1;

  const xWinds: WindMap = new Map();
  for (let x = (xRange.min as number) + 1; x < (xRange.max as number); x++) {
    xWinds.set(x, [] as WindCalculated[]);
  }

  const yWinds: WindMap = new Map();
  for (let y = yRange.min as number; y <= (yRange.max as number); y++) {
    yWinds.set(y, [] as WindCalculated[]);
  }

  for (const wind of winds) {
    if (wind.direction === ">" || wind.direction === "<") {
      const calculator = (time: number) => {
        const newX =
          wind.direction === "<" ? wind.start.x - time : wind.start.x + time;

        return ((((newX - 1) % xLength) + xLength) % xLength) + 1;
      };
      yWinds.get(wind.start.y)?.push({
        ...wind,
        calculator,
      });
    } else {
      const calculator = (time: number) => {
        const newY =
          wind.direction === "^" ? wind.start.y - time : wind.start.y + time;

        return ((((newY - 1) % yLength) + yLength) % yLength) + 1;
      };
      xWinds.get(wind.start.x)?.push({
        ...wind,
        calculator,
      });
    }
  }

  return { grid, xWinds, yWinds };
}

type Solution = number | null;

function solve(
  grid: Grid<boolean>,
  xWinds: WindMap,
  yWinds: WindMap,
  position: Coordinate,
  target: Coordinate,
  time: number,
  maxTime: number,
  cache: Map<string, Solution> = new Map()
): Solution {
  const minDistance =
    Math.abs(position.x - target.x) + Math.abs(position.y - target.y);
  if (minDistance === 0) {
    // Arrived
    return time;
  } else if (minDistance > maxTime - time) {
    // Too far
    return null;
  }

  const cacheKey = `${time}:${position.x}:${position.y}`;
  const cachedValue = cache.get(cacheKey);
  if (cachedValue !== undefined) {
    return cachedValue;
  }

  let bestSolution: Solution = null;
  const yRange = grid.getYRange();

  for (const move of moves) {
    const newPosition = { x: position.x + move.x, y: position.y + move.y };

    // Check wall
    if (
      grid.get(newPosition.x, newPosition.y) === true ||
      newPosition.y < (yRange.min as number) ||
      newPosition.y > (yRange.max as number)
    ) {
      continue;
    }

    // Check x-axis winds
    const blockedXWinds = (xWinds.get(newPosition.x) as WindCalculated[]).some(
      (wind) => wind.calculator(time) === newPosition.y
    );
    if (blockedXWinds) {
      continue;
    }

    // Check y-axis winds
    const blockedYWinds = (yWinds.get(newPosition.y) as WindCalculated[]).some(
      (wind) => wind.calculator(time) === newPosition.x
    );
    if (blockedYWinds) {
      continue;
    }

    const solutionValue = solve(
      grid,
      xWinds,
      yWinds,
      newPosition,
      target,
      time + 1,
      maxTime,
      cache
    );
    if (
      solutionValue !== null &&
      (bestSolution === null || solutionValue < bestSolution)
    ) {
      bestSolution = solutionValue;
    }
  }

  cache.set(cacheKey, bestSolution);

  return bestSolution;
}

function findHole(grid: Grid<boolean>, y: number): Coordinate {
  const xRange = grid.getXRange(y);

  for (let x = xRange.min as number; x <= (xRange.max as number); x++) {
    if (grid.get(x, y) !== true) {
      return { x, y };
    }
  }

  throw new Error("Cannot find hole");
}

function solveIteratively(
  grid: Grid<boolean>,
  xWinds: WindMap,
  yWinds: WindMap,
  start: Coordinate,
  end: Coordinate,
  startTime: number
): number {
  let maxTime =
    startTime + Math.abs(start.x - end.x) + Math.abs(start.y - end.y);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const timeUsed = solve(
      grid,
      xWinds,
      yWinds,
      start,
      end,
      startTime,
      maxTime
    );
    if (timeUsed !== null) {
      return timeUsed - 1; // Final move is "free"
    }

    maxTime += Math.floor(maxTime * 1.1); // Increase time bound by 10%
  }
}

function part1({ grid, xWinds, yWinds }: Input): number {
  const entry = findHole(grid, 0);
  const exit = findHole(grid, grid.getYRange().max as number);

  return solveIteratively(grid, xWinds, yWinds, entry, exit, 0);
}

function part2({ grid, xWinds, yWinds }: Input): number {
  const entry = findHole(grid, 0);
  const exit = findHole(grid, grid.getYRange().max as number);

  const time1 = solveIteratively(grid, xWinds, yWinds, entry, exit, 0);
  const time2 = solveIteratively(grid, xWinds, yWinds, exit, entry, time1 + 1);
  const time3 = solveIteratively(grid, xWinds, yWinds, entry, exit, time2 + 1);

  return time3;
}

async function main() {
  console.log(part1(await loadInput("test")));
  console.log(part1(await loadInput()));
  console.log(part2(await loadInput("test")));
  console.log(part2(await loadInput()));
}

main();
