import fs from "fs/promises";
import { identity } from "lodash";
import { join } from "path";

type Location = [number, number];
type Frequency = {
  symbol: string;
  locations: Location[];
};

type Input = {
  grid: string[][];
  frequencies: Frequency[];
};

async function loadInput(): Promise<Input> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  const grid = data
    .split("\n")
    .filter(identity)
    .map((line) => line.split(""));

  const frequencyMap = new Map<string, Location[]>();
  for (const [r, row] of grid.entries()) {
    for (const [c, cell] of row.entries()) {
      if (cell !== ".") {
        let locations = frequencyMap.get(cell);
        if (locations === undefined) {
          locations = [];
          frequencyMap.set(cell, locations);
        }

        locations.push([r, c]);
      }
    }
  }

  const frequencies: Frequency[] = [];
  for (const [symbol, locations] of frequencyMap.entries()) {
    frequencies.push({ symbol, locations });
  }

  return { grid, frequencies };
}

function locationPairs(locations: Location[]): [Location, Location][] {
  const pairs: [Location, Location][] = [];
  for (const location1 of locations) {
    for (const location2 of locations) {
      if (location1 !== location2) {
        pairs.push([location1, location2]);
      }
    }
  }

  return pairs;
}

async function part1(): Promise<number> {
  const { grid, frequencies } = await loadInput();

  const antinodes = new Set<string>();

  for (const frequency of frequencies) {
    const pairs = locationPairs(frequency.locations);
    for (const [location1, location2] of pairs) {
      const antinode = [
        location1[0] + location1[0] - location2[0],
        location1[1] + location1[1] - location2[1],
      ];
      if (
        antinode[0] >= 0 &&
        antinode[0] < grid.length &&
        antinode[1] >= 0 &&
        antinode[1] < grid[0].length
      ) {
        antinodes.add(`${antinode[0]},${antinode[1]}`);
      }
    }
  }

  return antinodes.size;
}

async function part2(): Promise<number> {
  const { grid, frequencies } = await loadInput();

  const antinodes = new Set<string>();

  for (const frequency of frequencies) {
    const pairs = locationPairs(frequency.locations);
    for (const [location1, location2] of pairs) {
      const step = [location1[0] - location2[0], location1[1] - location2[1]];

      let location = location1;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        antinodes.add(`${location[0]},${location[1]}`);

        const antinode: Location = [
          location[0] + step[0],
          location[1] + step[1],
        ];
        if (
          antinode[0] < 0 ||
          antinode[0] >= grid.length ||
          antinode[1] < 0 ||
          antinode[1] >= grid[0].length
        ) {
          break;
        }

        location = antinode;
      }
    }
  }

  return antinodes.size;
}

async function main() {
  console.log(await part1());
  console.log(await part2());
}

main();
