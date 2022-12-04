import fs from "fs/promises";
import { max, reverse, sortBy, sum } from "lodash";
import { join } from "path";

async function loadInput(): Promise<string> {
  return await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });
}

async function main() {
  const data = await loadInput();

  const elfs = data.split("\n\n");
  const elfCalories = elfs
    .map((calories) => calories.split("\n").map((calory) => parseInt(calory)))
    .map((calories) => sum(calories));

  const mostCalories = max(elfCalories);

  console.log(mostCalories);
}

main();
