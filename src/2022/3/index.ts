import fs from "fs/promises";
import { identity, sumBy } from "lodash";
import { join } from "path";

type Item = string;

type Pack = {
  left: Item[];
  right: Item[];
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
      left: allItems.slice(0, total / 2),
      right: allItems.slice(total / 2),
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

function getPrioritySum(packs: Pack[]) {
  return sumBy(packs, (pack) => {
    const duplicateItem = pack.left.find((item) =>
      pack.right.includes(item)
    ) as Item;

    return getPriority(duplicateItem);
  });
}

async function main() {
  const packs = await loadInput();

  console.log(getPrioritySum(packs));
}

main();
