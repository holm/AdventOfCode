import fs from "fs/promises";
import { join } from "path";
import { Grid } from "../grid";

type Direction = "<" | ">";

async function loadInput(name = "input"): Promise<Direction[]> {
  const data = await fs.readFile(join(__dirname, `${name}.txt`), {
    encoding: "utf-8",
  });

  return data.split("\n")[0].split("") as Direction[];
}

type Rock = boolean[][];

const ROCKS: Rock[] = [
  [[true, true, true, true]],
  [
    [false, true, false],
    [true, true, true],
    [false, true, false],
  ],
  [
    [true, true, true],
    [false, false, true],
    [false, false, true],
  ],
  [[true], [true], [true], [true]],
  [
    [true, true],
    [true, true],
  ],
];

const WIDTH = 7;

function willHit(
  grid: Grid<unknown>,
  rock: Rock,
  x: number,
  y: number
): boolean {
  if (x < 0) {
    return true;
  } else if (x > WIDTH - rock[0].length) {
    return true;
  } else {
    for (let ty = 0; ty < rock.length; ty++) {
      for (let tx = 0; tx < rock[0].length; tx++) {
        if (rock[ty][tx] && grid.get(x + tx, y + ty) !== undefined) {
          return true;
        }
      }
    }
  }

  return false;
}

function solve(winds: Direction[], noRocks: number): number {
  const grid = new Grid<string>();
  for (let x = 0; x < WIDTH; x++) {
    grid.set(x, 0, "-");
  }

  let yMax = 0;

  let ySkipped = 0;
  let firstResetWind = -1;
  let firstResetY = -1;
  let firstResetRock = -1;

  let windIdx = 0;
  for (let rockIdx = 0; rockIdx < noRocks; rockIdx++) {
    const rock = ROCKS[rockIdx % ROCKS.length];

    let x = 2;
    let y = yMax + 4;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const wind = winds[windIdx % winds.length];
      windIdx++;

      // Blow wind
      const dx = wind === "<" ? -1 : 1;
      if (!willHit(grid, rock, x + dx, y)) {
        x += dx;
      }

      // Move down
      const dy = -1;
      if (!willHit(grid, rock, x, y + dy)) {
        y += dy;
      } else {
        break;
      }
    }

    for (let ty = 0; ty < rock.length; ty++) {
      for (let tx = 0; tx < rock[0].length; tx++) {
        if (rock[ty][tx]) {
          grid.set(x + tx, y + ty, "#");
        }
      }
    }

    yMax = Math.max(yMax, y + rock.length - 1);

    if (firstResetWind === -1) {
      if (windIdx >= winds.length * ROCKS.length) {
        firstResetWind = windIdx;
        firstResetRock = rockIdx;
        firstResetY = yMax;
      }
    } else {
      if (
        windIdx % winds.length === firstResetWind % winds.length &&
        rockIdx % ROCKS.length === firstResetRock % ROCKS.length
      ) {
        const rockIncr = rockIdx - firstResetRock;
        const yIncr = yMax - firstResetY;

        const rocksLeft = noRocks - rockIdx;
        const cyclesLeft = Math.floor(rocksLeft / rockIncr);
        rockIdx += cyclesLeft * rockIncr;
        ySkipped += cyclesLeft * yIncr;
      }
    }
  }

  return ySkipped + grid.yMax;
}

function part1(winds: Direction[]): number {
  return solve(winds, 2022);
}

function part2(winds: Direction[]): number {
  return solve(winds, 1000000000000);
}
async function main() {
  console.log(part1(await loadInput("test")));
  console.log(part1(await loadInput()));
  console.log(part2(await loadInput("test")));
  console.log(part2(await loadInput()));
}

main();
