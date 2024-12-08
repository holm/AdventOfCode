import fs from "fs/promises";
import { identity, sum } from "lodash";
import { join } from "path";

type Equation = {
  result: number;
  values: number[];
};
type Operator = "+" | "*" | "||";

async function loadInput(): Promise<Equation[]> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  return data
    .split("\n")
    .filter(identity)
    .map((line) => {
      const [resultRaw, valuesRaw] = line.split(": ");

      return {
        result: parseInt(resultRaw),
        values: valuesRaw.split(" ").map((value) => parseInt(value)),
      };
    });
}

const operatorFunctions: Record<
  Operator,
  (lValue: number, rValue: number) => number
> = {
  "+": (lValue: number, rValue: number) => {
    return lValue + rValue;
  },
  "*": (lValue: number, rValue: number) => {
    return lValue * rValue;
  },
  "||": (lValue: number, rValue: number) => {
    return parseInt(`${lValue}${rValue}`);
  },
};

function isValidEquation(equation: Equation, operators: Operator[]): boolean {
  const { result, values } = equation;

  if (values.length === 1) {
    return values[0] === result;
  }

  for (const operator of operators) {
    const [lValue, rValue, ...restValues] = values;

    const newValue = operatorFunctions[operator](lValue, rValue);

    const newEquation = {
      result,
      values: [newValue, ...restValues],
    };
    if (isValidEquation(newEquation, operators)) {
      return true;
    }
  }

  return false;
}

function getScore(equations: Equation[]): number {
  return sum(equations.map((equation) => equation.result));
}

async function part1(): Promise<number> {
  const equations = await loadInput();

  const validEquations = equations.filter((equation) =>
    isValidEquation(equation, ["+", "*"])
  );

  return getScore(validEquations);
}

async function part2(): Promise<number> {
  const equations = await loadInput();

  const validEquations = equations.filter((equation) =>
    isValidEquation(equation, ["+", "*", "||"])
  );

  return getScore(validEquations);
}

async function main() {
  console.log(await part1());
  console.log(await part2());
}

main();
