import fs from "fs/promises";
import { identity, sum } from "lodash";
import { join } from "path";
import { Grid } from "../grid";
import assert from "assert";

type Location = [number, number];

async function loadInput(): Promise<Grid<boolean>> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  const grid = new Grid<boolean>();

  data
    .split("\n")
    .filter(identity)
    .map((line, y) => {
      line.split("").map((char, x) => {
        if (char === "#") {
          grid.set(x, y, true);
        }
      });
    });

  return grid;
}

function getExpandingXs(grid: Grid<boolean>): number[] {
  const xRange = grid.getXRange().asArray();
  assert(xRange);

  return xRange.filter((x) => {
    const yRange = grid.getYRange(x);
    return yRange.min === undefined;
  });
}

function getExpandingYs(grid: Grid<boolean>): number[] {
  const yRange = grid.getYRange().asArray();
  assert(yRange);

  return yRange.filter((y) => {
    const xRange = grid.getXRange(y);
    return xRange.min === undefined;
  });
}

function expandUniverse(grid: Grid<boolean>, factor: number): Location[] {
  const expandingXs = getExpandingXs(grid);
  const expandingYs = getExpandingYs(grid);

  const galaxies: Location[] = [];

  const xRange = grid.getXRange().asArray();
  const yRange = grid.getYRange().asArray();
  assert(yRange && xRange);

  for (const y of yRange) {
    const expandedY =
      y + expandingYs.filter((expandedY) => expandedY < y).length * factor;

    for (const x of xRange) {
      if (grid.get(x, y)) {
        const expandedX =
          x + expandingXs.filter((expandedX) => expandedX < x).length * factor;

        galaxies.push([expandedX, expandedY]);
      }
    }
  }

  return galaxies;
}

function getDistances(galaxies: Location[]): number {
  const distances: number[] = [];

  for (const [idx, galaxy] of galaxies.entries()) {
    for (const otherGalaxy of galaxies.slice(idx + 1)) {
      const distance =
        Math.abs(galaxy[0] - otherGalaxy[0]) +
        Math.abs(galaxy[1] - otherGalaxy[1]);
      distances.push(distance);
    }
  }

  return sum(distances);
}

async function part1() {
  const grid = await loadInput();

  const galaxies = expandUniverse(grid, 1);

  const result = getDistances(galaxies);
  console.log("part1", result);
}

async function part2() {
  const grid = await loadInput();

  const galaxies = expandUniverse(grid, 1000000 - 1);

  const result = getDistances(galaxies);
  console.log("part2", result);
}

async function main() {
  await part1();
  await part2();
}

main();
