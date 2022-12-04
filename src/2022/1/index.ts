import fs from "fs/promises";
import { identity, last, sortBy, sum } from "lodash";
import { join } from "path";

async function loadInput(): Promise<number[][]> {
  const data = await fs.readFile(join(__dirname, "..", "1", "input.txt"), {
    encoding: "utf-8",
  });

  const elfs = data.split("\n\n");
  const elfWithCalories = elfs.map((calories) =>
    calories.split("\n").filter(identity)
  );

  return elfWithCalories.map((calories) =>
    calories.map((calory) => parseInt(calory))
  );
}

async function main() {
  const elfs = await loadInput();

  const elfTotalCalories = elfs.map((calories) => sum(calories));

  const sortedByCalories = sortBy(elfTotalCalories, identity);

  console.log(last(sortedByCalories));
  console.log(sum(sortedByCalories.slice(-3)));
}

main();
