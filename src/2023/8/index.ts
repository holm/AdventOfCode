import assert from "assert";
import fs from "fs/promises";
import { identity } from "lodash";
import { join } from "path";
import lcm from "compute-lcm";

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

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, id, left, right] = match;

        return [id, { L: left, R: right }];
      })
  );

  return { moves, nodes };
}

function moves(map: Map, start: string, ghost: boolean): number {
  let location = start;
  let result = 0;

  while (ghost ? !location.endsWith("Z") : location !== "ZZZ") {
    const nextMove = map.moves[result % map.moves.length];
    location = map.nodes[location][nextMove];
    result++;
  }

  return result;
}

async function part1() {
  const map = await loadInput();

  const result = moves(map, "AAA", false);
  console.log("part1", result);
}

async function part2() {
  const map = await loadInput();

  const starts = Object.keys(map.nodes).filter((node) => node.endsWith("A"));
  const startMoves = starts.map((start) => moves(map, start, true));

  const result = lcm(startMoves);
  console.log("part2", result);
}

async function main() {
  await part1();
  await part2();
}

main();
