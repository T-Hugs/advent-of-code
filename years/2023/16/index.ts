import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";
import { Grid, GridPos } from "../../../util/grid";

const YEAR = 2023;
const DAY = 16;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/16/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/16/data.txt
// problem url  : https://adventofcode.com/2023/day/16

type Beam = [position: GridPos, direction: "north" | "south" | "east" | "west"];

function countEnergized(grid: Grid, beam: Beam) {
	const beams: Beam[] = [beam];
	const energizedLocations: Set<string> = new Set();
	const processed: Set<string> = new Set();
	while (beams.length > 0) {
		const beam = beams.shift()!;
		const cell = grid.getCell(beam[0]);
		let dir = beam[1];
		if (!cell) {
			continue;
		}
		let currentCell = cell;
		let i = 0;
		while (true) {
			const lightVectorKey = currentCell.position.join(",") + "|" + dir;
			if (processed.has(lightVectorKey)) {
				break;
			} else {
				processed.add(lightVectorKey);
			}
			energizedLocations.add(currentCell.position.join(","));
			const horizontalDir = dir === "east" || dir === "west";
			const verticalDir = !horizontalDir;
			// console.log("Processing " + currentCell.value);
			if (
				currentCell.value === "." ||
				(currentCell.value === "-" && horizontalDir) ||
				(currentCell.value === "|" && verticalDir)
			) {
				// pass
			} else if (currentCell.value === "-") {
				const east = currentCell.east();
				const west = currentCell.west();
				if (east) {
					beams.push([east.position, "east"]);
				}
				if (west) {
					beams.push([west.position, "west"]);
				}
				break;
			} else if (currentCell.value === "|") {
				const north = currentCell.north();
				const south = currentCell.south();
				if (north) {
					beams.push([north.position, "north"]);
				}
				if (south) {
					beams.push([south.position, "south"]);
				}
				break;
			} else if (currentCell.value === "/") {
				if (dir === "south") {
					dir = "west";
				} else if (dir === "west") {
					dir = "south";
				} else if (dir === "north") {
					dir = "east";
				} else if (dir === "east") {
					dir = "north";
				}
			} else if (currentCell.value === "\\") {
				if (dir === "south") {
					dir = "east";
				} else if (dir === "east") {
					dir = "south";
				} else if (dir === "north") {
					dir = "west";
				} else if (dir === "west") {
					dir = "north";
				}
			}
			const nextCell = currentCell[dir]();
			if (!nextCell) {
				break;
			}
			currentCell = nextCell;
		}
	}
	return energizedLocations.size;
}

async function p2023day16_part1(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input });
	return countEnergized(grid, [[0, 0], "east"]);
}

async function p2023day16_part2(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input });
	let maxEnergized = 0;
	for (const cell of grid) {
		let energized = 0;
		if (cell.isEastEdge()) {
			energized = countEnergized(grid, [cell.position, "west"]);
		}
		if (cell.isNorthEdge()) {
			energized = countEnergized(grid, [cell.position, "south"]);
		}
		if (cell.isWestEdge()) {
			energized = countEnergized(grid, [cell.position, "east"]);
		}
		if (cell.isSouthEdge()) {
			energized = countEnergized(grid, [cell.position, "north"]);
		}
		if (energized > maxEnergized) {
			maxEnergized = energized;
		}
	}
	return maxEnergized
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `.|...\\....
|.-.\\.....
.....|-...
........|.
..........
.........\\
..../.\\\\..
.-.-/..|..
.|....-|.\\
..//.|....`,
			extraArgs: [],
			expected: `46`,
			expectedPart2: `51`,
		},
	];
	const part2tests: TestCase[] = [];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2023day16_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2023day16_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2023day16_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2023day16_part2(input));
	const part2After = performance.now();

	logSolution(16, 2023, part1Solution, part2Solution);

	log(chalk.gray("--- Performance ---"));
	log(chalk.gray(`Part 1: ${util.formatTime(part1After - part1Before)}`));
	log(chalk.gray(`Part 2: ${util.formatTime(part2After - part2Before)}`));
	log();
}

run()
	.then(() => {
		process.exit();
	})
	.catch(error => {
		throw error;
	});
