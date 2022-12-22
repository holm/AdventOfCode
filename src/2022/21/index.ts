import assert from "assert";
import fs from "fs/promises";
import { identity } from "lodash";
import { join } from "path";

type Lookup = (monkeyId: string) => number;
type Monkey = (lookup: Lookup) => number;
type MonkeyMap = Map<string, Monkey>;

const reMonkey = /^(\w{4}): (((\w{4}) ([+\-*/]) (\w{4}))|(\d+))$/;

async function loadInput(name = "input"): Promise<MonkeyMap> {
  const data = await fs.readFile(join(__dirname, `${name}.txt`), {
    encoding: "utf-8",
  });

  return new Map(
    data
      .split("\n")
      .filter(identity)
      .map((line) => {
        const m = line.match(reMonkey);
        assert(m);

        const name = m[1];

        let monkey: Monkey;

        if (m[7]) {
          const value = parseInt(m[7]);

          monkey = () => value;
        } else {
          const leftId = m[4];
          const operator = m[5];
          const rightId = m[6];

          monkey = (lookup: Lookup) => {
            const leftValue = lookup(leftId);
            const rightValue = lookup(rightId);

            if (operator === "+") {
              return leftValue + rightValue;
            } else if (operator === "-") {
              return leftValue - rightValue;
            } else if (operator === "*") {
              return leftValue * rightValue;
            } else {
              assert(operator === "/");
              return leftValue / rightValue;
            }
          };
        }

        return [name, monkey];
      })
  );
}

function createLookup(monkies: MonkeyMap, human?: number): Lookup {
  const lookup = (monkeyId: string) => {
    if (monkeyId === "humn" && human !== undefined) {
      return human;
    }

    const monkey = monkies.get(monkeyId);
    assert(monkey);

    return monkey(lookup);
  };

  return lookup;
}

function part1(monkies: MonkeyMap): number {
  return createLookup(monkies)("root");
}

function guess(
  monkies: MonkeyMap,
  monkeyId: string,
  target: number,
  value: number,
  step = 1000000000000,
  lastSign = 0
): number {
  const lookup = createLookup(monkies, value);

  const leftValue = lookup(monkeyId);
  const diff = target - leftValue;

  if (diff === 0) {
    return value;
  }

  const diffSign = Math.sign(diff);

  if (lastSign !== 0 && diffSign !== lastSign) {
    step = -step / 2;
  }

  const nextValue = Math.round(value + step);

  return guess(monkies, monkeyId, target, nextValue, step, diffSign);
}

function part2(monkies: MonkeyMap, left: string, right: string): number {
  const lookupZero = createLookup(monkies, 0);
  const lookupOne = createLookup(monkies, 1);

  const leftZero = lookupZero(left);
  const leftOne = lookupOne(left);

  if (leftZero === leftOne) {
    return part2(monkies, right, left);
  }

  const target = lookupZero(right);

  return guess(monkies, left, target, 0, target);
}

async function main() {
  console.log(part1(await loadInput("test")));
  console.log(part1(await loadInput()));
  console.log(part2(await loadInput("test"), "pppw", "sjmn"));
  console.log(part2(await loadInput(), "dbcq", "zmvq"));
}

main();
