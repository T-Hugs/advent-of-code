import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2016;
const DAY = 3;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2016/03/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2016/03/data.txt
// problem url  : https://adventofcode.com/2016/day/3

function validTriangle(nums: number[]) {
	const parts = [...nums];
	const largest = util.max(parts);
	parts.splice(
		parts.findIndex(p => p === largest.value),
		1
	);
	const sum = _.sum(parts);
	return sum > largest.value;
}

async function p2016day3_part1(input: string) {
	const lines = input.split("\n");
	let count = 0;
	for (const line of lines) {
		const parts = line.trim().split(/ +/).map(Number);

		if (validTriangle(parts)) {
			count++;
		}
	}
	return count;
}

async function p2016day3_part2(input: string) {
	const lines = input.split("\n");
	let count = 0;
	for (let i = 0; i < lines.length; i += 3) {
		const l1 = lines[i].trim().split(/ +/).map(Number);
		const l2 = lines[i + 1].trim().split(/ +/).map(Number);
		const l3 = lines[i + 2].trim().split(/ +/).map(Number);

		if (validTriangle([l1[0], l2[0], l3[0]])) {
			count++;
		}
		if (validTriangle([l1[1], l2[1], l3[1]])) {
			count++;
		}
		if (validTriangle([l1[2], l2[2], l3[2]])) {
			count++;
		}
	}
	return count;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `  5    10 25`,
			expected: `0`,
		},
	];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2016day3_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2016day3_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2016day3_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2016day3_part2(input));
	const part2After = performance.now();

	logSolution(3, 2016, part1Solution, part2Solution);

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
