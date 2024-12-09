import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";
import { Grid } from "../../../util/grid";
import { dir } from "console";

const YEAR = 2024;
const DAY = 6;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2024/06/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2024/06/data.txt
// problem url  : https://adventofcode.com/2024/day/6

async function p2024day6_part1(input: string, ...params: any[]) {
	const grid = new Grid({serialized: input});
	const start = grid.getCell("^");
	let direction = 0; // north east south west

	let pos = start;

	while (true) {
		pos?.setValue("@");
		let nextPos = pos;
		if (direction === 0) {
			nextPos = pos?.north();
		}
		if (direction === 1) {
			nextPos = pos?.east();
		}
		if (direction === 2) {
			nextPos = pos?.south();
		}
		if (direction === 3) {
			nextPos = pos?.west();
		}
		if (nextPos?.value === "#") {
			direction = (direction + 1) % 4
		} else {
			pos = nextPos;
		}
		if (!pos) {
			break;
		}
	}
	return grid.getCells("@").length;	
}

async function p2024day6_part2(input: string, ...params: any[]) {
	const grid = new Grid({serialized: input});
	const start = grid.getCell("^");

	let count = 0;
	for (const cell of grid.getCells(".")) {
		cell.setValue("#");

		const visited = new Set<string>();
		let direction = 0; // north east south west
		let pos = start;

		while (true) {
			const spaceName = pos?.position.join(",") + "|" + direction;
			if (visited.has(spaceName)) {
				count++;
				break;
			}
			visited.add(spaceName);
			let nextPos = pos;
			if (direction === 0) {
				nextPos = pos?.north();
			}
			if (direction === 1) {
				nextPos = pos?.east();
			}
			if (direction === 2) {
				nextPos = pos?.south();
			}
			if (direction === 3) {
				nextPos = pos?.west();
			}
			if (nextPos?.value === "#") {
				direction = (direction + 1) % 4
			} else {
				pos = nextPos;
			}
			if (!pos) {
				break;
			}
		}
		cell.setValue(".");
	}
	return count;
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `....#.....
.........#
..........
..#.......
.......#..
..........
.#..^.....
........#.
#.........
......#...`,
		extraArgs: [],
		expected: `41`,
		expectedPart2: `6`,
	}];
	const part2tests: TestCase[] = [];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day6_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day6_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day6_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2024day6_part2(input));
	const part2After = performance.now();

	logSolution(6, 2024, part1Solution, part2Solution);

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
