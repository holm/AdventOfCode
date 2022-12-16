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
  valve: Valve,
  minutesLeft: number,
  valves: Map<string, Valve>,
  status: ValveStatus,
  cache: Map<string, Solution>
): Solution {
  if (minutesLeft === 1) {
    return {
      status,
      release: 0,
    };
  }

  const cacheKey = `${minutesLeft}-${valve.name}` + [...status.keys()].join("");
  const cachedResult = cache.get(cacheKey);
  if (cachedResult !== undefined) {
    return cachedResult;
  }

  const solutions = valve.paths.map((nextValve) => {
    return search(
      valves.get(nextValve) as Valve,
      minutesLeft - 1,
      valves,
      status,
      cache
    );
  });

  const valveStatus = status.get(valve.name);
  if (valveStatus === undefined && valve.rate > 0) {
    const updatedStatus = new Map(status.entries());
    updatedStatus.set(valve.name, minutesLeft - 1);

    const solution = search(
      valve,
      minutesLeft - 1,
      valves,
      updatedStatus,
      cache
    );

    solutions.push({
      status: solution.status,
      release: solution.release + (minutesLeft - 1) * valve.rate,
    });
  }

  let bestSolution = maxBy(solutions, (solution) => solution.release);

  if (bestSolution === undefined) {
    bestSolution = {
      status,
      release: 0,
    };
  }

  try {
    cache.set(cacheKey, bestSolution);
  } catch (err) {
    console.log(cacheKey, bestSolution);
    throw err;
  }

  return bestSolution;
}

function part1(valves: Valve[]): number {
  const valvesMap = new Map(valves.map((valve) => [valve.name, valve]));

  const solution = search(
    valvesMap.get("AA") as Valve,
    30,
    valvesMap,
    new Map(),
    new Map()
  );

  console.log(solution.status);

  return solution.release;
}

function part2(valves: Valve[]): number {
  return 0;
}

async function main() {
  console.log(part1(await loadInput("test")));
  console.log(part1(await loadInput()));
  // console.log(part2(await loadInput("test")));
  // console.log(part2(await loadInput()));
}

main();
