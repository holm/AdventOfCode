import assert from "assert";
import fs from "fs/promises";
import { identity } from "lodash";
import { join } from "path";
import Graph from "node-dijkstra";

type Problem = {
  graph: Graph;
  start: string;
  end: string;
  potentialStarts: string[];
};

function getHeight(grid: string[][], l: number, c: number): number {
  let char = grid[l][c];

  if (char === "S") {
    char = "a";
  } else if (char === "E") {
    char = "z";
  }

  return char.charCodeAt(0) - "a".charCodeAt(0);
}

function getName(l: number, c: number): string {
  return `${l}-${c}`;
}

async function loadInput(): Promise<Problem> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  let start: string | null = null;
  let end: string | null = null;
  const potentialStarts: string[] = [];

  const graph = new Graph();

  const grid = data
    .split("\n")
    .filter(identity)
    .map((line) => line.split(""));

  for (let l = 0; l < grid.length; l++) {
    const line = grid[l];
    for (let c = 0; c < line.length; c++) {
      const name = getName(l, c);

      const char = line[c];
      if (char === "S") {
        start = name;
      } else if (char === "E") {
        end = name;
      } else if (char === "a") {
        potentialStarts.push(name);
      }

      const height = getHeight(grid, l, c);

      const neighbours: Record<string, number> = {};

      const checkNeighbour = (oL: number, oC: number): void => {
        const otherHeight = getHeight(grid, oL, oC);
        if (otherHeight - height <= 1) {
          neighbours[getName(oL, oC)] = 1;
        }
      };

      if (c > 0) {
        checkNeighbour(l, c - 1);
      }
      if (c < line.length - 1) {
        checkNeighbour(l, c + 1);
      }
      if (l > 0) {
        checkNeighbour(l - 1, c);
      }
      if (l < grid.length - 1) {
        checkNeighbour(l + 1, c);
      }

      graph.addNode(name, neighbours);
    }
  }

  assert(start);
  assert(end);

  return {
    graph,
    start,
    end,
    potentialStarts,
  };
}

function part1(problem: Problem): number {
  const path = problem.graph.path(problem.start, problem.end);

  assert(Array.isArray(path));

  return path.length - 1;
}

function part2(problem: Problem): number {
  const lengths = problem.potentialStarts.map((start) => {
    const path = problem.graph.path(start, problem.end);

    if (Array.isArray(path)) {
      return path.length - 1;
    } else {
      return 0;
    }
  });

  return lengths.filter((l) => l !== 0).sort((a, b) => a - b)[0];
}

async function main() {
  const problem = await loadInput();

  console.log(part1(problem));
  console.log(part2(problem));
}

main();
