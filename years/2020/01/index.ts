import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";


const YEAR = 2020;
const DAY = 1;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2020/01/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2020/01/data.txt
// problem url  : https://adventofcode.com/2020/day/1

async function p2020day1_part1(input: string) {
	const lines = input.split("\n").map(Number);

	for (let i = 0; i < lines.length; ++i) {
		for (let j = i + 1; j < lines.length; ++j) {
			if (lines[i] + lines[j] === 2020) {
				return lines[i] * lines[j];
			}
		}
	}
}

async function p2020day1_part2(input: string) {
	const lines = input.split("\n").map(Number);

	for (let i = 0; i < lines.length; ++i) {
		for (let j = i + 1; j < lines.length; ++j) {
			for (let k = j + 1; k < lines.length; ++k) {
				if (lines[i] + lines[j] + lines[k] === 2020) {
					return lines[i] * lines[j] * lines[k];
				}
			}
		}
	}
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2020day1_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2020day1_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2020day1_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2020day1_part2(input));
	const part2After = performance.now();

	logSolution(1, 2020, part1Solution, part2Solution);

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
