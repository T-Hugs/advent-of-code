import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";

const YEAR = 2015;
const DAY = 1;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2015/01/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2015/01/data.txt
// problem url  : https://adventofcode.com/2015/day/1

async function p2015day1_part1(input: string) {
	const count = util.countUniqueElements(input);
	return (count["("] ?? 0) - (count[")"] ?? 0);
}

async function p2015day1_part2(input: string) {
	let lc = 0;
	let rc = 0;
	for (let i = 0; i < input.length; ++i) {
		if (input[i] === "(") {
			lc++;
		}
		if (input[i] === ")") {
			rc++;
		}
		if (lc - rc < 0) {
			return i + 1;
		}
	}
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `(())`,
			expected: `0`,
		},
		{
			input: `()()`,
			expected: `0`,
		},
		{
			input: `(((`,
			expected: `3`,
		},
		{
			input: `(()(()(`,
			expected: `3`,
		},
		{
			input: `))(((((`,
			expected: `3`,
		},
		{
			input: `())`,
			expected: `-1`,
		},
		{
			input: `))(`,
			expected: `-1`,
		},
		{
			input: `)))`,
			expected: `-3`,
		},
		{
			input: `)())())`,
			expected: `-3`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `)`,
			expected: `1`,
		},
		{
			input: `()())`,
			expected: `5`,
		},
	];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2015day1_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2015day1_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program
	const input = await util.getInput(DAY, YEAR);
	const part1Solution = String(await p2015day1_part1(input));
	const part2Solution = String(await p2015day1_part2(input));

	logSolution(1, 2015, part1Solution, part2Solution);
}

run()
	.then(() => {
		process.exit();
	})
	.catch(error => {
		throw error;
	});
