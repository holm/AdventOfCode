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

function isHorizontalReflection(
  pattern: Pattern,
  smudged: boolean,
  r: number
): boolean {
  let smudgeUsed = !smudged;

  const mMax = Math.min(r + 1, pattern.length - r - 1);
  for (let m = 0; m < mMax; m++) {
    const above = pattern[r - m];
    const below = pattern[r + m + 1];

    if (smudgeUsed) {
      if (above !== below) {
        return false;
      }
    } else {
      for (let c = 0; c < above.length; c++) {
        if (above.charAt(c) !== below.charAt(c)) {
          if (smudgeUsed) {
            return false;
          } else {
            smudgeUsed = true;
          }
        }
      }
    }
  }

  return smudgeUsed;
}

function horizontalReflection(
  pattern: Pattern,
  smudged: boolean
): number | undefined {
  for (let r = 0; r < pattern.length - 1; r++) {
    if (isHorizontalReflection(pattern, smudged, r)) {
      return r + 1;
    }
  }
}

function verticalReflection(
  pattern: Pattern,
  smudged: boolean
): number | undefined {
  const rotated: Pattern = [];

  const reversedPattern = [...pattern].reverse();

  for (let c = 0; c < pattern[0].length; c++) {
    rotated.push(reversedPattern.map((line) => line.charAt(c)).join(""));
  }

  return horizontalReflection(rotated, smudged);
}

function computeScore(patterns: Pattern[], smudged: boolean): number {
  return sumBy(patterns, (pattern) => {
    const h = horizontalReflection(pattern, smudged);
    if (h !== undefined) {
      return 100 * h;
    }

    const v = verticalReflection(pattern, smudged);
    if (v !== undefined) {
      return v;
    }

    throw new Error("No reflection");
  });
}

async function part1() {
  const patterns = await loadInput();

  const result = computeScore(patterns, false);
  console.log("part1", result);
}

async function part2() {
  const patterns = await loadInput();

  const result = computeScore(patterns, true);
  console.log("part2", result);
}

async function main() {
  await part1();
  await part2();
}

main();
