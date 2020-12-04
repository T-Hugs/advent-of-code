import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import * as LOGUTIL from "../../../util/log";
import { performance } from "perf_hooks";
const { log, logSolution, trace } = LOGUTIL;

const YEAR = 2016;
const DAY = 7;
const DEBUG = true;
LOGUTIL.setDebug(DEBUG);

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2016/07/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2016/07/data.txt
// problem url  : https://adventofcode.com/2016/day/7

async function p2016day7_part1(input: string) {
	const lines = input.split("\n");
	let count = 0;
	for (const line of lines) {
		if (/(?<=([\]])|(\b)[a-z]*)(.)((?!\1).)\2\1/.test(line)) {
			count++; // in progress!
		}
	}
	return count;
}

async function p2016day7_part2(input: string) {
	return "Not implemented";
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `abba[mnop]qrst`,
			expected: `1`,
		},
		{
			input: `abcd[bddb]xyyx`,
			expected: `0`,
		},
		{
			input: `aaaa[qwer]tyui`,
			expected: `0`,
		},
		{
			input: `ioxxoj[asdfgh]zxcvbn`,
			expected: `1`,
		},
	];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2016day7_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2016day7_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2016day7_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2016day7_part2(input));
	const part2After = performance.now();

	logSolution(7, 2016, part1Solution, part2Solution);

	log(chalk.gray("--- Performance ---"));
	log(chalk.gray(`Part 1: ${util.msToString(part1After - part1Before)}`));
	log(chalk.gray(`Part 2: ${util.msToString(part2After - part2Before)}`));
	log();
}

run()
	.then(() => {
		process.exit();
	})
	.catch(error => {
		throw error;
	});
