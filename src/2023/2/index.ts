import fs from "fs/promises";
import { identity, sumBy } from "lodash";
import { join } from "path";

const colors = ["red", "green", "blue"] as const;
type Color = (typeof colors)[number];
type Grab = Record<Color, number>;
type Game = {
  id: number;
  grabs: Grab[];
};

async function loadInput(): Promise<Game[]> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  const lines = data.split("\n").filter(identity);

  return lines.map((line) => {
    const [game, rawGrabs] = line.split(": ");

    const id = parseInt(game.split(" ")[1]);

    const grabs = rawGrabs.split("; ").map((rawGrab) => {
      const cubes = rawGrab.split(", ");

      return Object.fromEntries(
        cubes.map((cube) => {
          const [count, color] = cube.split(" ");

          return [color as Color, parseInt(count)];
        })
      ) as Grab;
    });

    return { id, grabs };
  });
}

async function main() {
  const games = await loadInput();

  const limit = {
    red: 12,
    green: 13,
    blue: 14,
  } as Grab;

  const validGames = games.filter((game) => {
    for (const color of colors) {
      const colorLimit = limit[color];

      for (const grab of game.grabs) {
        const found = grab[color];
        if (found && (!colorLimit || colorLimit < found)) {
          return false;
        }
      }
    }

    return true;
  });

  const result = sumBy(validGames, (game) => game.id);

  console.log(result);
}

main();
