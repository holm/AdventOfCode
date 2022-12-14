import assert from "assert";
import fs from "fs/promises";
import { last, sum } from "lodash";
import { join } from "path";

type PacketData = number | Array<PacketData>;
type Packet = Array<PacketData>;
type PacketPair = [Packet, Packet];

function parseData(data: string): PacketData {
  const stack: PacketData[] = [[]];
  let pos = 1;

  while (pos < data.length - 1) {
    if (data.charAt(pos) === "[") {
      const newArray: PacketData[] = [];

      const currentArray = last(stack);
      assert(Array.isArray(currentArray));
      currentArray.push(newArray);

      stack.push(newArray);
      pos++;
    } else if (data.charAt(pos) === "]") {
      stack.pop();
      pos++;
    } else if (data.charAt(pos) === ",") {
      pos++;
    } else {
      const nextComma = data.indexOf(",", pos);
      const nextArrayEnd = data.indexOf("]", pos);
      const next =
        nextComma !== -1
          ? nextArrayEnd !== -1
            ? Math.min(nextComma, nextArrayEnd)
            : nextComma
          : nextArrayEnd !== -1
          ? nextArrayEnd
          : undefined;

      const substr = data.substring(pos, next);
      const value = parseInt(substr);
      const currentArray = last(stack);
      assert(Array.isArray(currentArray));
      currentArray.push(value);

      pos += substr.length;
    }
  }

  assert(stack.length === 1);

  return stack[0];
}

async function loadInput(): Promise<PacketPair[]> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  return data.split("\n\n").map((lines) => {
    const pairLines = lines.split("\n");
    assert(pairLines.length === 2);

    return pairLines.map((line) => {
      return parseData(line);
    }) as PacketPair;
  });
}

function compare(left: PacketData, right: PacketData): number {
  if (Array.isArray(left) && Array.isArray(right)) {
    for (let i = 0; i < Math.max(left.length, right.length); i++) {
      const lVal = left[i];
      const rVal = right[i];

      if (lVal === undefined) {
        return 1;
      } else if (rVal === undefined) {
        return -1;
      } else {
        const subOrdered = compare(lVal, rVal);
        if (subOrdered !== 0) {
          return subOrdered;
        }
      }
    }

    return 0;
  } else if (Array.isArray(left)) {
    return compare(left, [right]);
  } else if (Array.isArray(right)) {
    return compare([left], right);
  } else {
    return Math.sign(right - left);
  }
}

function part1(pairs: PacketPair[]): number {
  const orderedIndices: number[] = [];

  for (const [idx, pair] of pairs.entries()) {
    const res = compare(pair[0], pair[1]);
    if (res !== -1) {
      orderedIndices.push(idx);
    }
  }

  return sum(orderedIndices) + orderedIndices.length;
}

function part2(pairs: PacketPair[]): number {
  const dividers = [[[2]], [[6]]];

  const allPackets: Packet = [...dividers];
  for (const pair of pairs) {
    allPackets.push(pair[0], pair[1]);
  }

  allPackets.sort(compare).reverse();

  const dividerIndices = dividers.map(
    (divider) => allPackets.indexOf(divider) + 1
  );

  return dividerIndices[0] * dividerIndices[1];
}

async function main() {
  const packetPairs = await loadInput();

  console.log(part1(packetPairs));
  console.log(part2(packetPairs));
}

main();
