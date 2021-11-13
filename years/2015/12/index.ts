import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2015;
const DAY = 12;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2015/12/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2015/12/data.txt
// problem url  : https://adventofcode.com/2015/day/12

function countNumbers(obj: any, ignoreRed: boolean = false) {
	if (typeof obj === "number") {
		return obj;
	}
	if (typeof obj === "string") {
		return 0;
	}
	let sum = 0;
	if (Array.isArray(obj)) {
		for (const elem of obj) {
			sum += countNumbers(elem, ignoreRed);
		}
		return sum;
	}
	const vals = Object.values(obj);
	if (ignoreRed && vals.includes("red")) {
		return 0;
	}
	for (const elem of vals) {
		sum += countNumbers(elem, ignoreRed);
	}
	return sum;
}
async function p2015day12_part1(input: string) {
	const obj = JSON.parse(input);
	return countNumbers(obj);
}

async function p2015day12_part2(input: string) {
	const obj = JSON.parse(input);
	return countNumbers(obj, true);
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [
		{
			input: `{"d":"red","e":[1,2,3,4],"f":5}`,
			expected: `0`,
		},
		{
			input: `[1,{"c":"red","b":2},3]`,
			expected: `4`,
		},
	];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2015day12_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2015day12_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2015day12_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2015day12_part2(input));
	const part2After = performance.now();

	logSolution(12, 2015, part1Solution, part2Solution);

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
