import assert from "assert";
import fs from "fs/promises";
import { identity, maxBy, range, without } from "lodash";
import { join } from "path";
import Graph from "node-dijkstra";

type Valve = {
  name: string;
  rate: number;
  paths: Record<string, number>;
};

const START_VALVE = "AA";

const re =
  /^Valve (\w\w) has flow rate=(\d+); tunnels? leads? to valves? ((\w\w)(, (\w\w))*)$/;

async function loadInput(name = "input"): Promise<Map<string, Valve>> {
  const data = await fs.readFile(join(__dirname, `${name}.txt`), {
    encoding: "utf-8",
  });

  const valves = data
    .split("\n")
    .filter(identity)
    .map((line) => {
      const match = line.match(re);
      assert(match);

      return {
        name: match[1],
        rate: parseInt(match[2]),
        paths: Object.fromEntries(
          match[3].split(", ").map((target) => [target, 1])
        ),
      } as Valve;
    });

  const graph = new Graph();
  for (const valve of valves) {
    graph.addNode(valve.name, valve.paths);
  }

  const valveMap = new Map();

  for (const valve of valves) {
    if (valve.rate === 0 && valve.name !== START_VALVE) {
      continue;
    }

    const directPaths: Record<string, number> = {};

    for (const targetValve of valves) {
      if (targetValve.rate === 0) {
        continue;
      }

      const { path, cost } = graph.path(valve.name, targetValve.name, {
        cost: true,
      }) as {
        path: string[];
        cost: number;
      };

      if (path !== null) {
        directPaths[targetValve.name] = cost;
      }
    }

    valveMap.set(valve.name, {
      ...valve,
      paths: directPaths,
    });
  }

  return valveMap;
}

type Solution = {
  usedValves: Set<string>;
  release: number;
};

type Actor = {
  minutesLeft: number;
  valve: string;
};

function search(
  valves: Map<string, Valve>,
  actors: Actor[],
  usedValves: Set<string> = new Set(),
  cache: Map<string, Solution> = new Map()
): Solution {
  if (actors.length === 0) {
    return {
      usedValves,
      release: 0,
    };
  }

  const cacheKey = [
    ...actors.map((actor) => `${actor.valve}=${actor.minutesLeft}`).sort(),
    ":",
    [...usedValves.keys()].sort().join("-"),
  ].join("");
  const cachedResult = cache.get(cacheKey);
  if (cachedResult !== undefined) {
    return cachedResult;
  }

  const solutions: Solution[] = [];

  for (const actor of actors) {
    const otherActors = without(actors, actor);
    const sourceValve = valves.get(actor.valve) as Valve;

    for (const [targetValveName, distance] of Object.entries(
      sourceValve.paths
    )) {
      if (!usedValves.has(targetValveName) && distance < actor.minutesLeft) {
        const targetValve = valves.get(targetValveName) as Valve;

        const minutesLeft = actor.minutesLeft - distance - 1;

        const updatedActors = [...otherActors];
        if (minutesLeft > 2) {
          updatedActors.push({
            minutesLeft,
            valve: targetValveName,
          });
        }

        const updatedUsedValves = new Set([
          ...usedValves.values(),
          targetValveName,
        ]);

        const subSolution = search(
          valves,
          updatedActors,
          updatedUsedValves,
          cache
        );

        solutions.push({
          usedValves: subSolution.usedValves,
          release: minutesLeft * targetValve.rate + subSolution.release,
        });
      }
    }
  }

  let bestSolution = maxBy(solutions, (solution) => solution.release);
  if (bestSolution === undefined) {
    bestSolution = {
      usedValves,
      release: 0,
    };
  }

  cache.set(cacheKey, bestSolution);

  return bestSolution;
}

function solve(
  valvesMap: Map<string, Valve>,
  time: number,
  actors: number
): number {
  const solution = search(
    valvesMap,
    range(0, actors).map(() => ({
      minutesLeft: time,
      valve: START_VALVE,
    }))
  );

  return solution.release;
}

function part1(valvesMap: Map<string, Valve>): number {
  return solve(valvesMap, 30, 1);
}

function part2(valvesMap: Map<string, Valve>): number {
  return solve(valvesMap, 26, 2);
}

async function main() {
  console.log(part1(await loadInput("test")));
  console.log(part1(await loadInput()));
  console.log(part2(await loadInput("test")));
  console.log(part2(await loadInput()));
}

main();
