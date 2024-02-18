import fs from "fs/promises";
import { identity, sumBy, times } from "lodash";
import { join } from "path";
import memoize from "fast-memoize";

type Indicator = "." | "?" | "#";

type Row = {
  indicators: Indicator[];
  groups: number[];
};

function repeatString(str: string, separator: string, count: number): string {
  return times(count, () => str).join(separator);
}

async function loadInput(repeat = 1): Promise<Row[]> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  return data
    .split("\n")
    .filter(identity)
    .map((line) => {
      const [indicatorsRaw, groupsRaw] = line.split(" ");

      const indicators = repeatString(indicatorsRaw, "?", repeat).split(
        ""
      ) as Indicator[];
      const groups = repeatString(groupsRaw, ",", repeat)
        .split(",")
        .map((groupRaw) => parseInt(groupRaw));

      return {
        indicators,
        groups,
      };
    });
}

function permutations(indicators: Indicator[], groups: number[]): number {
  if (indicators.length === 0) {
    return groups.length === 0 ? 1 : 0;
  }

  const indicator = indicators[0];
  if (indicator === ".") {
    return permutationsMemoized(indicators.slice(1), groups);
  } else if (indicator === "#") {
    if (groups.length === 0) {
      return 0;
    }

    const group = groups[0];
    for (let i = 1; i < group; i++) {
      if (indicators[i] === ".") {
        return 0;
      }
    }

    if (indicators[group] === "#") {
      return 0;
    }

    return permutationsMemoized(indicators.slice(group + 1), groups.slice(1));
  } else if (indicator === "?") {
    return (
      permutationsMemoized(["#", ...indicators.slice(1)], groups) +
      permutationsMemoized([".", ...indicators.slice(1)], groups)
    );
  } else {
    throw new Error(`Unknown indicator ${indicator}`);
  }
}

const permutationsMemoized = memoize(permutations);

function computeCombinations(rows: Row[]): number {
  return sumBy(rows, (row) => {
    const count = permutations(row.indicators, row.groups);
    console.log(`Row = ${count}`);
    return count;
  });
}

async function part1() {
  const rows = await loadInput();

  const result = computeCombinations(rows);
  console.log("part1", result);
}

async function part2() {
  const rows = await loadInput(5);

  const result = computeCombinations(rows);
  console.log("part2", result);
}

async function main() {
  await part1();
  // await part2();
}

main();
