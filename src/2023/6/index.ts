import assert from "assert";
import fs from "fs/promises";
import { zip } from "lodash";
import { join } from "path";

type Race = {
  time: number;
  distance: number;
};

function parseNumbers(line: string): number[] {
  const numbersRaw = line.split(/:\s+/)[1];

  return numbersRaw.split(/\s+/).map((value) => parseInt(value));
}

async function loadInput(): Promise<Race[]> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  const [timesLine, distancesLine] = data.split("\n");

  const times = parseNumbers(timesLine);
  const distances = parseNumbers(distancesLine);
  console.log(times, distances);

  return zip(times, distances).map(([time, distance]) => {
    assert(time);
    assert(distance);

    return { time, distance };
  });
}

function solutions(race: Race): number {
  const d = Math.sqrt(race.time * race.time - 4 * -1 * -race.distance);

  let from = ((-race.time + d) / 2) * -1;
  let to = ((-race.time - d) / 2) * -1;

  if (from === Math.round(from)) {
    from = from + 1;
  } else {
    from = Math.ceil(from);
  }

  if (to === Math.round(to)) {
    to = to - 1;
  } else {
    to = Math.floor(to);
  }

  if (to >= from) {
    return to - from + 1;
  } else {
    return 0;
  }
}

async function part1() {
  const input = await loadInput();

  let result = 1;
  for (const race of input) {
    result = result * solutions(race);
  }

  console.log("part1", result);
}

async function part2() {
  const input = await loadInput();

  const result = "";
  console.log("part2", result);
}

part1();
// part2();
