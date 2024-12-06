import fs from "fs/promises";
import { identity, sum } from "lodash";
import { join } from "path";

async function loadInput(): Promise<string[]> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  return data.split("\n").filter(identity);
}

type Instruction =
  | {
      operation: "mul";
      values: [number, number];
    }
  | {
      operation: "do";
    }
  | {
      operation: "don't";
    };

function parseLine(line: string): Instruction[] {
  const matches = line.matchAll(
    /((do)\(\))|((don't)\(\))|((mul)\((\d{1,3}),(\d{1,3})\))/g
  );

  const instructions: Instruction[] = [];
  for (const match of matches) {
    if (match[2] === "do") {
      instructions.push({ operation: "do" });
    } else if (match[4] === "don't") {
      instructions.push({ operation: "don't" });
    } else if (match[6] === "mul") {
      instructions.push({
        operation: "mul",
        values: [parseInt(match[7]), parseInt(match[8])],
      });
    }
  }

  return instructions;
}

async function run(respectDos: boolean): Promise<number> {
  const lines = await loadInput();

  let execute = true;

  const results: number[] = [];
  for (const line of lines) {
    const instructions = parseLine(line);
    for (const instruction of instructions) {
      if (instruction.operation === "mul") {
        if (!respectDos || execute) {
          results.push(instruction.values[0] * instruction.values[1]);
        }
      } else if (instruction.operation === "do") {
        execute = true;
      } else if (instruction.operation === "don't") {
        execute = false;
      }
    }
  }

  return sum(results);
}

async function part1(): Promise<number> {
  return run(false);
}

async function part2(): Promise<number> {
  return run(true);
}

async function main() {
  console.log(await part1());
  console.log(await part2());
}

main();
