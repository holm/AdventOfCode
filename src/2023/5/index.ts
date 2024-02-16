import assert from "assert";
import fs from "fs/promises";
import { chunk, flatten, identity, min, sumBy } from "lodash";
import { join } from "path";

type Range = {
  start: number;
  length: number;
};

type Mapping = {
  destinationStart: number;
  sourceStart: number;
  length: number;
};

type RangeMapper = (range: Range) => Range[];

type Input = {
  seeds: number[];
  mappers: RangeMapper[];
};

async function loadInput(): Promise<Input> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  const sections = data.split("\n\n");

  const seedsSection = sections.shift();
  assert(seedsSection);
  const seeds = seedsSection
    .split("\n")[0]
    .split(": ")[1]
    .split(" ")
    .map((seedRaw) => parseInt(seedRaw));

  const mappers = sections.map((section) => {
    const lines = section.split("\n").filter(identity);

    const mappings: Mapping[] = lines.slice(1).map((line) => {
      const lineParts = line.split(" ");

      const destinationStart = parseInt(lineParts[0]);
      const sourceStart = parseInt(lineParts[1]);
      const length = parseInt(lineParts[2]);

      return {
        destinationStart,
        sourceStart,
        length,
      };
    });

    return (range: Range): Range[] => {
      const result: Range[] = [];
      let stack = [range];

      for (const mapping of mappings) {
        const sourceStart = mapping.sourceStart;
        const sourceEnd = mapping.sourceStart + mapping.length;

        const nextStack: Range[] = [];

        for (const entry of stack) {
          const entryStart = entry.start;
          const entryEnd = entry.start + entry.length;

          if (entryStart > sourceEnd || sourceStart > entryEnd) {
            nextStack.push(entry);
            continue;
          }

          const leftLength = sourceStart - entryStart;
          if (leftLength > 0) {
            nextStack.push({ start: entryStart, length: leftLength });
          }

          const rightLength = entryEnd - sourceEnd;
          if (rightLength > 0) {
            nextStack.push({
              start: entryEnd - rightLength,
              length: rightLength,
            });
          }

          const mappedStart = Math.max(entryStart, sourceStart);
          const mappedEnd = Math.min(entryEnd, sourceEnd);

          if (mappedStart < mappedEnd) {
            const resultEntry: Range = {
              start: mappedStart - sourceStart + mapping.destinationStart,
              length: mappedEnd - mappedStart,
            };
            result.push(resultEntry);
          }
        }

        stack = nextStack;
      }

      const allRanges = [...result, ...stack];
      assert(range.length === sumBy(allRanges, (range) => range.length));

      return allRanges;
    };
  });

  return { seeds, mappers };
}

function getLocations(seedRanges: Range[], mappers: RangeMapper[]): Range[] {
  let ranges = seedRanges;

  for (const mapper of mappers) {
    console.log("ranges", ranges);
    ranges = flatten(ranges.map((range) => mapper(range)));
  }
  console.log("location", ranges);

  return ranges;
}

function getClosestLocation(
  seedRanges: Range[],
  mappers: RangeMapper[]
): number | undefined {
  const locations = getLocations(seedRanges, mappers);

  return min(locations.map((location) => location.start));
}

async function part1() {
  const input = await loadInput();

  const seedRanges = input.seeds.map((seed) => ({ start: seed, length: 1 }));

  const result = getClosestLocation(seedRanges, input.mappers);
  console.log("part1", result);
}

async function part2() {
  const input = await loadInput();

  const seedRanges: Range[] = chunk(input.seeds, 2).map(([start, length]) => {
    return {
      start,
      length,
    };
  });

  const result = getClosestLocation(seedRanges, input.mappers);
  console.log("part2", result);
}

part1();
part2();
