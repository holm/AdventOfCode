import assert from "assert";
import fs from "fs/promises";
import { identity, sum } from "lodash";
import { join } from "path";

type Feature = "x" | "m" | "a" | "s";
type Part = Record<Feature, number>;
type Condition = "<" | ">";
type Result = "A" | "R" | string;

type Rule = {
  feature: Feature;
  condition: Condition;
  threshold: number;
  result: Result;
};
type Workflow = {
  rules: Rule[];
  defaultResult: Result;
};

type Workflows = Record<string, Workflow>;

type Input = {
  workflows: Workflows;
  parts: Part[];
};

const reIdentifier = "[a-z]+";
const reRule = new RegExp("^([xmas])(<|>)(\\d+):(" + reIdentifier + "|A|R)$");
const reWorkflowMain = new RegExp("^(" + reIdentifier + "){(.*)}$");

async function loadInput(): Promise<Input> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  const [workflowsRaw, partsRaw] = data.split("\n\n");

  const workflows = Object.fromEntries(
    workflowsRaw
      .split("\n")
      .filter(identity)
      .map((workflowRaw) => {
        const workflowMain = workflowRaw.match(reWorkflowMain);
        assert(workflowMain);

        const name = workflowMain[1];

        const rulesRaw = workflowMain[2].split(",");
        const defaultResult = rulesRaw.pop();

        const rules = rulesRaw.map((ruleRaw) => {
          const ruleParts = ruleRaw.match(reRule);
          assert(ruleParts);

          return {
            feature: ruleParts[1] as Feature,
            condition: ruleParts[2] as Condition,
            threshold: parseInt(ruleParts[3]),
            result: ruleParts[4],
          } as Rule;
        });

        const workflow = { rules, defaultResult } as Workflow;

        return [name, workflow];
      })
  );

  const parts = partsRaw
    .split("\n")
    .filter(identity)
    .map((partRaw) => {
      const featuresRaw = partRaw.substring(1, partRaw.length - 1).split(",");

      return Object.fromEntries(
        featuresRaw.map((featureRaw) => {
          const [name, valueRaw] = featureRaw.split("=");

          return [name as Feature, parseInt(valueRaw)];
        })
      ) as Part;
    });

  return { workflows, parts };
}

function isAccepted(part: Part, workflows: Workflows, next: string): boolean {
  if (next === "A") {
    return true;
  } else if (next === "R") {
    return false;
  }

  const workflow = workflows[next];
  assert(workflow);

  for (const rule of workflow.rules) {
    const partValue = part[rule.feature];
    if (
      (rule.condition === "<" && partValue < rule.threshold) ||
      (rule.condition === ">" && partValue > rule.threshold)
    ) {
      return isAccepted(part, workflows, rule.result);
    }
  }

  return isAccepted(part, workflows, workflow.defaultResult);
}

async function part1() {
  const input = await loadInput();

  const acceptedParts = input.parts.filter((part) => {
    return isAccepted(part, input.workflows, "in");
  });

  const result = sum(
    acceptedParts.map((part) => {
      return sum(Object.values(part));
    })
  );
  console.log("part1", result);
}

async function part2() {
  const input = await loadInput();

  const result = input;
  console.log("part2", result);
}

async function main() {
  await part1();
  // await part2();
}

main();
