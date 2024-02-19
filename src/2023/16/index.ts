import fs from "fs/promises";
import { identity, max } from "lodash";
import { join } from "path";
import { Grid } from "../grid";
import assert from "assert";

type Indicator = "/" | "\\" | "." | "-" | "|";
type Direction = "N" | "S" | "E" | "W";
type Coordinate = [number, number];

const offsets: Record<Direction, Coordinate> = {
  N: [0, -1],
  S: [0, 1],
  E: [1, 0],
  W: [-1, 0],
};

const interactions: Record<Indicator, Record<Direction, Direction[]>> = {
  "/": {
    N: ["E"],
    S: ["W"],
    E: ["N"],
    W: ["S"],
  },
  "\\": {
    N: ["W"],
    S: ["E"],
    E: ["S"],
    W: ["N"],
  },
  "-": {
    N: ["E", "W"],
    S: ["E", "W"],
    E: ["E"],
    W: ["W"],
  },
  "|": {
    N: ["N"],
    S: ["S"],
    E: ["N", "S"],
    W: ["N", "S"],
  },
  ".": {
    N: ["N"],
    S: ["S"],
    E: ["E"],
    W: ["W"],
  },
};

async function loadInput(): Promise<Grid<Indicator>> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  const grid = new Grid<Indicator>();

  data
    .split("\n")
    .filter(identity)
    .map((line, y) => {
      line.split("").map((i, x) => {
        grid.set(x, y, i as Indicator);
      });
    });

  return grid;
}

type LocationDirection = {
  location: Coordinate;
  direction: Direction;
};

function energise(layout: Grid<Indicator>, start: LocationDirection): number {
  const energyGrid = new Grid<Direction[]>();
  const queue: LocationDirection[] = [start];
  let energised = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const entry = queue.shift();
    if (entry === undefined) {
      return energised;
    }
    const { location, direction } = entry;

    const move = offsets[direction];
    const newLocation: Coordinate = [
      location[0] + move[0],
      location[1] + move[1],
    ];

    const node = layout.get(newLocation[0], newLocation[1]);
    if (node === undefined) {
      // Outside the grid
      continue;
    }

    let energyDirections = energyGrid.get(newLocation[0], newLocation[1]);
    if (energyDirections !== undefined) {
      if (energyDirections.includes(direction)) {
        // Already energised
        continue;
      }
      energyDirections.push(direction);
    } else {
      energyDirections = [direction];
      energyGrid.set(newLocation[0], newLocation[1], energyDirections);
      energised += 1;
    }

    const newDirections = interactions[node][direction];
    for (const newDirection of newDirections) {
      queue.push({
        location: newLocation,
        direction: newDirection,
      });
    }
  }
}

async function part1() {
  const layout = await loadInput();

  const result = energise(layout, {
    location: [-1, 0],
    direction: "E",
  });
  console.log("part1", result);
}

async function part2() {
  const layout = await loadInput();

  const starts: LocationDirection[] = [];

  const xRange = layout.getXRange().asArray();
  const yRange = layout.getYRange().asArray();
  assert(xRange && yRange);

  for (const x of xRange) {
    starts.push({ location: [x, -1], direction: "S" });
    starts.push({
      location: [x, yRange[yRange.length - 1] + 1],
      direction: "N",
    });
  }

  for (const y of yRange) {
    starts.push({ location: [-1, y], direction: "E" });
    starts.push({
      location: [xRange[xRange.length - 1] + 1, y],
      direction: "W",
    });
  }

  const result = max(starts.map((start) => energise(layout, start)));
  console.log("part2", result);
}

async function main() {
  await part1();
  await part2();
}

main();
