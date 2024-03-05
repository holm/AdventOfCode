import assert from "assert";
import fs from "fs/promises";
import { identity, sum } from "lodash";
import { join } from "path";

type Feature = "x" | "m" | "a" | "s";
type Part = Record<Feature, number>;
type Comparator = "<" | ">";
type Condition = {
  feature: Feature;
  comparator: Comparator;
  threshold: number;
};
type Result = "A" | "R" | string;
type Range = [number, number];
type Blueprint = Record<Feature, Range>;

type Rule = {
  condition: Condition;
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
            condition: {
              feature: ruleParts[1] as Feature,
              comparator: ruleParts[2] as Comparator,
              threshold: parseInt(ruleParts[3]),
            },
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
    const partValue = part[rule.condition.feature];
    if (
      (rule.condition.comparator === "<" &&
        partValue < rule.condition.threshold) ||
      (rule.condition.comparator === ">" &&
        partValue > rule.condition.threshold)
    ) {
      return isAccepted(part, workflows, rule.result);
    }
  }

  return isAccepted(part, workflows, workflow.defaultResult);
}

function addCondition(
  blueprint: Blueprint,
  condition: Condition
): Blueprint | undefined {
  const currentRange = blueprint[condition.feature];

  if (condition.comparator === "<") {
    if (currentRange[0] >= condition.threshold) {
      return;
    } else if (currentRange[1] >= condition.threshold) {
      return {
        ...blueprint,
        [condition.feature]: [currentRange[0], condition.threshold - 1],
      };
    } else {
      return blueprint;
    }
  } else {
    if (currentRange[1] <= condition.threshold) {
      return;
    } else if (currentRange[0] <= condition.threshold) {
      return {
        ...blueprint,
        [condition.feature]: [condition.threshold + 1, currentRange[1]],
      };
    } else {
      return blueprint;
    }
  }
}

function addConditions(
  blueprint: Blueprint,
  conditions: Condition[]
): Blueprint | undefined {
  for (const condition of conditions) {
    const updatedBlueprint = addCondition(blueprint, condition);
    if (updatedBlueprint === undefined) {
      return undefined;
    }
    blueprint = updatedBlueprint;
  }

  return blueprint;
}

function addConditionsToAll(
  blueprints: Blueprint[],
  conditions: Condition[]
): Blueprint[] {
  const adjustedBlueprints: Blueprint[] = [];

  for (const blueprint of blueprints) {
    const adjustedBlueprint = addConditions(blueprint, conditions);
    if (adjustedBlueprint !== undefined) {
      adjustedBlueprints.push(adjustedBlueprint);
    }
  }

  return adjustedBlueprints;
}

function computeBlueprints(
  existingBlueprints: Blueprint[],
  workflows: Workflows,
  next: string
): Blueprint[] {
  if (next === "A") {
    return existingBlueprints;
  } else if (next === "R") {
    return [];
  }

  const workflow = workflows[next];
  assert(workflow);

  const finalBlueprints = [] as Blueprint[];
  const addedConditions = [] as Condition[];

  for (const rule of workflow.rules) {
    const adjustedBlueprints = addConditionsToAll(existingBlueprints, [
      ...addedConditions,
      rule.condition,
    ]);

    finalBlueprints.push(
      ...computeBlueprints(adjustedBlueprints, workflows, rule.result)
    );

    if (rule.condition.comparator === "<") {
      addedConditions.push({
        feature: rule.condition.feature,
        comparator: ">",
        threshold: rule.condition.threshold - 1,
      });
    } else {
      addedConditions.push({
        feature: rule.condition.feature,
        comparator: "<",
        threshold: rule.condition.threshold + 1,
      });
    }
  }

  const defaultedBlueprints: Blueprint[] = addConditionsToAll(
    existingBlueprints,
    addedConditions
  );
  finalBlueprints.push(
    ...computeBlueprints(defaultedBlueprints, workflows, workflow.defaultResult)
  );

  return finalBlueprints;
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

  const range: Range = [1, 4000];
  const startBlueprint: Blueprint = {
    x: range,
    m: range,
    a: range,
    s: range,
  };

  const blueprints = computeBlueprints([startBlueprint], input.workflows, "in");

  const result = sum(
    blueprints.map((blueprint) => {
      let value = 1;
      for (const [a, b] of Object.values(blueprint)) {
        value = value * (b - a + 1);
      }

      return value;
    })
  );
  console.log("part2", result);
}

async function main() {
  await part1();
  await part2();
}

main();
