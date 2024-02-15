import fs from "fs/promises";
import { groupBy, identity, range, sumBy } from "lodash";
import { join } from "path";
import { Grid } from "../grid";
import assert from "assert";

const indicators = ["*", "#", "$"] as const;
type Indicator = (typeof indicators)[number];

type Usage = {
  indicator: Indicator;
  x: number;
  y: number;
};

type Part = {
  number: number;
  usage: Usage;
};

async function loadInput(): Promise<Grid<string>> {
  const data = await fs.readFile(join(__dirname, "example.txt"), {
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

function extractParts(grid: Grid<string>): Part[] {
  const yArray = grid.getYRange().asArray();
  assert(yArray);

  const parts: Part[] = [];

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

        checkLoop: for (let xCheck = xStart - 1; xCheck <= xEnd; xCheck++) {
          const yChecks = [y - 1, y + 1];
          if (xCheck == xStart - 1 || xCheck == xEnd) {
            yChecks.push(y);
          }

          for (const yCheck of yChecks) {
            const checkValue = grid.get(xCheck, yCheck);
            if (isSymbol(checkValue)) {
              const usage = {
                indicator: checkValue as Indicator,
                x: xCheck,
                y: yCheck,
              };
              parts.push({
                number: partNumber,
                usage,
              });

              break checkLoop;
            }
          }
        }

        xStart = xEnd;
      } else {
        xStart += 1;
      }
    }
  }

  return parts;
}

async function part1() {
  const grid = await loadInput();
  const parts = extractParts(grid);

  const result = sumBy(parts, (part) => part.number);
  console.log(result);
}

async function part2() {
  const grid = await loadInput();
  const parts = extractParts(grid);

  const gearParts = parts.filter((part) => part.usage.indicator === "*");

  const groupedGearParts = groupBy(
    gearParts,
    (part) => `${part.usage.x}-${part.usage.y}`
  );

  const result = sumBy(Object.values(groupedGearParts), (parts) => {
    if (parts.length === 2) {
      return parts[0].number * parts[1].number;
    } else {
      return 0;
    }
  });
  console.log(result);
}

part1();
part2();
