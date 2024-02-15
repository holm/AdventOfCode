import fs from "fs/promises";
import { identity, range, sum } from "lodash";
import { join } from "path";
import { Grid } from "../grid";
import assert from "assert";

async function loadInput(): Promise<Grid<string>> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  const grid = new Grid<string>();

  const lines = data.split("\n").filter(identity);
  for (const [y, line] of lines.entries()) {
    for (const [x, char] of Array.from(line).entries()) {
      grid.set(x, y, char);
    }
  }

  return grid;
}

function isDigit(c: string | undefined): boolean {
  return c !== undefined && c >= "0" && c <= "9";
}

function isSymbol(c: string | undefined): boolean {
  return c !== undefined && c !== "." && !isDigit(c);
}

async function part1() {
  const grid = await loadInput();

  const yArray = grid.getYRange().asArray();
  assert(yArray);

  const validParts: number[] = [];

  for (const y of yArray) {
    const xRange = grid.getXRange(y);
    if (xRange.min === undefined || xRange.max === undefined) {
      continue;
    }

    let xStart = xRange.min;
    while (xStart <= xRange.max) {
      const val = grid.get(xStart, y);
      if (isDigit(val)) {
        let xEnd = xStart + 1;
        while (xEnd <= xRange.max) {
          if (isDigit(grid.get(xEnd, y))) {
            xEnd += 1;
          } else {
            break;
          }
        }

        const partNumber = parseInt(
          range(xStart, xEnd)
            .map((x) => grid.get(x, y))
            .join("")
        );

        let validPart = false;
        for (let xCheck = xStart - 1; xCheck <= xEnd; xCheck++) {
          if (
            isSymbol(grid.get(xCheck, y - 1)) ||
            isSymbol(grid.get(xCheck, y + 1)) ||
            (xCheck == xStart - 1 && isSymbol(grid.get(xCheck, y))) ||
            (xCheck == xEnd && isSymbol(grid.get(xCheck, y)))
          ) {
            validPart = true;
            break;
          }
        }

        if (validPart) {
          validParts.push(partNumber);
        }

        xStart = xEnd;
      } else {
        xStart += 1;
      }
    }
  }

  const result = sum(validParts);
  console.log(result);
}

async function part2() {
  const grid = await loadInput();
}

part1();
// part2();
