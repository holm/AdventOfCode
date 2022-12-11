import assert from "assert";
import fs from "fs/promises";
import { identity, sortBy } from "lodash";
import { join } from "path";

type WorryOperation = (old: number) => number;

type ItemThrows = {
  item: number;
  monkey: number;
};

class Monkey {
  items: number[];
  operation: WorryOperation;
  divisor: number;
  successTarget: number;
  failureTarget: number;
  inspections = 0;

  constructor(
    items: number[],
    operation: WorryOperation,
    divisor: number,
    successTarget: number,
    failureTarget: number
  ) {
    this.items = items;
    this.operation = operation;
    this.divisor = divisor;
    this.successTarget = successTarget;
    this.failureTarget = failureTarget;
  }

  processItems(relaxOperation: WorryOperation): ItemThrows[] {
    const targets = this.items.map((item) => {
      const increasedWorry = this.operation(item);
      const relaxedWorry = relaxOperation(increasedWorry);
      const remainder = relaxedWorry % this.divisor;
      const success = remainder === 0;

      this.inspections = this.inspections + 1;

      return {
        item: relaxedWorry,
        monkey: success ? this.successTarget : this.failureTarget,
      };
    });

    this.items = [];

    return targets;
  }
}

async function loadInput(): Promise<Monkey[]> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  const monkeysRaw = data.split("\n\n").filter(identity);

  return monkeysRaw.map((monkeyRaw) => {
    const lines = monkeyRaw.split("\n");

    const itemsMatch = lines[1].match(/ {2}Starting items: ((\d+)(, \d+)*)/);
    assert(itemsMatch);
    const items = itemsMatch[1].split(", ").map((itemRaw) => parseInt(itemRaw));

    const operationMatch = lines[2].match(
      / {2}Operation: new = ((\d+)|old) ([*+]) ((\d+)|old)/
    );
    assert(operationMatch);

    const leftValue =
      operationMatch[1] === "old" ? "old" : parseInt(operationMatch[1]);
    const operationType = operationMatch[3];
    const rightValue =
      operationMatch[4] === "old" ? "old" : parseInt(operationMatch[4]);

    const operation: WorryOperation = (old: number) => {
      const left = leftValue === "old" ? old : leftValue;
      const right = rightValue === "old" ? old : rightValue;

      if (operationType === "+") {
        return left + right;
      } else {
        return left * right;
      }
    };

    const divisorMatch = lines[3].match(/ {2}Test: divisible by (\d+)/);
    assert(divisorMatch);
    const divisor = parseInt(divisorMatch[1]);

    const successTargetMatch = lines[4].match(
      / {4}If true: throw to monkey (\d+)/
    );
    assert(successTargetMatch);
    const successTarget = parseInt(successTargetMatch[1]);

    const failureTargetMatch = lines[5].match(
      / {4}If false: throw to monkey (\d+)/
    );
    assert(failureTargetMatch);
    const failureTarget = parseInt(failureTargetMatch[1]);

    return new Monkey(items, operation, divisor, successTarget, failureTarget);
  });
}

function round(monkeys: Monkey[], relaxOperation: WorryOperation): void {
  for (const monkey of monkeys) {
    const throws = monkey.processItems(relaxOperation);
    for (const itemThrow of throws) {
      monkeys[itemThrow.monkey].items.push(itemThrow.item);
    }
  }
}

function monkeyBusiness(monkeys: Monkey[]): number {
  const sortedMonkeys = sortBy(monkeys, (monkey) => -monkey.inspections);

  return sortedMonkeys[0].inspections * sortedMonkeys[1].inspections;
}

function simulate(
  monkeys: Monkey[],
  relaxOperation: WorryOperation,
  rounds: number
): number {
  for (let r = 0; r < rounds; r++) {
    round(monkeys, relaxOperation);
  }

  return monkeyBusiness(monkeys);
}

function getLCM(monkeys: Monkey[]): number {
  const divisors = monkeys.map((monkey) => monkey.divisor);

  return divisors
    .slice(1)
    .reduce((product, divisor) => product * divisor, divisors[0]);
}

function part1(monkeys: Monkey[]): number {
  const relaxOperation: WorryOperation = (old) => Math.floor(old / 3);

  return simulate(monkeys, relaxOperation, 20);
}

function part2(monkeys: Monkey[]): number {
  const lcm = getLCM(monkeys);

  const relaxOperation: WorryOperation = (old) => old % lcm;

  return simulate(monkeys, relaxOperation, 10 * 1000);
}

async function main() {
  console.log(part1(await loadInput()));
  console.log(part2(await loadInput()));
}

main();
