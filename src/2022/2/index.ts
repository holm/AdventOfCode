import fs from "fs/promises";
import { identity, invert, max, sumBy } from "lodash";
import { join } from "path";
import permutations from "just-permutations";

type Sign = "Rock" | "Paper" | "Scissor";
type InputCode = "A" | "B" | "C";
type OutputCode = "X" | "Y" | "Z";
type Result = "W" | "L" | "D";

type Strategy = {
  input: InputCode;
  output: OutputCode;
};

const resultScores: Record<Result, number> = {
  W: 6,
  D: 3,
  L: 0,
};

type OutputToSignMapping = Record<OutputCode, Sign>;

const outputToResultMapping: Record<OutputCode, Result> = {
  X: "L",
  Y: "D",
  Z: "W",
};

const inputMapping: Record<InputCode, Sign> = {
  A: "Rock",
  B: "Paper",
  C: "Scissor",
};

const signScores: Record<Sign, number> = {
  Rock: 1,
  Paper: 2,
  Scissor: 3,
};

const beats: Record<Sign, Sign> = {
  Rock: "Scissor",
  Scissor: "Paper",
  Paper: "Rock",
};
const looses = invert(beats) as Record<Sign, Sign>;

async function loadInput(): Promise<Strategy[]> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  const strategiesRaw = data.split("\n").filter(identity);

  return strategiesRaw.map((strateyRaw) => {
    const [input, output] = strateyRaw.split(" ");

    return {
      input,
      output,
    } as Strategy;
  });
}

function getMatchResult(otherSign: Sign, mySign: Sign): Result {
  if (otherSign === mySign) {
    return "D";
  } else if (beats[mySign] === otherSign) {
    return "W";
  } else {
    return "L";
  }
}

function generateOutputToSignMappings(): OutputToSignMapping[] {
  return permutations(["Rock", "Paper", "Scissor"] as Sign[]).map((signs) => {
    return {
      X: signs[0],
      Y: signs[1],
      Z: signs[2],
    };
  });
}

function part1(strategies: Strategy[]): number | undefined {
  const outputMappings = generateOutputToSignMappings();

  const results = outputMappings.map((outputMapping) =>
    sumBy(strategies, (strategy) => {
      const otherSign = inputMapping[strategy.input];
      const mySign = outputMapping[strategy.output];

      const signScore = signScores[mySign];
      const result = getMatchResult(otherSign, mySign);
      const matchScore = resultScores[result];

      return signScore + matchScore;
    })
  );

  return max(results);
}

function part2(strategies: Strategy[]): number {
  return sumBy(strategies, (strategy) => {
    const otherSign = inputMapping[strategy.input];
    const result = outputToResultMapping[strategy.output];

    let mySign: Sign;
    if (result === "L") {
      mySign = beats[otherSign];
    } else if (result === "D") {
      mySign = otherSign;
    } else {
      mySign = looses[otherSign];
    }

    const signScore = signScores[mySign];
    const matchScore = resultScores[result];

    return signScore + matchScore;
  });
}

async function main() {
  const strategies = await loadInput();

  console.log(part1(strategies));
  console.log(part2(strategies));
}

main();
