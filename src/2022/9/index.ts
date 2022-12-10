import assert from "assert";
import fs from "fs/promises";
import { first, identity, last, range } from "lodash";
import { join } from "path";

type Direction = "L" | "R" | "U" | "D";

type Move = {
  direction: Direction;
  steps: number;
};

async function loadInput(): Promise<Move[]> {
  const data = await fs.readFile(join(__dirname, "test2.txt"), {
    encoding: "utf-8",
  });

  const rows = data.split("\n").filter(identity);

  return rows.map((row) => {
    const [direction, steps] = row.split(" ");

    return {
      direction: direction as Direction,
      steps: parseInt(steps),
    };
  });
}

class Coordinate {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  move(diff: Coordinate): void {
    this.x = this.x + diff.x;
    this.y = this.y + diff.y;
  }

  toString(): string {
    return `(${this.x}, ${this.y})`;
  }

  static fromDirection(direction: Direction): Coordinate {
    if (direction === "R") {
      return new Coordinate(1, 0);
    } else if (direction === "L") {
      return new Coordinate(-1, 0);
    } else if (direction === "U") {
      return new Coordinate(0, 1);
    } else if (direction === "D") {
      return new Coordinate(0, -1);
    }

    throw new Error(`Unexpected direction: ${direction}`);
  }
}

class Grid {
  knots: Coordinate[];
  tailVisits = new Set<string>();

  constructor(knotCount: number) {
    assert(knotCount > 0);
    this.knots = range(0, knotCount).map(() => new Coordinate());
    this.tailVisits.add(this.tail.toString());
  }

  get head(): Coordinate {
    return first(this.knots) as Coordinate;
  }

  get tail(): Coordinate {
    return last(this.knots) as Coordinate;
  }

  catchup(knotNo = 0): void {
    const knot = this.knots[knotNo];
    const nextKnot = this.knots[knotNo + 1];

    if (nextKnot === undefined) {
      this.tailVisits.add(knot.toString());
      return;
    }

    const xDiff = knot.x - nextKnot.x;
    const yDiff = knot.y - nextKnot.y;

    const move = new Coordinate(Math.sign(xDiff), Math.sign(yDiff));

    if (Math.abs(xDiff) <= 1 && Math.abs(yDiff) <= 1) {
      return;
    }

    nextKnot.move(move);

    this.catchup(knotNo + 1);
  }

  move(move: Move): void {
    const stepMove = Coordinate.fromDirection(move.direction);

    for (let s = 0; s < move.steps; s++) {
      this.head.move(stepMove);

      this.catchup();
    }
  }
}

function part1(moves: Move[]): number {
  const grid = new Grid(2);

  for (const move of moves) {
    grid.move(move);
  }

  return grid.tailVisits.size;
}

function part2(moves: Move[]): number {
  const grid = new Grid(10);

  for (const move of moves) {
    grid.move(move);
  }

  return grid.tailVisits.size;
}

async function main() {
  const moves = await loadInput();

  console.log(part1(moves));
  console.log(part2(moves));
}

main();
