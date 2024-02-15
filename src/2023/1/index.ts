import assert from "assert";
import fs from "fs/promises";
import { identity, last, sortBy, sum } from "lodash";
import { join } from "path";

async function loadInput(): Promise<String[]> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  const lines = data.split("\n");

  return lines.filter(identity);
}

const TEXT_MAP = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
};

function lineToDigits(line: String): number[] {
  const numbers: number[] = [];

  for (let i = 0; i < line.length; i++) {
    const char = line.charAt(i);
    if (char >= "0" && char <= "9") {
      numbers.push(parseInt(char));
      continue;
    }

    for (const [key, value] of Object.entries(TEXT_MAP)) {
      if (line.startsWith(key, i)) {
        numbers.push(value);
        continue;
      }
    }
  }

  return numbers;
}

async function main() {
  const lines = await loadInput();

  const numbers = lines.map((line) => {
    const digits = lineToDigits(line);
    assert(digits.length >= 1);

    return 10 * digits[0] + digits[digits.length - 1];
  });

  const result = sum(numbers);

  console.log(result);
}

main();
