import fs from "fs/promises";
import { identity, reverse, sum } from "lodash";
import { join } from "path";

type Sequence = number[];

async function loadInput(): Promise<Sequence[]> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  return data
    .split("\n")
    .filter(identity)
    .map((line) => line.split(" ").map((value) => parseInt(value)));
}

function getDifferences(sequence: Sequence): Sequence {
  return sequence
    .slice(0, sequence.length - 1)
    .map((value, idx) => sequence[idx + 1] - value);
}

function getDifferencesStack(sequence: Sequence): Sequence[] {
  const stack = [sequence];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const current = stack[stack.length - 1];
    const next = getDifferences(current);
    stack.push(next);

    if (next.every((value) => value === 0)) {
      break;
    }
  }

  return stack;
}

function predict(sequence: Sequence): number {
  const stack = getDifferencesStack(sequence);

  let prediction = 0;
  for (const entry of reverse(stack)) {
    prediction = entry[entry.length - 1] + prediction;
  }

  return prediction;
}

async function part1() {
  const sequences = await loadInput();

  const predictions = sequences.map((sequence) => predict(sequence));

  const result = sum(predictions);
  console.log("part1", result);
}

async function part2() {
  const sequences = await loadInput();

  const result = sequences;
  console.log("part2", result);
}

async function main() {
  await part1();
  // await part2();
}

main();
