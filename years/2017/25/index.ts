import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import * as LOGUTIL from "../../../util/log";
const { log, logGrid, logSolution, trace } = LOGUTIL;

const YEAR = 2017;
const DAY = 25;
const DEBUG = true;
LOGUTIL.setDebug(DEBUG);

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2017/25/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2017/25/data.txt
// problem url  : https://adventofcode.com/2017/day/25

async function p2017day25_part1(input: string) {
	return "Not implemented";
}

async function p2017day25_part2(input: string) {
	return "Not implemented";
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests()
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2017day25_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2017day25_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program
	const input = await util.getInput(DAY, YEAR);
	const part1Solution = String(await p2017day25_part1(input));
	const part2Solution = String(await p2017day25_part2(input));

	logSolution(part1Solution, part2Solution);
}

run()
	.then(() => {
		process.exit();
	})
	.catch(error => {
		throw error;
	});
