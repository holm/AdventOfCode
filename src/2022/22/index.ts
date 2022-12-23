import fs from "fs/promises";
import { join } from "path";
import { Grid } from "../grid";

type MapEntry = "." | "#";
type Movement = number | "L" | "R";
type Input = {
  grid: Grid<MapEntry>;
  movements: Movement[];
};
type Direction = "<" | ">" | "^" | "v";
type DirectionData = {
  L: Direction;
  R: Direction;
  score: number;
};

const DIRECTIONS: Record<Direction, DirectionData> = {
  "<": {
    L: "v",
    R: "^",
    score: 2,
  },
  "^": {
    L: "<",
    R: ">",
    score: 3,
  },
  ">": {
    L: "^",
    R: "v",
    score: 0,
  },
  v: {
    L: ">",
    R: "<",
    score: 1,
  },
};

async function loadInput(name = "input"): Promise<Input> {
  const data = await fs.readFile(join(__dirname, `${name}.txt`), {
    encoding: "utf-8",
  });

  const [mapRaw, movementsRaw] = data.split("\n\n");

  const grid = new Grid<MapEntry>();

  mapRaw.split("\n").map((line, y) => {
    line.split("").map((entry, x) => {
      if (entry !== " ") {
        grid.set(x, y, entry as MapEntry);
      }
    });
  });

  const movements = movementsRaw.split(/(R|L)/).map((movementRaw) => {
    if (movementRaw === "R" || movementRaw === "L") {
      return movementRaw;
    } else {
      return parseInt(movementRaw);
    }
  });

  return {
    grid,
    movements,
  };
}

function part1(input: Input): number {
  const yRangeStart = input.grid.getYRange();
  const xRangeStart = input.grid.getXRange(yRangeStart.min);

  // Start
  let x = xRangeStart.min as number;
  let y = yRangeStart.min as number;
  let direction: Direction = ">";

  for (const movement of input.movements) {
    if (movement === "R") {
      direction = DIRECTIONS[direction].R;
    } else if (movement === "L") {
      direction = DIRECTIONS[direction].L;
    } else {
      for (let m = 0; m < movement; m++) {
        let nextX = x;
        let nextY = y;

        if (direction === "<") {
          nextX -= 1;

          const xRange = input.grid.getXRange(nextY);
          if ((xRange.min as number) > nextX) {
            nextX = xRange.max as number;
          }
        } else if (direction === ">") {
          nextX += 1;

          const xRange = input.grid.getXRange(nextY);
          if ((xRange.max as number) < nextX) {
            nextX = xRange.min as number;
          }
        } else if (direction === "^") {
          nextY -= 1;

          const yRange = input.grid.getYRange(nextX);
          if ((yRange.min as number) > nextY) {
            nextY = yRange.max as number;
          }
        } else if (direction === "v") {
          nextY += 1;

          const yRange = input.grid.getYRange(nextX);
          if ((yRange.max as number) < nextY) {
            nextY = yRange.min as number;
          }
        }

        if (input.grid.get(nextX, nextY) === ".") {
          x = nextX;
          y = nextY;
        }
      }
    }
  }

  return 1000 * (y + 1) + 4 * (x + 1) + DIRECTIONS[direction].score;
}

function part2(input: Input): number {
  return 0;
}

async function main() {
  console.log(part1(await loadInput("test")));
  console.log(part1(await loadInput()));
  // console.log(part2(await loadInput("test")));
  // console.log(part2(await loadInput()));
}

main();
