import fs from "fs/promises";
import { identity, sortBy, sum, times } from "lodash";
import { join } from "path";
import memoize from "fast-memoize";

type Row = {
  broken: number[];
  unknown: number[];
  groups: number[];
};

function repeatString(str: string, separator: string, count: number): string {
  return times(count, () => str).join(separator);
}

async function loadInput(repeat = 1): Promise<Row[]> {
  const data = await fs.readFile(join(__dirname, "example.txt"), {
    encoding: "utf-8",
  });

  return data
    .split("\n")
    .filter(identity)
    .map((line) => {
      const [indicatorsRaw, groupsRaw] = line.split(" ");

      const broken: number[] = [];
      const unknown: number[] = [];
      for (const [idx, indicator] of repeatString(indicatorsRaw, "?", repeat)
        .split("")
        .entries()) {
        if (indicator === "#") {
          broken.push(idx);
        } else if (indicator === "?") {
          unknown.push(idx);
        }
      }

      const groups = repeatString(groupsRaw, ",", repeat)
        .split(",")
        .map((groupRaw) => parseInt(groupRaw));

      return {
        broken,
        unknown,
        groups,
      };
    });
}

function* combinations<T>(array: T[], count: number): Generator<T[]> {
  const keys: number[] = [];
  for (let i = 0; i < count; i++) {
    keys.push(-1);
  }

  const arrayLength = array.length;

  let index = 0;
  while (index >= 0) {
    if (keys[index] < arrayLength - (count - index)) {
      for (let key = keys[index] - index + 1; index < count; index++) {
        keys[index] = key + index;
      }
      yield keys.map((c) => array[c]);
    } else {
      index--;
    }
  }
}

function groupsSatisfiedRecursive(broken: number[], groups: number[]): boolean {
  const group = groups[0];
  if (group > 1 && broken[group - 1] !== broken[0] + group - 1) {
    return false;
  }

  if (broken[group] === broken[0] + group) {
    return false;
  }

  if (groups.length > 1) {
    return groupsSatisfied(broken.slice(group), groups.slice(1));
  } else {
    return group === broken.length;
  }
}

const groupsSatisfied = memoize(groupsSatisfiedRecursive);

function computeCombinations(rows: Row[]): number {
  const rowCombinations = rows.map((row, rowIdx) => {
    console.log(`${rowIdx}/${rows.length}`);

    const totalBroken = sum(row.groups);
    const missing = totalBroken - row.broken.length;

    if (missing === 0) {
      return 1;
    }

    let valid = 0;
    for (const possibleBroken of combinations(row.unknown, missing)) {
      const guessBroken = sortBy([...row.broken, ...possibleBroken]);
      if (groupsSatisfied(guessBroken, row.groups)) {
        valid++;
      }
    }

    console.log(`Row ${rowIdx} = ${valid}`);

    return valid;
  });

  return sum(rowCombinations);
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
  await part2();
}

main();
