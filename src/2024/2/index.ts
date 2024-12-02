import fs from "fs/promises";
import { identity } from "lodash";
import { join } from "path";

type Report = number[];

async function loadInput(): Promise<Report[]> {
  const data = await fs.readFile(join(__dirname, "input.txt"), {
    encoding: "utf-8",
  });

  const lines = data.split("\n");

  return lines.filter(identity).map((line) => {
    return line.split(" ").map((str) => parseInt(str));
  });
}

function isReportSafe(report: Report): boolean {
  const diffs = report.slice(1).map((value, index) => {
    return value - report[index];
  });

  return diffs.every(
    (diff) =>
      Math.abs(diff) >= 1 &&
      Math.abs(diff) <= 3 &&
      Math.sign(diff) === Math.sign(diffs[0])
  );
}

async function part1(): Promise<number> {
  const reports = await loadInput();

  const safeReports = reports.filter((report) => isReportSafe(report));

  return safeReports.length;
}

async function part2(): Promise<number> {
  const reports = await loadInput();

  const safeReports = reports.filter((report) => {
    if (isReportSafe(report)) {
      return true;
    }

    for (let idx = 0; idx < report.length; idx++) {
      const partialReport = [...report.slice(0, idx), ...report.slice(idx + 1)];
      if (isReportSafe(partialReport)) {
        return true;
      }
    }

    return false;
  });

  return safeReports.length;
}

async function main() {
  console.log(await part1());
  console.log(await part2());
}

main();
