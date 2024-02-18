import fs from "fs/promises";
import { identity, sortBy, sum } from "lodash";
import { join } from "path";
import combinations from "combinations";

type Indicator = "?" | "." | "#";

type Row = {
  indicators: Indicator[];
  groups: number[];
};

async function loadInput(): Promise<Row[]> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  return data
    .split("\n")
    .filter(identity)
    .map((line) => {
      const [indicatorsRaw, groupsRaw] = line.split(" ");

      return {
        indicators: indicatorsRaw.split("") as Indicator[],
        groups: groupsRaw.split(",").map((groupRaw) => parseInt(groupRaw)),
      };
    });
}

function areGroupsSatisfied(broken: number[], groups: number[]): boolean {
  let brokenIdx = 0;

  for (const group of groups) {
    for (let i = 1; i < group; i++) {
      if (broken[brokenIdx + i] !== broken[brokenIdx] + i) {
        return false;
      }
    }

    if (broken[brokenIdx + group] === broken[brokenIdx] + group) {
      return false;
    }

    brokenIdx += group;
  }

  return brokenIdx === broken.length;
}

async function part1() {
  const rows = await loadInput();

  const rowCombinations = rows.map((row) => {
    const knownBroken: number[] = [];
    const unknown: number[] = [];
    for (const [idx, indicator] of row.indicators.entries()) {
      if (indicator === "#") {
        knownBroken.push(idx);
      } else if (indicator === "?") {
        unknown.push(idx);
      }
    }

    const totalBroken = sum(row.groups);
    const missing = totalBroken - knownBroken.length;

    if (missing > 0) {
      const possibleCombinations = combinations(unknown, missing, missing);

      const validCombinations = possibleCombinations.filter(
        (possibleBroken) => {
          const guessBroken = sortBy([...knownBroken, ...possibleBroken]);

          return areGroupsSatisfied(guessBroken, row.groups);
        }
      );

      return validCombinations.length;
    } else {
      return 1;
    }
  });

  const result = sum(rowCombinations);
  console.log("part1", result);
}

async function part2() {
  const rows = await loadInput();

  const result = rows;
  console.log("part2", result);
}

async function main() {
  await part1();
  // await part2();
}

main();
