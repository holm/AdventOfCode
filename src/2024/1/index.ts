import fs from "fs/promises";
import { identity, sum } from "lodash";
import { join } from "path";

async function loadInput(): Promise<[number, number][]> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  const lines = data.split("\n");

  return lines.filter(identity).map((line) => {
    const [a, b] = line.split("   ");

    return [parseInt(a), parseInt(b)];
  });
}

async function part1(): Promise<number> {
  const pairs = await loadInput();

  const as = pairs.map(([a]) => a);
  const bs = pairs.map(([_, b]) => b);

  const sortedAs = as.sort((a, b) => a - b);
  const sortedBs = bs.sort((a, b) => a - b);

  const diffs = sortedAs.map((a, i) => Math.abs(a - sortedBs[i]));

  return sum(diffs);
}

async function part2(): Promise<number> {
  const pairs = await loadInput();

  const bCounts = new Map<number, number>();
  for (const [_, b] of pairs) {
    bCounts.set(b, (bCounts.get(b) || 0) + 1);
  }

  const similarities = pairs.map(([a]) => {
    return a * (bCounts.get(a) || 0);
  });

  return sum(similarities);
}

async function main() {
  console.log(await part1());
  console.log(await part2());
}

main();
