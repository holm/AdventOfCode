import assert from "assert";
import fs from "fs/promises";
import { identity } from "lodash";
import { join } from "path";

type PulseType = "high" | "low";
type IncomingPulse = {
  type: PulseType;
  source: string;
};
type OutgoingPulse = {
  type: PulseType;
  destination: string;
};
type Network = Record<string, Module>;

abstract class Module {
  inputs: string[];
  outputs: string[];

  constructor(inputs: string[], outputs: string[]) {
    this.inputs = inputs;
    this.outputs = outputs;
  }

  abstract process(pulse: IncomingPulse): OutgoingPulse[];
}

class BroadcastModule extends Module {
  process(pulse: IncomingPulse): OutgoingPulse[] {
    return this.outputs.map((destination) => {
      return { type: pulse.type, destination } as OutgoingPulse;
    });
  }
}

class FlipFlopModule extends Module {
  on = false;

  process(pulse: IncomingPulse): OutgoingPulse[] {
    if (pulse.type === "high") {
      return [];
    } else {
      this.on = !this.on;
      const send: PulseType = this.on ? "high" : "low";

      return this.outputs.map((destination) => {
        return { type: send, destination };
      });
    }
  }
}

class ConjunctionModile extends Module {
  status: Record<string, PulseType> = {};

  process(pulse: IncomingPulse): OutgoingPulse[] {
    this.status[pulse.source] = pulse.type;

    const outputType = this.inputs.every(
      (input) => this.status[input] === "high"
    )
      ? "low"
      : "high";

    return this.outputs.map((output) => {
      return {
        type: outputType,
        destination: output,
      };
    });
  }
}

type ModuleType = "%" | "&" | "b";
type InputLine = {
  type: ModuleType;
  name: string;
  outputs: string[];
};

async function loadInput(): Promise<Network> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  const lines = data
    .split("\n")
    .filter(identity)
    .map((line) => {
      const re = line.match(/^(%|&)?([a-z]+) -> ([a-z]+(, ([a-z]+))*)$/);
      assert(re);

      const type = re[1] || ("b" as ModuleType);
      const name = re[2];
      const outputs = re[3].split(", ");

      return {
        type,
        name,
        outputs,
      } as InputLine;
    });

  const inputsMap: Record<string, string[]> = {};
  for (const line of lines) {
    for (const output of line.outputs) {
      const current = inputsMap[output];
      inputsMap[output] = current ? [...current, line.name] : [line.name];
    }
  }

  const network: Network = {};
  for (const line of lines) {
    const inputs = inputsMap[line.name] || [];

    let module: Module;
    if (line.type === "b") {
      module = new BroadcastModule(inputs, line.outputs);
    } else if (line.type === "%") {
      module = new FlipFlopModule(inputs, line.outputs);
    } else {
      module = new ConjunctionModile(inputs, line.outputs);
    }

    network[line.name] = module;
  }

  return network;
}

type PulseCounts = Record<PulseType, number>;

function press(network: Network, counts: PulseCounts): void {
  const stack = [
    {
      type: "low" as PulseType,
      source: "button",
      destination: "broadcaster",
    },
  ];
  while (stack.length > 0) {
    const pulse = stack.shift();
    assert(pulse);

    // console.log(`${pulse.source} -${pulse.type}-> ${pulse.destination}`);

    counts[pulse.type] = counts[pulse.type] + 1;

    const module = network[pulse.destination];
    if (module === undefined) {
      continue;
    }

    const outgoingPulses = module.process(pulse);
    for (const outgoingPulse of outgoingPulses) {
      stack.push({
        type: outgoingPulse.type,
        source: pulse.destination,
        destination: outgoingPulse.destination,
      });
    }
  }
}

async function part1() {
  const input = await loadInput();

  const counts: PulseCounts = {
    low: 0,
    high: 0,
  };
  for (let i = 0; i < 1000; i++) {
    press(input, counts);
  }

  const result = counts.low * counts.high;
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
