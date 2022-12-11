import fs from "fs/promises";
import { chunk, identity, sumBy } from "lodash";
import { join } from "path";

type InstructionType = "noop" | "addx";

type Instruction = { type: "noop" } | { type: "addx"; value: number };

const CYCLE_COUNT: Record<InstructionType, number> = {
  noop: 1,
  addx: 2,
};

const STRENGTH_CYCLES = [20, 60, 100, 140, 180, 220];

async function loadInput(): Promise<Instruction[]> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  const rows = data.split("\n").filter(identity);

  return rows.map((row) => {
    const [type, value] = row.split(" ");

    if (type === "noop") {
      return {
        type,
      };
    } else if (type === "addx") {
      return {
        type,
        value: parseInt(value),
      };
    }

    throw new Error(`Unknown instruction type ${type}`);
  });
}

class CPU {
  x = 1;
  xAtCycles: number[] = [];
  screen: string[] = [];

  cycle() {
    const spritePosition = this.xAtCycles.length % 40;
    const drawPixel =
      this.x >= spritePosition - 1 && this.x <= spritePosition + 1;
    this.screen.push(drawPixel ? "#" : ".");

    this.xAtCycles.push(this.x);
  }

  execute(instruction: Instruction): void {
    const cycleCount = CYCLE_COUNT[instruction.type];

    for (let c = 0; c < cycleCount; c++) {
      this.cycle();
    }

    if (instruction.type === "addx") {
      this.x += instruction.value;
    }
  }

  get signalStrength(): number {
    return sumBy(STRENGTH_CYCLES, (cycle) => cycle * this.xAtCycles[cycle - 1]);
  }

  render(): void {
    for (const line of chunk(this.screen, 40)) {
      console.log(line.join(""));
    }
  }
}

function part1(instructions: Instruction[]): number {
  const cpu = new CPU();

  for (const instruction of instructions) {
    cpu.execute(instruction);
  }

  return cpu.signalStrength;
}

function part2(instructions: Instruction[]): number {
  const cpu = new CPU();

  for (const instruction of instructions) {
    cpu.execute(instruction);
  }

  cpu.render();

  return 0;
}

async function main() {
  const instructions = await loadInput();

  console.log(part1(instructions));
  console.log(part2(instructions));
}

main();
