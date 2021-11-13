import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import crypto from "crypto";

const YEAR = 2015;
const DAY = 4;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2015/04/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2015/04/data.txt
// problem url  : https://adventofcode.com/2015/day/4

async function p2015day4_part1(input: string) {
	for (let i = 1; ; i++) {
		const hash = crypto.createHash("md5");
		hash.update(input + i);
		const hex = hash.digest("hex");
		if (hex.startsWith("00000")) {
			return i;
		}
	}
}

async function p2015day4_part2(input: string) {
	for (let i = 1; ; i++) {
		const hash = crypto.createHash("md5");
		hash.update(input + i);
		const hex = hash.digest("hex");
		if (hex.startsWith("000000")) {
			return i;
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
		test.logTestResult(testCase, String(await p2015day4_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2015day4_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2015day4_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2015day4_part2(input));
	const part2After = performance.now();

	logSolution(4, 2015, part1Solution, part2Solution);

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
