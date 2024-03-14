import fs from "fs/promises";
import { identity } from "lodash";
import { join } from "path";
import { Grid } from "../grid";
import Graph from "graphology";
import assert from "assert";

type Indicator = "#" | "." | "<" | ">" | "^" | "v" | "O";
type Direction = "N" | "S" | "E" | "W";

const directions: Record<Direction, Coordinate> = {
  N: {
    x: 0,
    y: -1,
  },
  S: {
    x: 0,
    y: 1,
  },
  E: {
    x: 1,
    y: 0,
  },
  W: {
    x: -1,
    y: 0,
  },
};

const directionOptions: Record<Direction, Direction[]> = {
  N: ["N", "E", "W"],
  S: ["S", "E", "W"],
  E: ["E", "N", "S"],
  W: ["W", "N", "S"],
};

async function loadInput(): Promise<Grid<Indicator>> {
  const data = await fs.readFile(join(__dirname, "example.txt"), {
    encoding: "utf-8",
  });

  const grid = new Grid<Indicator>();

  const lines = data.split("\n").filter(identity);
  for (const [y, line] of lines.entries()) {
    for (const [x, c] of [...line].entries()) {
      grid.set(x, y, c as Indicator);
    }
  }

  return grid;
}

type GraphStack = {
  coordinate: Coordinate;
  direction: "N" | "S" | "E" | "W";
};

function coordinateToName(coordinate: Coordinate): string {
  return `${coordinate.x},${coordinate.y}`;
}

function createGraph(grid: Grid<Indicator>, slippery = true): Graph {
  const graph = new Graph();

  const start = findStart(grid);
  const stack: GraphStack[] = [
    {
      coordinate: start,
      direction: "S",
    },
  ];

  while (stack.length > 0) {
    const next = stack.shift();
    assert(next !== undefined);

    console.log("Looking at", next);

    let current = next;
    let length = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const options = directionOptions[current.direction].map((direction) => {
        const move = directions[direction];
        const coordinate = {
          x: current.coordinate.x + move.x,
          y: current.coordinate.y + move.y,
        };

        return {
          coordinate,
          direction,
        };
      });
      const validOptions = options.filter((option) => {
        const i = grid.get(option.coordinate.x, option.coordinate.y);

        return i !== undefined && i !== "#";
      });

      if (validOptions.length === 1) {
        current = validOptions[0];
        length += 1;
        console.log("continuing on path", length, current);
      } else {
        const startNode = coordinateToName(next.coordinate);
        const endNode = coordinateToName(current.coordinate);

        if (graph.hasUndirectedEdge(startNode, endNode)) {
          break;
        }

        console.log(`Adding edge from ${startNode} to ${endNode}`);

        graph.mergeNode(startNode);
        graph.mergeNode(endNode);

        graph.mergeUndirectedEdge(startNode, endNode, {
          length,
        });

        stack.push(...validOptions);
        break;
      }
    }
  }

  return graph;
}

type Coordinate = {
  x: number;
  y: number;
};

function findStart(grid: Grid<Indicator>): Coordinate {
  const yRange = grid.getYRange();
  const y = yRange.min;
  assert(y !== undefined);

  const firstRow = grid.getXRange(y);
  const x = firstRow.asArray()?.find((x) => grid.get(x, y) === ".");
  assert(x !== undefined);

  return { x, y };
}

function findLongestPath(grid: Grid<Indicator>, slippery: boolean): number {
  const graph = createGraph(grid);

  console.log(graph.export());

  return 0;
}

async function part1() {
  const grid = await loadInput();

  const result = findLongestPath(grid, true);

  console.log("part1", result);
}

async function part2() {
  const grid = await loadInput();

  const result = findLongestPath(grid, false);

  console.log("part2", result);
}

async function main() {
  await part1();
  // await part2();
}

main();
