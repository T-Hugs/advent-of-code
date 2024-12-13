import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2024;
const DAY = 11;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2024/11/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2024/11/data.txt
// problem url  : https://adventofcode.com/2024/day/11

const memo = new Map<string, number>();

function count(num: number, blinks: number): number {
	const key = `${num},${blinks}`;
	if (memo.has(key)) {
		return memo.get(key)!;
	}

	if (blinks === 0) {
		return 1;
	}
	if (num === 0) {
		const ans = count(1, blinks - 1);
		memo.set(key, ans);
		return ans;
	}
	const digits = Math.floor(Math.log10(num)) + 1;
	let ans;
	if (digits % 2 === 0) {
		ans =
			count(Math.floor(num / 10 ** (digits / 2)), blinks - 1) +
			count(Math.floor(num % 10 ** (digits / 2)), blinks - 1);
	} else {
		ans = count(num * 2024, blinks - 1);
	}
	memo.set(key, ans);
	return ans;
}

async function p2024day11_part1(input: string, ...params: any[]) {
	let stones = input.split(" ").map(Number);
	let result = 0;
	for (const stone of stones) {
		result += count(stone, 25);
	}
	return result;
}

async function p2024day11_part2(input: string, ...params: any[]) {
	let stones = input.split(" ").map(Number);
	let result = 0;
	for (const stone of stones) {
		result += count(stone, 75);
	}
	return result;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `125 17`,
			extraArgs: [],
			expected: `55312`,
			expectedPart2: `65601038650482`,
		},
	];
	const part2tests: TestCase[] = [];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day11_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day11_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day11_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2024day11_part2(input));
	const part2After = performance.now();

	logSolution(11, 2024, part1Solution, part2Solution);

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
