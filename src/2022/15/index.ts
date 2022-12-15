import assert from "assert";
import fs from "fs/promises";
import { identity, max, min, range, sortBy } from "lodash";
import { join } from "path";

type Coordinate = { x: number; y: number };

class Sensor {
  location: Coordinate;
  beacon: Coordinate;
  distance: number;

  constructor(location: Coordinate, beacon: Coordinate) {
    this.location = location;
    this.beacon = beacon;
    this.distance = calculateDistance(location, beacon);
  }
}

const re =
  /^Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)$/;

async function loadInput(name = "input"): Promise<Sensor[]> {
  const data = await fs.readFile(join(__dirname, `${name}.txt`), {
    encoding: "utf-8",
  });

  return data
    .split("\n")
    .filter(identity)
    .map((line) => {
      const match = line.match(re);
      assert(match);

      return new Sensor(
        {
          x: parseInt(match[1]),
          y: parseInt(match[2]),
        },
        {
          x: parseInt(match[3]),
          y: parseInt(match[4]),
        }
      );
    });
}

function calculateDistance(a: Coordinate, b: Coordinate): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function scanRow(
  sensors: Sensor[],
  minX: number,
  maxX: number,
  y: number
): boolean[] {
  return range(minX, maxX + 1).map((x) => {
    return sensors.some(
      (sensor) =>
        calculateDistance({ x, y }, sensor.location) <= sensor.distance
    );
  });
}

function part1(sensors: Sensor[], y: number): number {
  const xs = [
    ...sensors.map((sensor) => sensor.location.x),
    ...sensors.map((sensor) => sensor.beacon.x),
  ];

  const minX = min([
    ...xs,
    ...sensors.map((sensor) => sensor.location.x - sensor.distance),
  ]) as number;
  const maxX = max([
    ...xs,
    ...sensors.map((sensor) => sensor.location.x + sensor.distance),
  ]) as number;
  assert(minX && maxX);

  const occupied = new Set<number>();
  for (const sensor of sensors) {
    if (sensor.location.y === y) {
      occupied.add(sensor.location.x);
    }
    if (sensor.beacon.y === y) {
      occupied.add(sensor.beacon.x);
    }
  }

  const excluded = range(minX, maxX + 1).filter((x) => {
    return sensors.some(
      (sensor) =>
        calculateDistance({ x, y }, sensor.location) <= sensor.distance
    );
  });

  return excluded.length - occupied.size;
}

function part2(sensors: Sensor[], minXY: number, maxXY: number): number {
  for (let y = minXY; y <= maxXY; y++) {
    const ranges: [number, number][] = [];

    for (const sensor of sensors) {
      const yDiff = sensor.distance - Math.abs(y - sensor.location.y);
      if (yDiff >= 0) {
        ranges.push([sensor.location.x - yDiff, sensor.location.x + yDiff]);
      }
    }

    let coverUntil = minXY - 1;

    const sortedRanges = sortBy(ranges, ([s]) => s);
    for (const [s, e] of sortedRanges) {
      if (s > coverUntil + 1) {
        break;
      } else if (e > coverUntil) {
        coverUntil = e;
      }
    }

    if (coverUntil < maxXY) {
      return (coverUntil + 1) * 4000000 + y;
    }
  }

  return -1;
}

async function main() {
  console.log(part1(await loadInput("test"), 10));
  console.log(part1(await loadInput(), 2000000));
  console.log(part2(await loadInput("test"), 0, 20));
  console.log(part2(await loadInput(), 0, 4000000));
}

main();
