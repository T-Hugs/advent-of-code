import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2016;
const DAY = 6;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2016/06/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2016/06/data.txt
// problem url  : https://adventofcode.com/2016/day/6

async function p2016day6_part1(input: string) {
	const lines = input.split("\n");
	let result = "";
	for (let i = 0; i < lines[0].length; ++i) {
		const counts: { [letter: string]: number } = {};
		for (const line of lines) {
			if (!counts[line[i]]) {
				counts[line[i]] = 0;
			}
			counts[line[i]]++;
		}
		const entries = Object.entries(counts);
		entries.sort((a, b) => b[1] - a[1]);
		result += entries[0][0];
	}
	return result;
}

async function p2016day6_part2(input: string) {
	const lines = input.split("\n");
	let result = "";
	for (let i = 0; i < lines[0].length; ++i) {
		const counts: { [letter: string]: number } = {};
		for (const line of lines) {
			if (!counts[line[i]]) {
				counts[line[i]] = 0;
			}
			counts[line[i]]++;
		}
		const entries = Object.entries(counts);
		entries.sort((a, b) => a[1] - b[1]);
		result += entries[0][0];
	}
	return result;
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2016day6_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2016day6_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2016day6_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2016day6_part2(input));
	const part2After = performance.now();

	logSolution(6, 2016, part1Solution, part2Solution);

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
