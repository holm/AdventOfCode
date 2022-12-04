import fs from "fs/promises";
import { identity, last, sortBy, sum, sumBy } from "lodash";
import { join } from "path";
import permutations from "just-permutations";

type Sign = "Rock" | "Paper" | "Scissor";
type InputCode = "A" | "B" | "C";
type OutputCode = "X" | "Y" | "Z";

type Strategy = {
  input: InputCode;
  output: OutputCode;
};

type InputMapping = Record<InputCode, Sign>;
type OutputMapping = Record<OutputCode, Sign>;

const inputMapping: InputMapping = {
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

function getMatchScore(otherSign: Sign, mySign: Sign): number {
  if (otherSign === mySign) {
    return 3; // Draw
  } else if (beats[mySign] === otherSign) {
    return 6; // Win
  } else {
    return 0; // Lost
  }
}

function generateOutputMappings(): OutputMapping[] {
  return permutations(["Rock", "Paper", "Scissor"] as Sign[]).map((signs) => {
    return {
      X: signs[0],
      Y: signs[1],
      Z: signs[2],
    };
  });
}

function evaluateMapping(
  strategies: Strategy[],
  outputMapping: OutputMapping
): number {
  return sumBy(strategies, (strategy) => {
    const otherSign = inputMapping[strategy.input];
    const mySign = outputMapping[strategy.output];

    const signScore = signScores[mySign];
    const matchScore = getMatchScore(otherSign, mySign);

    return signScore + matchScore;
  });
}

async function main() {
  const strategies = await loadInput();

  const outputMappings = generateOutputMappings();

  for (const outputMapping of outputMappings) {
    const result = evaluateMapping(strategies, outputMapping);

    console.log(result);
  }
}

main();
