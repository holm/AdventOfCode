import assert from "assert";
import fs from "fs/promises";
import { chunk, min, range } from "lodash";
import { join } from "path";

type Range = (source: number) => number | undefined;

type Mapping = Range[];

type Input = {
  seeds: number[];
  mappings: Mapping[];
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

  const mappings = sections.map((section) => {
    const lines = section.split("\n");

    return lines.slice(1).map((line) => {
      const lineParts = line.split(" ");

      const destinationStart = parseInt(lineParts[0]);
      const sourceStart = parseInt(lineParts[1]);
      const length = parseInt(lineParts[2]);

      return (source: number) => {
        if (source >= sourceStart && source < sourceStart + length) {
          return source + destinationStart - sourceStart;
        } else {
          return;
        }
      };
    });
  });

  return { seeds, mappings };
}

function getLocation(seed: number, mappings: Mapping[]): number {
  let value = seed;

  for (const mapping of mappings) {
    for (const range of mapping) {
      const nextValue = range(value);
      if (nextValue !== undefined) {
        value = nextValue;
        break;
      }
    }
  }

  return value;
}

function getClosestLocation(
  seeds: number[],
  mappings: Mapping[]
): number | undefined {
  const locations = seeds.map((seed) => getLocation(seed, mappings));

  return min(locations);
}

async function part1() {
  const input = await loadInput();

  const result = getClosestLocation(input.seeds, input.mappings);
  console.log(result);
}

async function part2() {
  const input = await loadInput();

  const seeds: number[] = [];

  const pairs = chunk(input.seeds, 2);
  for (const [start, length] of pairs) {
    seeds.push(...range(start, start + length));
  }

  const result = getClosestLocation(seeds, input.mappings);
  console.log(result);
}

// part1();
part2();
