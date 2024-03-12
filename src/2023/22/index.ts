import fs from "fs/promises";
import { identity, mapValues, times } from "lodash";
import { join } from "path";
import { Grid3D } from "../grid";

type Axis = "x" | "y" | "z";
type Coordinate3D = Record<Axis, number>;

class Brick {
  name: string;
  start: Coordinate3D;
  direction: Axis;
  length: number;

  constructor(
    name: string,
    start: Coordinate3D,
    direction: Axis,
    length: number
  ) {
    this.name = name;
    this.start = start;
    this.direction = direction;
    this.length = length;
  }

  drop(): Brick {
    return new Brick(
      this.name,
      {
        x: this.start.x,
        y: this.start.y,
        z: this.start.z - 1,
      },
      this.direction,
      this.length
    );
  }

  tiles(): Coordinate3D[] {
    return times(this.length, (l) => {
      return {
        ...this.start,
        [this.direction]: this.start[this.direction] + l,
      };
    });
  }

  bottomTiles(): Coordinate3D[] {
    if (this.direction === "z") {
      return [this.start];
    } else {
      return this.tiles();
    }
  }
}

function getBrickName(idx: number): string {
  let name = "";

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const modulo = idx % 26;
    name = String.fromCharCode("A".charCodeAt(0) + modulo) + name;
    idx = (idx - modulo) / 26;
    if (idx === 0) {
      return name;
    }
  }
}

function parseCoordinate(raw: string): Coordinate3D {
  const parts = raw.split(",");

  return {
    x: parseInt(parts[0]),
    y: parseInt(parts[1]),
    z: parseInt(parts[2]),
  };
}

async function loadInput(): Promise<Brick[]> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  return data
    .split("\n")
    .filter(identity)
    .map((line, idx) => {
      const [startRaw, endRaw] = line.split("~");

      const name = getBrickName(idx);
      const start = parseCoordinate(startRaw);
      const end = parseCoordinate(endRaw);
      const diff = mapValues(start, (value, key) => end[key as Axis] - value);

      if (diff.x === 0 && diff.y === 0) {
        return new Brick(name, start, "z", diff.z + 1);
      } else if (diff.x === 0 && diff.z === 0) {
        return new Brick(name, start, "y", diff.y + 1);
      } else {
        return new Brick(name, start, "x", diff.x + 1);
      }
    });
}

function gravity(bricks: Brick[]): Record<string, Set<string>> {
  const grid = new Grid3D<string>();

  const supportingOf: Record<string, Set<string>> = Object.fromEntries(
    bricks.map((brick) => [brick.name, new Set<string>()])
  );

  let fallingBricks = bricks;
  while (fallingBricks.length > 0) {
    const stillFallingBricks: Brick[] = [];

    for (const brick of fallingBricks) {
      // eslint-disable-next-line no-constant-condition
      const nextPosition = brick.drop();

      let landed = false;
      for (const tile of nextPosition.bottomTiles()) {
        if (tile.z === 0) {
          landed = true;
          break;
        } else {
          const contact = grid.get(tile.x, tile.y, tile.z);
          if (contact !== undefined) {
            landed = true;
            supportingOf[contact].add(brick.name);
          }
        }
      }

      if (landed) {
        for (const tile of brick.tiles()) {
          grid.set(tile.x, tile.y, tile.z, brick.name);
        }
      } else {
        stillFallingBricks.push(nextPosition);
      }
    }

    fallingBricks = stillFallingBricks;
  }

  return supportingOf;
}

async function part1() {
  const input = await loadInput();

  const supportingOf = gravity(input);
  const supportedBy: Record<string, string[]> = Object.fromEntries(
    input.map((brick) => [brick.name, []])
  );
  for (const [name, supporting] of Object.entries(supportingOf)) {
    for (const support of supporting) {
      supportedBy[support].push(name);
    }
  }

  const removable = input.filter((brick) => {
    const supporting = supportingOf[brick.name];

    return ![...supporting.values()].some((other) => {
      return (
        supportedBy[other].length === 1 && supportedBy[other][0] === brick.name
      );
    });
  });
  console.log(removable.map((b) => b.name));

  const result = removable.length;
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
