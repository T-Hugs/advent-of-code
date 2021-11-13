import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2015;
const DAY = 25;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2015/25/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2015/25/data.txt
// problem url  : https://adventofcode.com/2015/day/25

function getRowColIndex(row: number, col: number) {
	const newRow = row + (col - 1);
	return (Math.pow(newRow - 1, 2) + (newRow - 1)) / 2 + 1 + (col - 1);
}

async function p2015day25_part1(input: string) {
	const [row, col] = /(\d+).*?(\d+)/.exec(input)!.slice(1, 3).map(Number);
	const pwIndex = getRowColIndex(row, col);
	const startAt = 20151125;
	const mul = 252533;
	const div = 33554393;

	// lol slow
	let val = startAt;
	for (let i = 0; i < pwIndex - 1; ++i) {
		val = (val * mul) % div;
	}

	return val;
}

async function run() {
	const part1tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2015day25_part1(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2015day25_part1(input));
	const part1After = performance.now();

	logSolution(25, 2015, part1Solution);

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
