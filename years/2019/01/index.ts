import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2019;
const DAY = 1;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2019/01/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2019/01/data.txt
// problem url  : https://adventofcode.com/2019/day/1

async function p2019day1_part1(input: string) {
	return input
		.split("\n")
		.map(Number)
		.reduce((p, c) => p + (Math.floor(c / 3) - 2), 0);
}

async function p2019day1_part2(input: string) {
	return input
		.split("\n")
		.map(Number)
		.reduce((p, c) => {
			let totalFuel = 0;
			let extraFuel = c;
			while (true) {
				extraFuel = Math.floor(extraFuel / 3) - 2;
				if (extraFuel <= 0) {
					return totalFuel + p;
				}
				totalFuel += extraFuel;
			}
		}, 0);
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [
		{
			input: `14`,
			expected: `2`,
		},
		{
			input: `1969`,
			expected: `966`,
		},
		{
			input: `100756`,
			expected: `50346`,
		},
	];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2019day1_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2019day1_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2019day1_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2019day1_part2(input));
	const part2After = performance.now();

	logSolution(1, 2019, part1Solution, part2Solution);

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
