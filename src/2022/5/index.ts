import assert from "assert";
import fs from "fs/promises";
import { identity } from "lodash";
import { join } from "path";

type Stack = string[];

type Move = {
  from: number;
  to: number;
  count: number;
};

async function loadInput(): Promise<[Stack[], Move[]]> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  const [stacksRaw, movesRaw] = data.split("\n\n");

  return [parseStacks(stacksRaw), parseMoves(movesRaw)];
}

function parseStacks(stacksRaw: string): Stack[] {
  const stackLines = stacksRaw.split("\n");

  const numberLine = stackLines[stackLines.length - 1];
  const stackNumbers = numberLine
    .split(" ")
    .filter(identity)
    .map((number) => parseInt(number));

  const numberOfStacks = stackNumbers.length;
  const stackDepth = stackLines.length - 1;

  const stacks: Stack[] = [];

  for (let s = 0; s < numberOfStacks; s++) {
    const stack = [];

    for (let d = 0; d < stackDepth; d++) {
      const crate = stackLines[stackDepth - d - 1].charAt(s * 4 + 1);
      if (crate !== " ") {
        stack.push(crate);
      }
    }

    stacks.push(stack);
  }

  return stacks;
}

const reMove = /move (\d+) from (\d+) to (\d+)/;

function parseMoves(movesRaw: string): Move[] {
  const moveLines = movesRaw.split("\n").filter(identity);

  return moveLines.map((moveLine) => {
    const match = moveLine.match(reMove);
    assert(match);

    return {
      from: parseInt(match[2]),
      to: parseInt(match[3]),
      count: parseInt(match[1]),
    };
  });
}

function performMove9000(stacks: Stack[], move: Move) {
  const fromStack = stacks[move.from - 1];
  const toStack = stacks[move.to - 1];

  for (let c = 0; c < move.count; c++) {
    toStack.push(fromStack.pop() as string);
  }
}

function getTopStacks(stacks: Stack[]): string {
  return stacks.map((stack) => stack[stack.length - 1]).join("");
}

async function part1(): Promise<string> {
  const [stacks, moves] = await loadInput();

  for (const move of moves) {
    performMove9000(stacks, move);
  }

  return getTopStacks(stacks);
}

function performMove9001(stacks: Stack[], move: Move) {
  const fromStack = stacks[move.from - 1];
  const toStack = stacks[move.to - 1];

  toStack.push(...fromStack.splice(fromStack.length - move.count, move.count));
}

async function part2(): Promise<string> {
  const [stacks, moves] = await loadInput();

  for (const move of moves) {
    performMove9001(stacks, move);
  }

  return getTopStacks(stacks);
}

async function main() {
  console.log(await part1());
  console.log(await part2());
}

main();
