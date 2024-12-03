import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2024;
const DAY = 1;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2024/01/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2024/01/data.txt
// problem url  : https://adventofcode.com/2024/day/1

async function p2024day1_part1(input: string, ...params: any[]) {
	const leftNums: number[] = [];
	const rightNums: number[] = [];

	const lines = input.split("\n");
	for (const line of lines) {
		const [left, right] = line.split("   ").map(Number);
		leftNums.push(left);
		rightNums.push(right);
	}

	leftNums.sort((a, b) => a - b);
	rightNums.sort((a, b) => a - b);

	let totalDist = 0;
	for (let i = 0; i < leftNums.length; i++) {
		totalDist += Math.abs(leftNums[i] - rightNums[i]);
	}
	return totalDist;
}

async function p2024day1_part2(input: string, ...params: any[]) {
	const leftNums: number[] = [];
	const rightNums: Map<number, number> = new Map();

	const lines = input.split("\n");
	for (const line of lines) {
		const [left, right] = line.split("   ").map(Number);
		leftNums.push(left);
		if (rightNums.has(right)) {
			rightNums.set(right, rightNums.get(right)! + 1);
		} else {
			rightNums.set(right, 1);
		}
	}

	let score = 0;
	for (let i = 0; i < leftNums.length; i++) {
		const leftNum = leftNums[i];
		score += leftNum * (rightNums.get(leftNum) ?? 0);
	}
	return score;
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `3   4
4   3
2   5
1   3
3   9
3   3`,
		extraArgs: [],
		expected: `11`,
		expectedPart2: `31`,
	}];
	const part2tests: TestCase[] = [];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day1_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day1_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day1_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2024day1_part2(input));
	const part2After = performance.now();

	logSolution(1, 2024, part1Solution, part2Solution);

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
