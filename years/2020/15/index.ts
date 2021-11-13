import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2020;
const DAY = 15;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2020/15/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2020/15/data.txt
// problem url  : https://adventofcode.com/2020/day/15

function getLastSpoken(nums: number[], iterations: number) {
	const mem: number[][] = new Array(iterations);
	let i = 0;
	for (const num of nums) {
		mem[num] = [i++];
	}

	let mostRecentlySpoken = nums[nums.length - 1];
	for (; i < iterations; ++i) {
		const memLast = mem[mostRecentlySpoken];
		if (memLast.length === 1) {
			mem[0][1] = mem[0][0];
			mem[0][0] = i;
			mostRecentlySpoken = 0;
		} else {
			mostRecentlySpoken = memLast[0] - memLast[1];
			const memNextToSpeak = mem[mostRecentlySpoken];
			if (memNextToSpeak) {
				memNextToSpeak[1] = memNextToSpeak[0];
				memNextToSpeak[0] = i;
			} else {
				mem[mostRecentlySpoken] = [i];
			}
		}
	}
	return mostRecentlySpoken;
}

async function p2020day15_part1(input: string) {
	const nums = input.split(",").map(Number);
	return getLastSpoken(nums, 2020);
}

async function p2020day15_part2(input: string) {
	const nums = input.split(",").map(Number);
	return getLastSpoken(nums, 30_000_000);
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `0,3,6`,
			expected: `436`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `0,3,6`,
			expected: `175594`,
		},
	];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2020day15_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2020day15_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2020day15_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2020day15_part2(input));
	const part2After = performance.now();

	logSolution(15, 2020, part1Solution, part2Solution);

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
