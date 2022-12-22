import assert from "assert";
import fs from "fs/promises";
import { identity } from "lodash";
import { join } from "path";

type Lookup = (monkeyId: string) => number;
type Monkey = (lookup: Lookup) => number;
type MonkeyMap = Map<string, Monkey>;

const reMonkey = /^(\w{4}): (((\w{4}) ([+\-*\/]) (\w{4}))|(\d+))$/;

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

function part1(monkies: MonkeyMap): number {
  const lookup = (monkeyId: string) => {
    const monkey = monkies.get(monkeyId);
    assert(monkey);

    return monkey(lookup);
  };

  return lookup("root");
}

function part2(monkies: MonkeyMap): number {
  return 0;
}

async function main() {
  console.log(part1(await loadInput("test")));
  console.log(part1(await loadInput()));
  // console.log(part2(await loadInput("test")));
  // console.log(part2(await loadInput()));
}

main();
