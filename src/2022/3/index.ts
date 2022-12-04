import fs from "fs/promises";
import { chunk, identity, sumBy } from "lodash";
import { join } from "path";

type Item = string;

type Pack = {
  left: Set<Item>;
  right: Set<Item>;
  all: Set<Item>;
};

async function loadInput(): Promise<Pack[]> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  const packsRaw = data.split("\n").filter(identity);

  return packsRaw.map((packRaw) => {
    const allItems = packRaw.split("");

    const total = allItems.length;

    return {
      left: new Set(allItems.slice(0, total / 2)),
      right: new Set(allItems.slice(total / 2)),
      all: new Set(allItems),
    };
  });
}

function getPriority(item: Item): number {
  const charCode = item.charCodeAt(0);

  if (charCode < 97) {
    return charCode - 64 + 26;
  } else {
    return charCode - 96;
  }
}

function intersection(a: Set<Item>, b: Set<Item>): Set<Item> {
  return new Set(Array.from(a).filter((item) => b.has(item)));
}

function part1(packs: Pack[]): number {
  return sumBy(packs, (pack) => {
    const duplicateItems = intersection(pack.left, pack.right);

    const duplicateItem = duplicateItems.values().next().value;

    return getPriority(duplicateItem);
  });
}

function part2(packs: Pack[]) {
  const groups = chunk(packs, 3);

  return sumBy(groups, (group) => {
    const duplicateItems = intersection(
      intersection(group[0].all, group[1].all),
      group[2].all
    );

    const duplicateItem = duplicateItems.values().next().value;

    return getPriority(duplicateItem);
  });
}

async function main() {
  const packs = await loadInput();

  console.log(part1(packs));
  console.log(part2(packs));
}

main();
