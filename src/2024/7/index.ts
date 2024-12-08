import fs from "fs/promises";
import { identity, sum } from "lodash";
import { join } from "path";

type Equation = {
  result: number;
  values: number[];
};

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

function isValidEquation(equation: Equation): boolean {
  const { result, values } = equation;

  if (values.length === 1) {
    return values[0] === result;
  }

  const addEquation = {
    result,
    values: [values[0] + values[1], ...values.slice(2)],
  };
  if (isValidEquation(addEquation)) {
    return true;
  }

  const mulEquation = {
    result,
    values: [values[0] * values[1], ...values.slice(2)],
  };
  if (isValidEquation(mulEquation)) {
    return true;
  }

  return false;
}

async function part1(): Promise<number> {
  const input = await loadInput();

  const validEquations = input.filter((equation) => isValidEquation(equation));

  return sum(validEquations.map((equation) => equation.result));
}

async function part2(): Promise<number> {
  const input = await loadInput();

  return 0;
}

async function main() {
  console.log(await part1());
  // console.log(await part2());
}

main();
