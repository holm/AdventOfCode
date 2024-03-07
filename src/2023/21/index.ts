import fs from "fs/promises";
import { identity, uniq } from "lodash";
import { join } from "path";
import { Grid } from "../grid";
import assert from "assert";

type Indicator = "#" | ".";
type Coordinate = { x: number; y: number };

type Input = {
  grid: Grid<Indicator>;
  start: Coordinate;
};

async function loadInput(): Promise<Input> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  const grid = new Grid<Indicator>();
  let start: Coordinate | undefined;

  const lines = data.split("\n").filter(identity);
  for (const [y, line] of lines.entries()) {
    for (const [x, i] of line.split("").entries()) {
      let indicator: Indicator;
      if (i === "S") {
        start = {
          x,
          y,
        };
        indicator = ".";
      } else {
        indicator = i as Indicator;
      }

      grid.set(x, y, indicator);
    }
  }

  assert(start !== undefined);

  return { grid, start };
}

const moves: Coordinate[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

function getDestinations(input: Input, steps: number): Coordinate[] {
  let destinations: Coordinate[] = [input.start];

  for (let i = 0; i < steps; i++) {
    const updatedDestinations: Coordinate[] = [];
    const targetGrid = new Grid<boolean>();

    for (const destination of destinations) {
      for (const move of moves) {
        const potentialDestination = {
          x: destination.x + move.x,
          y: destination.y + move.y,
        };

        if (
          input.grid.get(potentialDestination.x, potentialDestination.y) ===
            "." &&
          targetGrid.get(potentialDestination.x, potentialDestination.y) !==
            true
        ) {
          updatedDestinations.push(potentialDestination);
          targetGrid.set(potentialDestination.x, potentialDestination.y, true);
        }
      }
    }

    destinations = uniq(updatedDestinations);
  }

  return destinations;
}

async function part1() {
  const input = await loadInput();

  const destinations = getDestinations(input, 64);

  const result = destinations.length;
  console.log("part1", result);
}

async function part2() {
  const input = await loadInput();

  const result = input.toString();
  console.log("part2", result);
}

async function main() {
  await part1();
  // await part2();
}

main();
