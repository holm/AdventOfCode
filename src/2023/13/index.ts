import fs from "fs/promises";
import { identity, sumBy } from "lodash";
import { join } from "path";

type Pattern = string[];

async function loadInput(): Promise<Pattern[]> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  return data.split("\n\n").map((section) => {
    return section.split("\n").filter(identity);
  });
}

function horizontalReflection(pattern: Pattern): number | undefined {
  outer: for (let r = 0; r < pattern.length - 1; r++) {
    const toCheck = Math.min(r + 1, pattern.length - r - 1);
    for (let m = 0; m < toCheck; m++) {
      if (pattern[r - m] !== pattern[r + m + 1]) {
        continue outer;
      }
    }

    return r + 1;
  }
}

function verticalReflection(pattern: Pattern): number | undefined {
  const rotated: Pattern = [];

  const reversedPattern = [...pattern].reverse();

  for (let c = 0; c < pattern[0].length; c++) {
    rotated.push(reversedPattern.map((line) => line.charAt(c)).join(""));
  }

  return horizontalReflection(rotated);
}

async function part1() {
  const patterns = await loadInput();

  const result = sumBy(patterns, (pattern) => {
    const h = horizontalReflection(pattern);
    if (h !== undefined) {
      return 100 * h;
    }

    return verticalReflection(pattern) || 0;
  });
  console.log("part1", result);
}

async function part2() {
  const grid = await loadInput();

  const result = grid.toString();
  console.log("part2", result);
}

async function main() {
  await part1();
  // await part2();
}

main();
