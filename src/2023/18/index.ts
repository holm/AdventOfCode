import fs from "fs/promises";
import { identity, sum } from "lodash";
import { join } from "path";
import assert from "assert";

type Direction = "R" | "L" | "U" | "D";
type Dig = {
  direction: Direction;
  count: number;
  color: string;
};
type Coordinate = [number, number];

const moves: Record<Direction, Coordinate> = {
  R: [1, 0],
  L: [-1, 0],
  U: [0, -1],
  D: [0, 1],
};

async function loadInput(): Promise<Dig[]> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  return data
    .split("\n")
    .filter(identity)
    .map((line) => {
      const parts = line.split(" ");

      const direction = parts[0] as Direction;
      const count = parseInt(parts[1]);
      const color = parts[2].substring(1, parts[2].length - 1);

      return {
        direction,
        count,
        color,
      } as Dig;
    });
}

function calculateInterior(digs: Dig[]): number {
  const corners = computeCorners(digs);

  const interior =
    sum(
      corners.map((corner, idx) => {
        const nextCorner = corners[(idx + 1) % corners.length];
        return (corner[0] - nextCorner[0]) * (corner[1] + nextCorner[1]);
      })
    ) / 2;

  const edge = sum(digs.map((dig) => dig.count));

  return interior + edge / 2 + 1;
}

function computeCorners(digs: Dig[]): Coordinate[] {
  const corners: Coordinate[] = [];
  let location: Coordinate = [0, 0];

  for (const dig of digs) {
    const move = moves[dig.direction];

    location = [
      location[0] + dig.count * move[0],
      location[1] + dig.count * move[1],
    ];

    corners.push(location);
  }

  assert(location[0] === 0 && location[1] === 0);

  return corners;
}

const numberToDirection: Record<string, Direction> = {
  0: "R",
  1: "D",
  2: "L",
  3: "U",
};

function colorsToDigs(digs: Dig[]): Dig[] {
  return digs.map((dig) => {
    const color = dig.color;
    const count = parseInt("0x" + color.substring(1, 6), 16);
    const direction = numberToDirection[color.charAt(6)];

    return {
      direction,
      count,
      color,
    } as Dig;
  });
}

async function part1() {
  const digs = await loadInput();

  const result = calculateInterior(digs);
  console.log("part1", result);
}

async function part2() {
  const digs = await loadInput();
  const adjustedDigs = colorsToDigs(digs);

  const result = calculateInterior(adjustedDigs);
  console.log("part2", result);
}

async function main() {
  await part1();
  await part2();
}

main();
