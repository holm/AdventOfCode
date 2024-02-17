import fs from "fs/promises";
import { countBy, identity, reverse, size, sum } from "lodash";
import { join } from "path";

const cardValues = [
  "A",
  "K",
  "Q",
  "J",
  "T",
  "9",
  "8",
  "7",
  "6",
  "5",
  "4",
  "3",
  "2",
] as const;
type Card = (typeof cardValues)[number];

type Hand = [Card, Card, Card, Card, Card];

type Game = {
  hand: Hand;
  type: HandType;
  bet: number;
};

const handTypes = [
  "FIVE_KIND",
  "FOUR_KIND",
  "FULL_HOUSE",
  "THREE_KIND",
  "TWO_PAIR",
  "ONE_PAIR",
  "HIGH_CARD",
] as const;
type HandType = (typeof handTypes)[number];

function getType(hand: Hand, jokers: boolean): HandType {
  const countsDict = countBy(hand);

  let jokersCount = 0;
  if (jokers && size(countsDict) !== 1) {
    jokersCount = countsDict["J"];
    delete countsDict["J"];
  }

  const counts = reverse(Object.values(countsDict).sort());
  counts[0] += jokersCount;

  if (counts[0] === 5) {
    return "FIVE_KIND";
  } else if (counts[0] === 4) {
    return "FOUR_KIND";
  } else if (counts[0] === 3) {
    if (counts[1] === 2) {
      return "FULL_HOUSE";
    } else {
      return "THREE_KIND";
    }
  } else if (counts[0] === 2) {
    if (counts[1] === 2) {
      return "TWO_PAIR";
    } else {
      return "ONE_PAIR";
    }
  } else {
    return "HIGH_CARD";
  }
}

async function loadInput(jokers: boolean): Promise<Game[]> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  return data
    .split("\n")
    .filter(identity)
    .map((line) => {
      const [handRaw, betRaw] = line.split(" ");

      const hand = Array.from(handRaw) as Hand;
      const type = getType(hand, jokers);
      const bet = parseInt(betRaw);

      return { hand, type, bet };
    });
}

function gameComparator(a: Game, b: Game): number {
  if (a.type !== b.type) {
    const aTypeIdx = handTypes.indexOf(a.type);
    const bTypeIdx = handTypes.indexOf(b.type);

    return bTypeIdx - aTypeIdx;
  }

  for (let i = 0; i < 5; i++) {
    const aVal = a.hand[i];
    const bVal = b.hand[i];

    if (aVal !== bVal) {
      const aValIdx = cardValues.indexOf(aVal);
      const bValIdx = cardValues.indexOf(bVal);

      return bValIdx - aValIdx;
    }
  }

  return 0;
}

function getWinnings(games: Game[]): number {
  const orderedGames = games.sort(gameComparator);

  return sum(orderedGames.map((game, idx) => (idx + 1) * game.bet));
}

async function part1() {
  const input = await loadInput(false);

  const result = getWinnings(input);
  console.log("part1", result);
}

async function part2() {
  const input = await loadInput(true);

  const result = getWinnings(input);
  console.log("part2", result);
}

async function main() {
  await part1();
  await part2();
}

main();
