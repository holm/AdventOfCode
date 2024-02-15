import fs from "fs/promises";
import { identity, intersection, reverse, sum } from "lodash";
import { join } from "path";

type Card = {
  number: number;
  yours: number[];
  winning: number[];
};

function parseNumbers(numbers: string): number[] {
  return numbers
    .split(" ")
    .filter(identity)
    .map((number) => parseInt(number));
}

async function loadInput(): Promise<Card[]> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  const lines = data.split("\n").filter(identity);

  return lines.map((line) => {
    const [title, numbersRaw] = line.split(": ");
    const number = parseInt(title.split(" ")[1]);

    const [yoursRaw, winningRaw] = numbersRaw.split(" | ");

    return {
      number,
      yours: parseNumbers(yoursRaw),
      winning: parseNumbers(winningRaw),
    } as Card;
  });
}

function getWinningNumbers(card: Card): number[] {
  return intersection(card.winning, card.yours);
}

async function part1() {
  const cards = await loadInput();

  const points = cards.map((card) => {
    const matches = getWinningNumbers(card);
    if (matches.length === 0) {
      return 0;
    } else {
      return Math.pow(2, matches.length - 1);
    }
  });

  const result = sum(points);
  console.log(result);
}

async function part2() {
  const cards = await loadInput();

  const cardValues = new Map<number, number>();

  for (const [idx, card] of reverse([...cards.entries()])) {
    const matches = getWinningNumbers(card);

    const otherValues = matches.map((match, matchIdx) => {
      return cardValues.get(idx + matchIdx + 1);
    });

    const value = 1 + sum(otherValues);

    cardValues.set(idx, value);
  }

  const result = sum([...cardValues.values()]);
  console.log(result);
}

part1();
part2();
