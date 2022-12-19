import fs from "fs/promises";
import { identity, max, min } from "lodash";
import { join } from "path";
import { Grid3D } from "../grid";

type Coordinate = [number, number, number];

async function loadInput(name = "input"): Promise<Coordinate[]> {
  const data = await fs.readFile(join(__dirname, `${name}.txt`), {
    encoding: "utf-8",
  });

  return data
    .split("\n")
    .filter(identity)
    .map((line) => {
      const coords = line.split(",");

      return coords.map((coord) => parseInt(coord)) as Coordinate;
    });
}

const OFFSETS: Coordinate[] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
];

function part1(coords: Coordinate[]): number {
  const grid = new Grid3D<boolean>();

  for (const coord of coords) {
    grid.set(coord[0], coord[1], coord[2], true);
  }

  let count = 0;
  for (const coord of coords) {
    for (const offset of OFFSETS) {
      if (
        !grid.get(
          coord[0] + offset[0],
          coord[1] + offset[1],
          coord[2] + offset[2]
        )
      ) {
        count++;
      }
    }
  }

  return count;
}

function part2(coords: Coordinate[]): number {
  const grid = new Grid3D<boolean>();

  for (const coord of coords) {
    grid.set(coord[0], coord[1], coord[2], true);
  }

  const xs = coords.map((coord) => coord[0]);
  const ys = coords.map((coord) => coord[1]);
  const zs = coords.map((coord) => coord[2]);

  const minCoord = [
    (min(xs) as number) - 1,
    (min(ys) as number) - 1,
    (min(zs) as number) - 1,
  ] as Coordinate;
  const maxCoord = [
    (max(xs) as number) + 1,
    (max(ys) as number) + 1,
    (max(zs) as number) + 1,
  ] as Coordinate;

  const outsideGrid = new Grid3D<boolean>();

  const queue: Coordinate[] = [minCoord];

  let count = 0;
  while (queue.length > 0) {
    const coord = queue.shift() as Coordinate;
    if (outsideGrid.get(coord[0], coord[1], coord[2])) {
      continue;
    }
    outsideGrid.set(coord[0], coord[1], coord[2], true);

    for (const offset of OFFSETS) {
      const offsetCoord = [
        coord[0] + offset[0],
        coord[1] + offset[1],
        coord[2] + offset[2],
      ] as Coordinate;

      if (
        offsetCoord[0] < minCoord[0] ||
        offsetCoord[1] < minCoord[1] ||
        offsetCoord[2] < minCoord[2] ||
        offsetCoord[0] > maxCoord[0] ||
        offsetCoord[1] > maxCoord[1] ||
        offsetCoord[2] > maxCoord[2]
      ) {
        continue;
      }

      if (grid.get(offsetCoord[0], offsetCoord[1], offsetCoord[2])) {
        count++;
      } else {
        queue.push(offsetCoord);
      }
    }
  }

  return count;
}
async function main() {
  console.log(part1(await loadInput("test")));
  console.log(part1(await loadInput()));
  console.log(part2(await loadInput("test")));
  console.log(part2(await loadInput()));
}

main();
