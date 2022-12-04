import fs from "fs/promises";
import { identity } from "lodash";
import { join } from "path";

type Range = [number, number];

type Pair = [Range, Range];

async function loadInput(): Promise<Pair[]> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  const pairsRaw = data.split("\n").filter(identity);

  return pairsRaw.map((pairRaw) => {
    const rangesRaw = pairRaw.split(",");

    return rangesRaw.map((rangeRaw) => parseRange(rangeRaw)) as Pair;
  });
}

function parseRange(rangeRaw: string): Range {
  return rangeRaw.split("-").map((value) => parseInt(value)) as Range;
}

function rangeIncludes(x: Range, y: Range): boolean {
  return x[0] <= y[0] && x[1] >= y[1];
}

function rangeIncludesPartially(x: Range, y: Range): boolean {
  return x[0] <= y[1] && y[0] <= x[1];
}

function part1(pairs: Pair[]): number {
  return pairs.filter((pair) => {
    return rangeIncludes(pair[0], pair[1]) || rangeIncludes(pair[1], pair[0]);
  }).length;
}

function part2(pairs: Pair[]): number {
  return pairs.filter((pair) => {
    return (
      rangeIncludesPartially(pair[0], pair[1]) ||
      rangeIncludesPartially(pair[1], pair[0])
    );
  }).length;
}

async function main() {
  const packs = await loadInput();

  console.log(part1(packs));
  console.log(part2(packs));
}

main();
