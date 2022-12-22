import assert from "assert";
import fs from "fs/promises";
import { identity } from "lodash";
import { join } from "path";

async function loadInput(name = "input"): Promise<number[]> {
  const data = await fs.readFile(join(__dirname, `${name}.txt`), {
    encoding: "utf-8",
  });

  return data
    .split("\n")
    .filter(identity)
    .map((value) => parseInt(value));
}

function printList(start: Entry): void {
  const values: number[] = [];
  let current = start;
  do {
    values.push(current.value);
    current = current.next;
  } while (current !== start);

  console.log(values.join(", "));
}

function validateList(start: Entry, length: number): void {
  let current = start;
  let count = 0;

  do {
    assert(current.next.prev === current);
    assert(current.prev.next === current);
    current = current.next;
    count += 1;
  } while (current !== start);

  assert(count === length);
}

type Entry = {
  value: number;
  prev: Entry;
  next: Entry;
};

function moveForward(entry: Entry, distance: number): Entry {
  let current = entry;

  for (let i = 0; i < distance; i++) {
    current = current.next;
  }

  return current;
}

function part1(input: number[]): number {
  const entries = input.map((value) => ({ value } as Entry));

  for (const [idx, entry] of entries.entries()) {
    entry.prev = entries[idx === 0 ? input.length - 1 : idx - 1];
    entry.next = entries[idx === input.length - 1 ? 0 : idx + 1];
  }

  // printList(entries[0]);

  for (const entry of entries) {
    let netMove = entry.value % input.length;
    if (netMove < 0) {
      netMove += input.length - 1;
      netMove = netMove % input.length;
    }

    console.log(entry.value, netMove);
    assert(netMove >= 0);
    if (netMove > 0) {
      const current = moveForward(entry, netMove);

      entry.next.prev = entry.prev;
      entry.prev.next = entry.next;

      entry.prev = current;
      entry.next = current.next;

      current.next.prev = entry;
      current.next = entry;

      validateList(entry, input.length);
    }
    // console.log("moved", entry.value);
    // printList(entry);
  }

  let entry = entries[0];
  while (entry.value !== 0) {
    entry = entry.next;
  }

  const first = moveForward(entry, 1000);
  const second = moveForward(first, 1000);
  const third = moveForward(second, 1000);

  console.log(first.value, second.value, third.value);

  return first.value + second.value + third.value;
}

function part2(input: number[]): number {
  return 0;
}

async function main() {
  console.log(part1(await loadInput("test")));
  console.log(part1(await loadInput()));
  // console.log(part2(await loadInput("test")));
  // console.log(part2(await loadInput()));
}

main();
