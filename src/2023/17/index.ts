import fs from "fs/promises";
import { identity, minBy } from "lodash";
import { join } from "path";
import { Grid } from "../grid";
import assert from "assert";
import { PriorityQueue } from "@datastructures-js/priority-queue";

type Direction = "N" | "S" | "E" | "W";
type Coordinate = [number, number];

const offsets: Record<Direction, Coordinate> = {
  N: [0, -1],
  S: [0, 1],
  E: [1, 0],
  W: [-1, 0],
};

const turns: Record<Direction, Direction[]> = {
  N: ["E", "W"],
  S: ["E", "W"],
  E: ["S", "N"],
  W: ["S", "N"],
};

async function loadInput(): Promise<Grid<number>> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  const grid = new Grid<number>();

  data
    .split("\n")
    .filter(identity)
    .map((line, y) => {
      line.split("").map((value, x) => {
        grid.set(x, y, parseInt(value));
      });
    });

  return grid;
}

type LocationDirection = {
  location: Coordinate;
  directions: Direction[];
  heatLoss: number;
};

type LocationStatus = {
  directions: Direction[];
  heatLoss: number;
};

function computeHash(location: Coordinate, direction: Direction): string {
  return [location[0], location[1], direction].join(";");
}

function findPath(map: Grid<number>, minStep = 1, maxStep = 3): number {
  const xRange = map.getXRange();
  const yRange = map.getYRange();
  assert(
    xRange.min !== undefined &&
      xRange.max !== undefined &&
      yRange.min !== undefined &&
      yRange.max !== undefined
  );
  const start: Coordinate = [xRange.min, yRange.min];
  const end: Coordinate = [xRange.max, yRange.max];

  const queue = new PriorityQueue<LocationDirection>((a, b) => {
    return a.heatLoss - b.heatLoss;
  });

  function addMoves(
    location: Coordinate,
    directions: Direction[],
    nextDirection: Direction,
    heatLoss: number
  ): void {
    const move = offsets[nextDirection];
    let newLocation = location;
    let newHeatLoss = heatLoss;
    let newDirections = directions;

    for (let step = 1; step <= maxStep; step++) {
      newLocation = [newLocation[0] + move[0], newLocation[1] + move[1]];

      const stepHeatLoss = map.get(newLocation[0], newLocation[1]);
      if (stepHeatLoss === undefined) {
        // Stepped outside grid
        return;
      }
      newHeatLoss += stepHeatLoss;
      newDirections = [...newDirections, nextDirection];

      if (step >= minStep) {
        queue.push({
          location: newLocation,
          directions: newDirections,
          heatLoss: newHeatLoss,
        });
      }
    }
  }

  addMoves(start, [], "E", 0);
  addMoves(start, [], "S", 0);

  const status = new Map<string, LocationStatus>();

  while (!queue.isEmpty()) {
    const { location, directions, heatLoss } = queue.pop();
    const lastDirection = directions[directions.length - 1];

    const hash = computeHash(location, lastDirection);

    if (status.has(hash)) {
      // Already visited
      continue;
    }

    status.set(hash, {
      heatLoss,
      directions,
    });

    const nextDirections = turns[lastDirection];
    for (const nextDirection of nextDirections) {
      addMoves(location, directions, nextDirection, heatLoss);
    }
  }

  const options = [
    status.get(computeHash(end, "S")),
    status.get(computeHash(end, "E")),
  ];

  const endStatus = minBy(options, (status) => status?.heatLoss);
  assert(endStatus);

  return endStatus.heatLoss;
}
async function part1() {
  const map = await loadInput();

  const result = findPath(map, 1, 3);
  console.log("part1", result);
}

async function part2() {
  const map = await loadInput();

  const result = findPath(map, 4, 10);
  console.log("part2", result);
}

async function main() {
  await part1();
  await part2();
}

main();
