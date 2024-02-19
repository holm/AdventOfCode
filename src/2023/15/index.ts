import fs from "fs/promises";
import { sumBy } from "lodash";
import { join } from "path";

async function loadInput(): Promise<string[]> {
  const data = await fs.readFile(join(__dirname, "example.txt"), {
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
  const grid = await loadInput();

  const result = "";
  console.log("part2", result);
}

async function main() {
  await part1();
  // await part2();
}

main();
