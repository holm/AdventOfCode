import assert from "assert";
import { time } from "console";
import fs from "fs/promises";
import { identity } from "lodash";
import { join } from "path";

type Robots = [number, number, number, number];
type Materials = [number, number, number, number];
type RobotsAllowed = [boolean, boolean, boolean, boolean];
type Blueprint = [Materials, Materials, Materials, Materials];

const ALL_ROBOTS_ALLOWED = [true, true, true, true] as RobotsAllowed;

async function loadInput(name = "input"): Promise<Blueprint[]> {
  const data = await fs.readFile(join(__dirname, `${name}.txt`), {
    encoding: "utf-8",
  });

  return data
    .split("\n")
    .filter(identity)
    .map((bluebrint) => {
      const bluebrintLines = bluebrint.split(/[:.]/);

      const oreRobotMatch = bluebrintLines[1].match(
        /^ Each ore robot costs (\d+) ore$/
      );
      assert(oreRobotMatch);
      const ore: Materials = [parseInt(oreRobotMatch[1]), 0, 0, 0];

      const clayRobotMatch = bluebrintLines[2].match(
        /^ Each clay robot costs (\d+) ore$/
      );
      assert(clayRobotMatch);
      const clay: Materials = [parseInt(clayRobotMatch[1]), 0, 0, 0];

      const obsidianRobotMatch = bluebrintLines[3].match(
        /^ Each obsidian robot costs (\d+) ore and (\d+) clay$/
      );
      assert(obsidianRobotMatch);
      const obsidian: Materials = [
        parseInt(obsidianRobotMatch[1]),
        parseInt(obsidianRobotMatch[2]),
        0,
        0,
      ];

      const geodeRobotMatch = bluebrintLines[4].match(
        /^ Each geode robot costs (\d+) ore and (\d+) obsidian$/
      );
      assert(geodeRobotMatch);
      const geode: Materials = [
        parseInt(geodeRobotMatch[1]),
        0,
        parseInt(geodeRobotMatch[2]),
        0,
      ];

      return [ore, clay, obsidian, geode] as Blueprint;
    });
}

type Solution = number;

function addMaterials(a: Materials, b: Materials): Materials {
  return a.map((value, idx) => value + b[idx]) as Materials;
}

function subtractMaterials(a: Materials, b: Materials): Materials {
  return a.map((value, idx) => value - b[idx]) as Materials;
}

function optimize(
  blueprint: Blueprint,
  maxRobots: Robots,
  materials: Materials,
  robots: Robots,
  robotsAllowed: RobotsAllowed,
  timeLeft: number,
  cache: Map<string, Solution> = new Map()
): Solution {
  if (timeLeft === 0) {
    return materials[3];
  } else if (timeLeft === 1) {
    return materials[3] + robots[3];
  }

  const cacheKey =
    timeLeft % 5 === 0 || timeLeft > 10
      ? `${timeLeft}:${materials.join("-")}:${robots.join("-")}`
      : undefined;
  if (cacheKey !== undefined) {
    const cachedValue = cache.get(cacheKey);
    if (cachedValue !== undefined) {
      return cachedValue;
    }
  }

  const materialsAfterCollection = addMaterials(materials, robots);

  const buildableBlueprints = blueprint.map(
    (blueprint, idx) =>
      robotsAllowed[idx] &&
      blueprint.every((requirement, idx) => materials[idx] >= requirement)
  );

  let solution = optimize(
    blueprint,
    maxRobots,
    materialsAfterCollection,
    robots,
    robotsAllowed.map(
      (allowed, idx) => allowed && !buildableBlueprints[idx]
    ) as RobotsAllowed,
    timeLeft - 1,
    cache
  );

  for (const [robotIdx, requirements] of blueprint.entries()) {
    if (
      buildableBlueprints[robotIdx] &&
      (robotIdx === 3 || maxRobots[robotIdx] > robots[robotIdx])
    ) {
      const materialsAfterBuild = subtractMaterials(
        materialsAfterCollection,
        requirements
      );
      const robotsAfterBuild = [...robots] as Robots;
      robotsAfterBuild[robotIdx] = robotsAfterBuild[robotIdx] + 1;

      const buildSolution = optimize(
        blueprint,
        maxRobots,
        materialsAfterBuild,
        robotsAfterBuild,
        ALL_ROBOTS_ALLOWED,
        timeLeft - 1,
        cache
      );

      if (buildSolution > solution) {
        solution = buildSolution;
      }
    }
  }

  if (cacheKey !== undefined) {
    cache.set(cacheKey, solution);
  }

  return solution;
}

function qualityLevel(blueprint: Blueprint, timeLeft: number): number {
  const materials = [0, 0, 0, 0] as Materials;
  const robots = [1, 0, 0, 0] as Robots;
  const maxRobots = robots.map((_, idx) =>
    Math.max(...blueprint.map((requirements) => requirements[idx]))
  ) as Robots;

  return optimize(
    blueprint,
    maxRobots,
    materials,
    robots,
    ALL_ROBOTS_ALLOWED,
    timeLeft
  );
}

function part1(bluebrints: Blueprint[]): number {
  let score = 0;
  for (const [idx, bluebrint] of bluebrints.entries()) {
    const level = qualityLevel(bluebrint, 24);
    console.log(`Blueprint ${idx + 1} produced ${level} geodes`);

    score += level * (idx + 1);
  }

  return score;
}

function part2(bluebrints: Blueprint[]): number {
  const levels = [...bluebrints.slice(0, 3).entries()].map(
    ([idx, bluebrint]) => {
      const level = qualityLevel(bluebrint, 32);
      console.log(`Blueprint ${idx + 1} produced ${level} geodes`);

      return level;
    }
  );

  return levels
    .slice(1)
    .reduce((previous, current) => previous * current, levels[0]);
}

async function main() {
  console.log(part1(await loadInput("test")));
  console.log(part1(await loadInput()));
  console.log(part2(await loadInput("test")));
  console.log(part2(await loadInput()));
}

main();
