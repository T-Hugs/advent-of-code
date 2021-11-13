import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { createDelete } from "typescript";

const YEAR = 2020;
const DAY = 25;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2020/25/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2020/25/data.txt
// problem url  : https://adventofcode.com/2020/day/25

async function p2020day25_part1(input: string) {
	const [card, door] = input.split("\n").map(Number);

	const subject = 7;
	const mod = 20201227;

	let v = 1;
	let cardLoop = 0;

	for (let i = 0; ; ++i) {
		v = util.mod(v * subject, mod);
		if (v === card) {
			cardLoop = i + 1;
			break;
		}
	}

	let key = 1;
	for (let i = 0; i < cardLoop; ++i) {
		key = util.mod(key * door, mod);
	}
	return key;
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2020day25_part1(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2020day25_part1(input));
	const part1After = performance.now();

	logSolution(25, 2020, part1Solution);

	log(chalk.gray("--- Performance ---"));
	log(chalk.gray(`Part 1: ${util.formatTime(part1After - part1Before)}`));
	log();
}

run()
	.then(() => {
		process.exit();
	})
	.catch(error => {
		throw error;
	});
