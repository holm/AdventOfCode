import fs from "fs/promises";
import { identity, range } from "lodash";
import { join } from "path";

async function loadInput(): Promise<number[][]> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  const rows = data.split("\n").filter(identity);

  return rows.map((row) => row.split("").map((str) => parseInt(str)));
}

function part1(trees: number[][]): number {
  let visible = 0;

  for (let r = 0; r < trees.length; r++) {
    for (let c = 0; c < trees[r].length; c++) {
      const height = trees[r][c];

      const lSmaller = range(0, r).every((tR) => trees[tR][c] < height);
      const rSmaller = range(r + 1, trees[c].length).every(
        (tR) => trees[tR][c] < height
      );
      const uSmaller = range(0, c).every((tC) => trees[r][tC] < height);
      const dSmaller = range(c + 1, trees.length).every(
        (tC) => trees[r][tC] < height
      );

      if (lSmaller || rSmaller || uSmaller || dSmaller) {
        visible++;
      }
    }
  }

  return visible;
}

function part2(trees: number[][]): number {
  let maxScore = 0;

  for (let r = 0; r < trees.length; r++) {
    for (let c = 0; c < trees[r].length; c++) {
      const height = trees[r][c];

      let lScore = 0;
      for (let tR = r - 1; tR >= 0; tR--) {
        lScore++;
        if (trees[tR][c] >= height) {
          break;
        }
      }

      let rScore = 0;
      for (let tR = r + 1; tR < trees[r].length; tR++) {
        rScore++;
        if (trees[tR][c] >= height) {
          break;
        }
      }

      let uScore = 0;
      for (let cC = c - 1; cC >= 0; cC--) {
        uScore++;
        if (trees[r][cC] >= height) {
          break;
        }
      }

      let dScore = 0;
      for (let cC = c + 1; cC < trees.length; cC++) {
        dScore++;
        if (trees[r][cC] >= height) {
          break;
        }
      }

      const cScore = lScore * rScore * uScore * dScore;
      if (cScore > maxScore) {
        maxScore = cScore;
      }
    }
  }

  return maxScore;
}

async function main() {
  const trees = await loadInput();

  console.log(part1(trees));
  console.log(part2(trees));
}

main();
