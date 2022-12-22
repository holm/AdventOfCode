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

type LinkedListEntry = {
  value: number;
  prev: LinkedListEntry;
  next: LinkedListEntry;
};

function moveForward(
  entry: LinkedListEntry,
  distance: number
): LinkedListEntry {
  let current = entry;

  for (let i = 0; i < distance; i++) {
    current = current.next;
  }

  return current;
}

function buildLinkedList(input: number[]): LinkedListEntry[] {
  const entries = input.map((value) => ({ value } as LinkedListEntry));

  for (const [idx, entry] of entries.entries()) {
    entry.prev = entries[idx === 0 ? input.length - 1 : idx - 1];
    entry.next = entries[idx === input.length - 1 ? 0 : idx + 1];
  }

  return entries;
}

function findValue(entry: LinkedListEntry, value: number): LinkedListEntry {
  while (entry.value !== value) {
    entry = entry.next;
  }

  return entry;
}

function getCode(entries: LinkedListEntry[]): number {
  const zero = findValue(entries[0], 0);

  const first = moveForward(zero, 1000 % entries.length);
  const second = moveForward(first, 1000 % entries.length);
  const third = moveForward(second, 1000 % entries.length);

  return first.value + second.value + third.value;
}

function mix(entries: LinkedListEntry[]): void {
  for (const entry of entries) {
    let netMove = entry.value % (entries.length - 1);
    if (netMove < 0) {
      netMove += entries.length - 1;
      netMove %= entries.length - 1;
    }

    assert(netMove >= 0 && netMove < entries.length);
    if (netMove > 0) {
      const current = moveForward(entry, netMove);

      entry.next.prev = entry.prev;
      entry.prev.next = entry.next;

      entry.prev = current;
      entry.next = current.next;

      current.next.prev = entry;
      current.next = entry;
    }
  }
}

function part1(input: number[]): number {
  const entries = buildLinkedList(input);

  mix(entries);

  return getCode(entries);
}

const DECRYPTION_KEY = 811589153;

function part2(input: number[]): number {
  input = input.map((value) => value * DECRYPTION_KEY);

  const entries = buildLinkedList(input);

  for (let i = 0; i < 10; i++) {
    mix(entries);
  }

  return getCode(entries);
}

async function main() {
  console.log(part1(await loadInput("test")));
  console.log(part1(await loadInput()));
  console.log(part2(await loadInput("test")));
  console.log(part2(await loadInput()));
}

main();
