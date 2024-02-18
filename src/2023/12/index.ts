import fs from "fs/promises";
import { identity, sortBy, sum } from "lodash";
import { join } from "path";
import combinations from "combinations";

type Row = {
  broken: number[];
  unknown: number[];
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

      const broken: number[] = [];
      const unknown: number[] = [];
      for (const [idx, indicator] of indicatorsRaw.split("").entries()) {
        if (indicator === "#") {
          broken.push(idx);
        } else if (indicator === "?") {
          unknown.push(idx);
        }
      }

      const groups = groupsRaw.split(",").map((groupRaw) => parseInt(groupRaw));

      return {
        broken,
        unknown,
        groups,
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

function computeCombinations(rows: Row[]): number {
  const rowCombinations = rows.map((row) => {
    const totalBroken = sum(row.groups);
    const missing = totalBroken - row.broken.length;

    if (missing > 0) {
      const possibleCombinations = combinations(row.unknown, missing, missing);

      const validCombinations = possibleCombinations.filter(
        (possibleBroken) => {
          const guessBroken = sortBy([...row.broken, ...possibleBroken]);

          return areGroupsSatisfied(guessBroken, row.groups);
        }
      );

      return validCombinations.length;
    } else {
      return 1;
    }
  });

  return sum(rowCombinations);
}

async function part1() {
  const rows = await loadInput();

  const result = computeCombinations(rows);
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
