import assert from "assert";
import fs from "fs/promises";
import { identity, sortBy, sumBy } from "lodash";
import { join } from "path";

type Command = {
  cmd: string;
  args: string[];
  output?: string;
};

class Directory {
  name: string;
  parent?: Directory;
  contents: Array<Directory | File>;

  constructor(name: string, parent?: Directory) {
    this.name = name;
    this.parent = parent;
    this.contents = [];
  }

  addContent(content: Directory | File): void {
    this.contents.push(content);
  }

  findContentByName(name: string): Directory | File | undefined {
    return this.contents.find((content) => content.name === name);
  }

  get directories(): Directory[] {
    return this.contents.filter(
      (content) => content instanceof Directory
    ) as Directory[];
  }

  get size(): number {
    return sumBy(this.contents, (content) => content.size);
  }

  toString(): string {
    return `${this.name}: ${this.size}`;
  }
}

class File {
  name: string;
  size: number;

  constructor(name: string, size: number) {
    this.name = name;
    this.size = size;
  }
}

async function loadInput(): Promise<Command[]> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  const commands: Command[] = [];
  for (const match of data.matchAll(/^\$ (\S+)( ?(.*))\n([^$]*)/gm)) {
    commands.push({
      cmd: match[1],
      args: match[3].split(" "),
      output: match[4],
    });
  }

  return commands;
}

function buildDirectories(commands: Command[]): Directory {
  assert(
    commands[0].cmd === "cd" &&
      commands[0].args.length === 1 &&
      commands[0].args[0] === "/"
  );

  const root = new Directory("/");
  let current = root;

  for (const command of commands.slice(1)) {
    if (command.cmd === "ls") {
      const contents = command.output?.split("\n").filter(identity);
      assert(contents);
      for (const content of contents) {
        const [size, name] = content.split(" ");

        if (size === "dir") {
          current.addContent(new Directory(name, current));
        } else {
          current.addContent(new File(name, parseInt(size)));
        }
      }
    } else if (command.cmd === "cd") {
      if (command.args[0] === "..") {
        assert(current.parent);
        current = current.parent;
      } else {
        const subdir = current.findContentByName(command.args[0]);
        assert(subdir);
        assert(subdir instanceof Directory);
        current = subdir;
      }
    } else {
      throw new Error(`Unknown command ${command.cmd}`);
    }
  }

  return root;
}

function findDirectoriesWithMaxSize(
  directory: Directory,
  maxSize: number
): Directory[] {
  const matches: Directory[] = [];

  if (directory.size <= maxSize) {
    matches.push(directory);
  }

  for (const subdirectory of directory.directories) {
    matches.push(...findDirectoriesWithMaxSize(subdirectory, maxSize));
  }

  return matches;
}

function part1(root: Directory): number {
  const smallDirectories = findDirectoriesWithMaxSize(root, 100 * 1000);

  return sumBy(smallDirectories, (directory) => directory.size);
}

function listAllDirectories(directory: Directory): Directory[] {
  const directories: Directory[] = [directory];

  for (const subdirectory of directory.directories) {
    directories.push(...listAllDirectories(subdirectory));
  }

  return directories;
}

function part2(root: Directory): number {
  const spaceTotal = 70000000;
  const spaceRequired = 30000000;
  const spaceMissing = root.size - (spaceTotal - spaceRequired);

  const allDirectories = listAllDirectories(root);

  const largeEnough = allDirectories.filter((directory) => {
    return directory.size >= spaceMissing;
  });

  const sortedDirectories = sortBy(largeEnough, (dir) => dir.size);

  return sortedDirectories[0].size;
}

async function main() {
  const commands = await loadInput();

  const root = buildDirectories(commands);

  console.log(part1(root));
  console.log(part2(root));
}

main();
