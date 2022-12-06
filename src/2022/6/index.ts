import fs from "fs/promises";
import { join } from "path";

async function loadInput(): Promise<string[]> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  return data.split("");
}

function findMarker(buffer: string[], length: number): number {
  for (let i = length - 1; i < buffer.length; i++) {
    if (new Set(buffer.slice(i - length + 1, i + 1)).size === length) {
      return i + 1;
    }
  }

  throw new Error("Marker not found");
}

function part1(buffer: string[]): number {
  return findMarker(buffer, 4);
}

function part2(buffer: string[]): number {
  return findMarker(buffer, 14);
}

async function main() {
  const buffer = await loadInput();

  console.log(part1(buffer));
  console.log(part2(buffer));
}

main();
