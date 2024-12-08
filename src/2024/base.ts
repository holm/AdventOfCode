import fs from "fs/promises";
import { identity } from "lodash";
import { join } from "path";

async function loadInput(): Promise<string[]> {
  const data = await fs.readFile(join(__dirname, "example.txt"), {
    encoding: "utf-8",
  });

  return data.split("\n").filter(identity);
}

async function part1(): Promise<number> {
  const input = await loadInput();

  return 0;
}

async function part2(): Promise<number> {
  const input = await loadInput();

  return 0;
}

async function main() {
  console.log(await part1());
  // console.log(await part2());
}

main();
