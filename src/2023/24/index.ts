import fs from "fs/promises";
import { identity } from "lodash";
import { join } from "path";

type Coordinate = {
  x: number;
  y: number;
  z: number;
};
type Hailstone = {
  position: Coordinate;
  velocity: Coordinate;
};

async function loadInput(): Promise<Hailstone[]> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  return data
    .split("\n")
    .filter(identity)
    .map((line) => {
      const [positionRaw, velocityRaw] = line.split(" @ ");

      const positions = positionRaw.split(", ");
      const position = {
        x: parseInt(positions[0].trim()),
        y: parseInt(positions[1].trim()),
        z: parseInt(positions[2].trim()),
      };

      const velocities = velocityRaw.split(", ");
      const velocity = {
        x: parseInt(velocities[0].trim()),
        y: parseInt(velocities[1].trim()),
        z: parseInt(velocities[2].trim()),
      };

      return {
        position,
        velocity,
      };
    });
}

function getIntersection(a: Hailstone, b: Hailstone): Coordinate | undefined {
  const denominator = a.velocity.y * b.velocity.x - a.velocity.x * b.velocity.y;
  if (denominator === 0) {
    return undefined;
  }

  const la =
    (a.position.x * b.velocity.y -
      a.position.y * b.velocity.x -
      b.position.x * b.velocity.y +
      b.position.y * b.velocity.x) /
    denominator;
  if (la < 0) {
    return undefined;
  }

  const lb =
    (b.position.x * a.velocity.y -
      b.position.y * a.velocity.x -
      a.position.x * a.velocity.y +
      a.position.y * a.velocity.x) /
    denominator;
  if (lb > 0) {
    return undefined;
  }

  return {
    x: a.position.x + la * a.velocity.x,
    y: a.position.y + la * a.velocity.y,
    z: a.position.z + la * a.velocity.z,
  };
}

type HailstonePair = [Hailstone, Hailstone];

function allPairs(hailstones: Hailstone[]): HailstonePair[] {
  const pairs: HailstonePair[] = [];

  for (const [i, a] of hailstones.entries()) {
    for (const b of hailstones.slice(i + 1)) {
      pairs.push([a, b]);
    }
  }

  return pairs;
}

async function part1() {
  const hailstones = await loadInput();

  const pairs = allPairs(hailstones);
  // const range = [7, 27];
  const range = [200000000000000, 400000000000000];

  const intersections = pairs.filter((pair) => {
    const intersection = getIntersection(...pair);
    if (intersection === undefined) {
      return false;
    }

    return (
      intersection.x >= range[0] &&
      intersection.x <= range[1] &&
      intersection.y >= range[0] &&
      intersection.y <= range[1]
    );
  });

  const result = intersections.length;

  console.log("part1", result);
}

async function part2() {
  const hailstones = await loadInput();

  const result = hailstones;

  console.log("part2", result);
}

async function main() {
  await part1();
  // await part2();
}

main();
