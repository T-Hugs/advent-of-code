import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import * as LOGUTIL from "../../../util/log";
import { performance } from "perf_hooks";
const { log, logSolution, trace } = LOGUTIL;

const YEAR = 2016;
const DAY = 20;
const DEBUG = true;
LOGUTIL.setDebug(DEBUG);

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2016/20/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2016/20/data.txt
// problem url  : https://adventofcode.com/2016/day/20

async function p2016day20_part1(input: string) {
	const lines = input.split("\n");
	const ranges: [number, number][] = [];
	for (const line of lines) {
		const [low, high] = line.split("-").map(Number);
		ranges.push([low, high]);
	}
	for (let i = 0; i < 2 ** 32 - 1; ++i) {
		if (ranges.some(r => r[0] <= i && r[1] >= i)) {
			continue;
		}
		return i;
	}
}

async function p2016day20_part2(input: string) {
	return "Not implemented";
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `5-8
0-2
4-7`,
		expected: `3`
	}];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2016day20_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2016day20_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2016day20_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2016day20_part2(input));
	const part2After = performance.now();
	
	logSolution(20, 2016, part1Solution, part2Solution);

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
