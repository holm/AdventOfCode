import fs from "fs/promises";
import { identity, sum } from "lodash";
import { join } from "path";

type PageRule = [number, number];
type ManualUpdate = number[];
type Input = {
  rules: PageRule[];
  updates: ManualUpdate[];
};

async function loadInput(): Promise<Input> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  const [rulesRaw, manualsRaw] = data.split("\n\n");

  const rules = rulesRaw.split("\n").map((rule) => {
    const [aRaw, bRaw] = rule.split("|");

    return [parseInt(aRaw), parseInt(bRaw)] as PageRule;
  });

  const updates = manualsRaw
    .split("\n")
    .filter(identity)
    .map((manual) => {
      return manual
        .split(",")
        .map((update) => parseInt(update)) as ManualUpdate;
    });

  return { rules, updates };
}

function getScore(updates: ManualUpdate[]): number {
  return sum(
    updates.map((update) => {
      return update[(update.length - 1) / 2];
    })
  );
}

function isValidOrder(rules: PageRule[], update: ManualUpdate): boolean {
  for (const [a, b] of rules) {
    const aIdx = update.indexOf(a);
    const bIdx = update.indexOf(b);

    if (aIdx !== -1 && bIdx !== -1 && aIdx > bIdx) {
      return false;
    }
  }

  return true;
}

function correctOrder(rules: PageRule[], update: ManualUpdate): ManualUpdate {
  const updatedOrder = [...update];

  for (const [a, b] of rules) {
    const aIdx = updatedOrder.indexOf(a);
    const bIdx = updatedOrder.indexOf(b);

    if (aIdx !== -1 && bIdx !== -1 && aIdx > bIdx) {
      updatedOrder.splice(aIdx, 1);
      updatedOrder.splice(bIdx, 0, a);
    }
  }

  return updatedOrder;
}

async function part1(): Promise<number> {
  const { rules, updates } = await loadInput();

  const validUpdates = updates.filter((update) => isValidOrder(rules, update));

  return getScore(validUpdates);
}

async function part2(): Promise<number> {
  const { rules, updates } = await loadInput();

  const invalidUpdates = updates.filter(
    (update) => !isValidOrder(rules, update)
  );

  const correctedUpdates = invalidUpdates.map((update) => {
    let correctedUpdate = update;
    while (!isValidOrder(rules, correctedUpdate)) {
      correctedUpdate = correctOrder(rules, correctedUpdate);
    }

    return correctedUpdate;
  });

  return getScore(correctedUpdates);
}

async function main() {
  console.log(await part1());
  console.log(await part2());
}

main();
