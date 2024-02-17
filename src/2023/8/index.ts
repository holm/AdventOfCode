import assert from "assert";
import fs from "fs/promises";
import { identity, sum } from "lodash";
import { join } from "path";

type Move = "R" | "L";

type Connections = Record<Move, string>;

type Map = {
  moves: Move[];
  nodes: Record<string, Connections>;
};

const reMove = /(\w{3}) = \((\w{3}), (\w{3})\)/;

async function loadInput(): Promise<Map> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  const [movesRaw, nodesRaw] = data.split("\n\n");

  const moves = movesRaw.split("") as Move[];

  const nodes = Object.fromEntries(
    nodesRaw
      .split("\n")
      .filter(identity)
      .map((line) => {
        const match = line.match(reMove);
        assert(match);

        const [_, id, left, right] = match;

        return [id, { L: left, R: right }];
      })
  );

  return { moves, nodes };
}

function traverse(map: Map): number {
  let location = "AAA";
  let moveCount = 0;

  while (location !== "ZZZ") {
    const nextMove = map.moves[moveCount % map.moves.length];
    location = map.nodes[location][nextMove];
    moveCount++;
  }

  return moveCount;
}

async function part1() {
  const input = await loadInput();

  const result = traverse(input);
  console.log("part1", result);
}

async function part2() {
  const input = await loadInput();

  const result = input;
  console.log("part2", result);
}

async function main() {
  await part1();
  // await part2();
}

main();
