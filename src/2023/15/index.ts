import assert from "assert";
import fs from "fs/promises";
import { sum, sumBy, times } from "lodash";
import { join } from "path";

async function loadInput(): Promise<string[]> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  const line = data.split("\n")[0];

  return line.split(",");
}

function computeHash(str: string): number {
  let hash = 0;

  for (let c = 0; c < str.length; c++) {
    hash += str.charCodeAt(c);
    hash *= 17;
    hash %= 256;
  }

  return hash;
}

async function part1() {
  const steps = await loadInput();

  const result = sumBy(steps, (step) => computeHash(step));
  console.log("part1", result);
}

async function part2() {
  const steps = await loadInput();

  const map = times(256).map(() => [] as [string, number][]);

  for (const step of steps) {
    let label: string;
    let operation: "=" | "-";
    let value: number | null;

    if (step.includes("=")) {
      operation = "=";
      const parts = step.split("=");
      label = parts[0];
      value = parseInt(parts[1]);
    } else {
      operation = "-";
      label = step.substring(0, step.length - 1);
      value = null;
    }

    const hashedLabel = computeHash(label);
    const box = map[hashedLabel];

    const existingIdx = box.findIndex(([l]) => l === label);

    if (operation === "=") {
      assert(value !== null);
      if (existingIdx !== -1) {
        box[existingIdx][1] = value;
      } else {
        box.push([label, value]);
      }
    } else if (operation === "-") {
      if (existingIdx !== -1) {
        box.splice(existingIdx, 1);
      }
    }
  }

  const scores = map.map((box, boxIdx) => {
    return (
      (boxIdx + 1) *
      sum(box.map((entry, entryIdx) => (entryIdx + 1) * entry[1]))
    );
  });

  const result = sum(scores);
  console.log("part2", result);
}

async function main() {
  await part1();
  await part2();
}

main();
