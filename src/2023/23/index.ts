import fs from "fs/promises";
import { identity } from "lodash";
import { join } from "path";
import { Grid } from "../grid";
import Graph from "graphology";
import assert from "assert";
import { Attributes } from "graphology-types";

type Direction = "<" | ">" | "^" | "v";
type Indicator = "#" | "." | Direction;
type EdgeAttributes = {
  distance: number;
};

const directions: Record<Direction, Coordinate> = {
  "^": {
    x: 0,
    y: -1,
  },
  v: {
    x: 0,
    y: 1,
  },
  ">": {
    x: 1,
    y: 0,
  },
  "<": {
    x: -1,
    y: 0,
  },
};

const directionOptions: Record<Direction, Direction[]> = {
  "^": ["^", "<", ">"],
  v: ["v", "<", ">"],
  "<": ["<", "^", "v"],
  ">": [">", "^", "v"],
};

async function loadInput(): Promise<Grid<Indicator>> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
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
  direction: Direction;
};

function coordinateToName(coordinate: Coordinate): string {
  return `${coordinate.x},${coordinate.y}`;
}

function createGraph(
  grid: Grid<Indicator>,
  slippery = true
): Graph<Attributes, EdgeAttributes> {
  const graph = new Graph<Attributes, EdgeAttributes>();

  const [start] = findStartAndEnd(grid);
  const stack: GraphStack[] = [
    {
      coordinate: start,
      direction: "v",
    },
  ];
  graph.addNode(coordinateToName(start));

  while (stack.length > 0) {
    const edgeStart = stack.shift();
    assert(edgeStart !== undefined);

    let previousPosition = edgeStart.coordinate;
    let previousDirection = edgeStart.direction;
    let unidirectional = true;
    let length = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const currentMove = directions[previousDirection];
      assert(currentMove, `Invalid direction ${previousDirection}`);
      const currentPosition = {
        x: previousPosition.x + currentMove.x,
        y: previousPosition.y + currentMove.y,
      };
      length += 1;

      if (slippery) {
        const i = grid.get(currentPosition.x, currentPosition.y);
        assert(i !== undefined);
        if (i in directions) {
          // is a slope
          const nextMove = directions[i as Direction];
          if (
            nextMove.x === currentMove.x * -1 &&
            nextMove.y === currentMove.y * -1
          ) {
            // Opposite direction, dead end
            break;
          }

          previousPosition = currentPosition;
          previousDirection = i as Direction;
          unidirectional = false;
          continue;
        }
      }

      const nextDirections = directionOptions[previousDirection];
      const validNextDirections = nextDirections.filter((nextDirections) => {
        const nextMove = directions[nextDirections];
        const nextCoordinate = {
          x: currentPosition.x + nextMove.x,
          y: currentPosition.y + nextMove.y,
        };

        const i = grid.get(nextCoordinate.x, nextCoordinate.y);

        return i !== undefined && i !== "#";
      });

      if (validNextDirections.length !== 1) {
        const startNode = coordinateToName(edgeStart.coordinate);
        const endNode = coordinateToName(currentPosition);

        if (!graph.hasNode(endNode)) {
          for (const nextDirection of validNextDirections) {
            stack.push({
              coordinate: currentPosition,
              direction: nextDirection,
            });
          }
          graph.addNode(endNode);
        }

        if (unidirectional) {
          if (!graph.hasUndirectedEdge(startNode, endNode)) {
            graph.addUndirectedEdge(startNode, endNode, {
              distance: length,
            });
          }
        } else {
          if (
            !graph.hasUndirectedEdge(startNode, endNode) &&
            !graph.hasDirectedEdge(startNode, endNode)
          ) {
            graph.addDirectedEdge(startNode, endNode, {
              distance: length,
            });
          }
        }
        break;
      } else {
        previousPosition = currentPosition;
        previousDirection = validNextDirections[0];
      }
    }
  }

  return graph;
}

type Coordinate = {
  x: number;
  y: number;
};

function findStartAndEnd(grid: Grid<Indicator>): [Coordinate, Coordinate] {
  const yRange = grid.getYRange();

  const startY = yRange.min;
  assert(startY !== undefined);
  const startRow = grid.getXRange(startY);
  const startX = startRow.asArray()?.find((x) => grid.get(x, startY) === ".");
  assert(startX !== undefined);
  const start = { x: startX, y: startY };

  const endY = yRange.max;
  assert(endY !== undefined);
  const endRow = grid.getXRange(endY);
  const endX = endRow.asArray()?.find((x) => grid.get(x, endY) === ".");
  assert(endX !== undefined);
  const end = { x: endX, y: endY };

  return [start, end];
}

type Candidate = {
  position: string;
  visited: Set<string>;
  distance: number;
};

function findLongestPath(grid: Grid<Indicator>, slippery: boolean): number {
  const graph = createGraph(grid, slippery);

  const [start, end] = findStartAndEnd(grid);
  const startNode = coordinateToName(start);
  const endNode = coordinateToName(end);

  const initial: Candidate = {
    position: startNode,
    visited: new Set<string>(),
    distance: 0,
  };
  const stack: Candidate[] = [initial];

  let iterations = 0;
  let bestSolution = initial;
  let candidate: Candidate | undefined;
  while ((candidate = stack.shift()) !== undefined) {
    const { position, visited, distance } = candidate;

    const newVisisted = new Set([...visited, position]);

    const neighbors = slippery
      ? graph.outNeighbors(position)
      : graph.neighbors(position);
    for (const newPosition of neighbors) {
      if (visited.has(newPosition)) {
        // Already visited, cannot go in loops
        continue;
      }

      const newDistance =
        distance + graph.getEdgeAttribute(position, newPosition, "distance");
      const nextSolution = {
        position: newPosition,
        visited: newVisisted,
        distance: newDistance,
      };

      if (newPosition === endNode) {
        // Reached end
        if (bestSolution.distance < nextSolution.distance) {
          bestSolution = nextSolution;
          console.log(
            "current best",
            candidate.distance,
            "(" + [...candidate.visited].join("; ") + ")"
          );
        }
      } else {
        stack.unshift(nextSolution);
      }
    }

    if (++iterations % 10000 === 0) {
      console.log(`Iterations: ${iterations} (Stack: ${stack.length})`);
    }
  }

  assert(bestSolution !== undefined);

  return bestSolution.distance;
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
  await part2();
}

main();
