import fs from "fs/promises";
import { identity } from "lodash";
import { join } from "path";
import { Grid } from "../grid";

type Pipe = "|" | "-" | "L" | "J" | "7" | "F";
type Tile = Pipe | "." | "S";

type Coordinate = [number, number];

const offsets: Record<Pipe, [Coordinate, Coordinate]> = {
  "|": [
    [0, -1],
    [0, 1],
  ],
  "-": [
    [-1, 0],
    [1, 0],
  ],
  L: [
    [0, -1],
    [1, 0],
  ],
  J: [
    [0, -1],
    [-1, 0],
  ],
  "7": [
    [-1, 0],
    [0, 1],
  ],
  F: [
    [1, 0],
    [0, 1],
  ],
};

type Map = {
  start: Coordinate;
  grid: Grid<Tile>;
};

async function loadInput(): Promise<Map> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  const grid = new Grid<Tile>();

  let start: [number, number] = [-1, -1];

  data
    .split("\n")
    .filter(identity)
    .map((line, y) => {
      line.split("").map((tile, x) => {
        grid.set(x, y, tile as Tile);
        if (tile === "S") {
          start = [x, y];
        }
      });
    });

  if (start[0] !== -1) {
    for (const [tile, tileOffsets] of Object.entries(offsets)) {
      if (
        tileOffsets.every((tileOffset) => {
          const otherTile = grid.get(
            start[0] + tileOffset[0],
            start[1] + tileOffset[1]
          );
          if (
            otherTile === undefined ||
            otherTile === "." ||
            otherTile === "S"
          ) {
            return false;
          }

          const otherTileOffsets = offsets[otherTile as Pipe];
          return otherTileOffsets.some(
            (otherTileOffset) =>
              otherTileOffset[0] === tileOffset[0] * -1 &&
              otherTileOffset[1] === tileOffset[1] * -1
          );
        })
      ) {
        grid.set(start[0], start[1], tile as Tile);
        break;
      }
    }
  }

  return { start, grid };
}

function getLoopLength(map: Map): number {
  let move: Coordinate = [0, 0];
  let position = map.start;
  let length = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const pipe = map.grid.get(position[0], position[1]);
    const potentialMoves = offsets[pipe as Pipe];

    for (const potentialMove of potentialMoves) {
      if (
        potentialMove[0] !== move[0] * -1 ||
        potentialMove[1] !== move[1] * -1
      ) {
        move = potentialMove;
        position = [position[0] + move[0], position[1] + move[1]];
        length++;

        if (position[0] === map.start[0] && position[1] === map.start[1]) {
          return length;
        }
        break;
      }
    }
  }
}

async function part1() {
  const map = await loadInput();

  const result = getLoopLength(map) / 2;
  console.log("part1", result);
}

async function part2() {
  const map = await loadInput();

  const result = map;
  console.log("part2", result);
}

async function main() {
  await part1();
  // await part2();
}

main();
