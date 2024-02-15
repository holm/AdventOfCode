import fs from "fs/promises";
import { identity, sum, sumBy } from "lodash";
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

async function part1() {
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

async function part2() {
  const games = await loadInput();

  const powers = games.map((game) => {
    const limit = Object.fromEntries(colors.map((color) => [color, 0])) as Grab;
    for (const grab of game.grabs) {
      for (const [color, count] of Object.entries(grab)) {
        limit[color as Color] = Math.max(count, limit[color as Color]);
      }
    }

    const power = limit.blue * limit.green * limit.red;

    return power;
  });

  const result = sum(powers);

  console.log(result);
}

part1();
part2();
