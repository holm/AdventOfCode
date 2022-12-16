import assert from "assert";
import fs from "fs/promises";
import { identity, maxBy, min, minBy } from "lodash";
import { join } from "path";

type Valve = {
  name: string;
  rate: number;
  paths: [string];
};

const re =
  /^Valve (\w\w) has flow rate=(\d+); tunnels? leads? to valves? ((\w\w)(, (\w\w))*)$/;

async function loadInput(name = "input"): Promise<Valve[]> {
  const data = await fs.readFile(join(__dirname, `${name}.txt`), {
    encoding: "utf-8",
  });

  return data
    .split("\n")
    .filter(identity)
    .map((line) => {
      const match = line.match(re);
      assert(match);

      return {
        name: match[1],
        rate: parseInt(match[2]),
        paths: match[3].split(", "),
      } as Valve;
    });
}

type ValveStatus = Map<string, number>;

type Solution = {
  status: ValveStatus;
  release: number;
};

function search(
  valves: Map<string, Valve>,
  positions: Valve[],
  positionIdx = 0,
  minutesLeft = 30,
  status: ValveStatus = new Map(),
  cache: Map<string, Solution> = new Map()
): Solution {
  if (minutesLeft === 1) {
    return {
      status,
      release: 0,
    };
  } else if (positionIdx === positions.length) {
    return search(valves, positions, 0, minutesLeft - 1, status, cache);
  }

  const cacheKey =
    positionIdx === 0
      ? `${minutesLeft}-${positions
          .map((position) => position.name)
          .join(":")}-${[...status.keys()].join("")}`
      : undefined;
  if (cacheKey !== undefined) {
    const cachedResult = cache.get(cacheKey);
    if (cachedResult !== undefined) {
      return cachedResult;
    }
  }

  const position = positions[positionIdx];

  const solutions = position.paths.map((nextValve) => {
    const updatedPositions = [...positions];
    updatedPositions[positionIdx] = valves.get(nextValve) as Valve;

    return search(
      valves,
      updatedPositions,
      positionIdx + 1,
      minutesLeft,
      status,
      cache
    );
  });

  const valveStatus = status.get(position.name);
  if (valveStatus === undefined && position.rate > 0) {
    const updatedStatus = new Map(status.entries());
    updatedStatus.set(position.name, minutesLeft - 1);

    const solution = search(
      valves,
      positions,
      positionIdx + 1,
      minutesLeft,
      updatedStatus,
      cache
    );

    solutions.push({
      status: solution.status,
      release: solution.release + (minutesLeft - 1) * position.rate,
    });
  }

  let bestSolution = maxBy(solutions, (solution) => solution.release);

  if (bestSolution === undefined) {
    bestSolution = {
      status,
      release: 0,
    };
  }

  if (cacheKey !== undefined) {
    cache.set(cacheKey, bestSolution);
  }

  return bestSolution;
}

function part1(valves: Valve[]): number {
  const valvesMap = new Map(valves.map((valve) => [valve.name, valve]));

  const startValve = valvesMap.get("AA") as Valve;

  const solution = search(valvesMap, [startValve]);

  return solution.release;
}

function part2(valves: Valve[]): number {
  const valvesMap = new Map(valves.map((valve) => [valve.name, valve]));

  const startValve = valvesMap.get("AA") as Valve;

  const solution = search(valvesMap, [startValve, startValve], 0, 26);

  return solution.release;
}

async function main() {
  // console.log(part1(await loadInput("test")));
  // console.log(part1(await loadInput()));
  console.log(part2(await loadInput("test")));
  console.log(part2(await loadInput()));
}

main();
