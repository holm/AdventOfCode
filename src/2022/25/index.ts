import { assert } from "console";
import fs from "fs/promises";
import { identity, sum } from "lodash";
import { join } from "path";

type Digit = "2" | "1" | "0" | "-" | "=";
type SNAFU = Digit[];

async function loadInput(name = "input"): Promise<SNAFU[]> {
  const data = await fs.readFile(join(__dirname, `${name}.txt`), {
    encoding: "utf-8",
  });

  return data
    .split("\n")
    .filter(identity)
    .map((line) => line.split("") as SNAFU);
}

const BASE = 5;

function toDecimal(input: SNAFU): number {
  let decimal = 0;

  for (const [idx, digit] of [...input].reverse().entries()) {
    const idxValue = Math.pow(BASE, idx);

    if (digit === "2") {
      decimal += 2 * idxValue;
    } else if (digit === "1") {
      decimal += idxValue;
    } else if (digit === "-") {
      decimal -= idxValue;
    } else if (digit === "=") {
      decimal -= 2 * idxValue;
    }
  }

  return decimal;
}

function fromDecimal(input: number): SNAFU {
  const snafu: SNAFU = [];
  let remainder = input;

  for (let idx = 100; idx >= 0; idx--) {
    const idxValue = Math.pow(BASE, idx);
    const counts = Math.round(remainder / idxValue);

    if (counts !== 0) {
      remainder -= counts * idxValue;
    }

    if (counts === 2) {
      snafu.push("2");
    } else if (counts === 1) {
      snafu.push("1");
    } else if (counts === 0) {
      if (snafu.length > 0) {
        snafu.push("0");
      }
    } else if (counts === -1) {
      snafu.push("-");
    } else if (counts === -2) {
      snafu.push("=");
    } else {
      throw new Error(`Unexpected counts: ${counts}`);
    }
  }

  return snafu;
}

function part1(numbers: SNAFU[]): string {
  const total = sum(numbers.map((number) => toDecimal(number)));

  return fromDecimal(total).join("");
}

function part2(numbers: SNAFU[]): number {
  return 0;
}

async function main() {
  console.log(part1(await loadInput("test")));
  console.log(part1(await loadInput()));
  // console.log(part2(await loadInput("test")));
  // console.log(part2(await loadInput()));
}

main();
