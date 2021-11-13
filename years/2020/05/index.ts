import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2020;
const DAY = 5;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2020/05/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2020/05/data.txt
// problem url  : https://adventofcode.com/2020/day/5

async function p2020day5_part1(input: string) {
	const lines = input.split("\n");
	let ids = [];
	for (const line of lines) {
		let minRow = 0;
		let maxRow = 127;
		let minCol = 0;
		let maxCol = 7;
		for (let i = 0; i < 7; ++i) {
			const char = line[i];
			if (char === "F") {
				maxRow = Math.floor(maxRow - (maxRow - minRow) / 2);
			} else if (char === "B") {
				minRow = Math.floor(minRow + (maxRow - minRow) / 2);
			}
		}
		const row = maxRow;
		for (let i = 7; i < 10; ++i) {
			const char = line[i];
			if (char === "L") {
				maxCol = Math.floor(maxCol - (maxCol - minCol) / 2);
			} else if (char === "R") {
				minCol = Math.floor(minCol + (maxCol - minCol) / 2);
			}
		}
		const col = maxCol;
		ids.push(row * 8 + col);
		console.log(`row: ${row}, col: ${col}`);
	}
	return Math.max(...ids);
}

async function p2020day5_part2(input: string) {
	const lines = input.split("\n");
	let ids = [];
	for (const line of lines) {
		let minRow = 0;
		let maxRow = 127;
		let minCol = 0;
		let maxCol = 7;
		for (let i = 0; i < 7; ++i) {
			const char = line[i];
			if (char === "F") {
				maxRow = Math.floor(maxRow - (maxRow - minRow) / 2);
			} else if (char === "B") {
				minRow = Math.floor(minRow + (maxRow - minRow) / 2);
			}
		}
		const row = maxRow;
		for (let i = 7; i < 10; ++i) {
			const char = line[i];
			if (char === "L") {
				maxCol = Math.floor(maxCol - (maxCol - minCol) / 2);
			} else if (char === "R") {
				minCol = Math.floor(minCol + (maxCol - minCol) / 2);
			}
		}
		const col = maxCol;
		ids.push(row * 8 + col);
	}
	let allIds = [];
	for (let i = 0; i < 1024; ++i) {
		allIds.push(i);
	}
	for (const id of ids) {
		_.remove(allIds, x => x === id);
	}
	for (let i = 0; i < allIds.length; ++i) {
		if (allIds[i] === i) {
			continue;
		}
		return allIds[i];
	}
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `BFFFBBFRRR`,
			expected: `567`,
		},
	];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2020day5_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2020day5_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2020day5_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2020day5_part2(input));
	const part2After = performance.now();

	logSolution(5, 2020, part1Solution, part2Solution);

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
