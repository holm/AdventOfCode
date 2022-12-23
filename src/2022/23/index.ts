import fs from "fs/promises";
import { identity } from "lodash";
import { join } from "path";
import { Grid } from "../grid";

type Coordinate = {
  x: number;
  y: number;
};

type Direction = {
  requirementOffsets: Coordinate[];
  moveOffset: Coordinate;
};

const directions: Direction[] = [
  // north
  {
    requirementOffsets: [
      { x: -1, y: -1 },
      { x: 0, y: -1 },
      { x: 1, y: -1 },
    ],
    moveOffset: { x: 0, y: -1 },
  },
  // south
  {
    requirementOffsets: [
      { x: -1, y: 1 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
    moveOffset: { x: 0, y: 1 },
  },
  // west
  {
    requirementOffsets: [
      { x: -1, y: -1 },
      { x: -1, y: 0 },
      { x: -1, y: 1 },
    ],
    moveOffset: { x: -1, y: 0 },
  },
  // east
  {
    requirementOffsets: [
      { x: 1, y: -1 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
    ],
    moveOffset: { x: 1, y: 0 },
  },
];

type Elf = {
  location: Coordinate;
  target: Coordinate | null;
};

async function loadInput(name = "input"): Promise<Elf[]> {
  const data = await fs.readFile(join(__dirname, `${name}.txt`), {
    encoding: "utf-8",
  });

  const elves: Elf[] = [];

  for (const [y, line] of data.split("\n").filter(identity).entries()) {
    for (const [x, sign] of line.split("").entries()) {
      if (sign === "#") {
        elves.push({
          location: {
            x,
            y,
          },
          target: null,
        });
      }
    }
  }

  return elves;
}

function move(
  elves: Elf[],
  maxRounds?: number
): { grid: Grid<boolean>; rounds: number } {
  let grid = new Grid<boolean>();
  for (const elf of elves) {
    grid.set(elf.location.x, elf.location.y, true);
  }

  let round = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const nextGrid = new Grid<number>();

    for (const elf of elves) {
      const validDirections: Direction[] = [];

      for (let dIdx = 0; dIdx < directions.length; dIdx++) {
        const direction = directions[(dIdx + round) % directions.length];

        const allFree = direction.requirementOffsets.every(
          (offset) =>
            grid.get(elf.location.x + offset.x, elf.location.y + offset.y) ===
            undefined
        );
        if (allFree) {
          validDirections.push(direction);
        }
      }

      if (
        validDirections.length < directions.length &&
        validDirections.length > 0
      ) {
        const direction = validDirections[0];

        elf.target = {
          x: elf.location.x + direction.moveOffset.x,
          y: elf.location.y + direction.moveOffset.y,
        };

        nextGrid.set(
          elf.target.x,
          elf.target.y,
          (nextGrid.get(elf.target.x, elf.target.y, 0) as number) + 1
        );
      }
    }

    grid = new Grid<boolean>();

    let moves = 0;
    for (const elf of elves) {
      if (elf.target !== null) {
        const count = nextGrid.get(elf.target.x, elf.target.y);
        if (count === 1) {
          elf.location = elf.target;
          moves += 1;
        }

        elf.target = null;
      }

      grid.set(elf.location.x, elf.location.y, true);
    }

    round += 1;

    if (moves === 0 || (maxRounds !== undefined && round === maxRounds)) {
      return { grid: grid, rounds: round };
    }
  }
}

function part1(elves: Elf[]): number {
  const { grid } = move(elves, 10);

  const xRange = grid.getXRange();
  const yRange = grid.getYRange();

  return (
    ((xRange.max as number) - (xRange.min as number) + 1) *
      ((yRange.max as number) - (yRange.min as number) + 1) -
    elves.length
  );
}

function part2(elves: Elf[]): number {
  const { rounds } = move(elves);

  return rounds;
}

async function main() {
  console.log(part1(await loadInput("test")));
  console.log(part1(await loadInput()));
  console.log(part2(await loadInput("test")));
  console.log(part2(await loadInput()));
}

main();
