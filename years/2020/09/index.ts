import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2020;
const DAY = 9;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2020/09/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2020/09/data.txt
// problem url  : https://adventofcode.com/2020/day/9

function findBad(numbers: number[], preamble: number) {
	for (let i = preamble; i < numbers.length; ++i) {
		let good = false;
		for (let x = i - preamble; x < i; ++x) {
			let done = false;
			for (let y = x + 1; y < i; ++y) {
				if (numbers[x] + numbers[y] === numbers[i]) {
					good = true;
					done = true;
					break;
				}
			}
			if (done) {
				break;
			}
		}
		if (good === false) {
			return numbers[i];
		}
	}
	throw new Error("Couldn't find target");
}
async function p2020day9_part1(input: string) {
	const preamble = 25;
	const lines = input.split("\n");
	const nums: number[] = [];
	for (const line of lines) {
		nums.push(Number(line));
	}

	return findBad(nums, preamble);
}

async function p2020day9_part2(input: string) {
	const preamble = 25;
	const lines = input.split("\n");
	const nums: number[] = [];
	for (const line of lines) {
		nums.push(Number(line));
	}

	// Find the target
	const target = findBad(nums, preamble);

	let starting = 0;
	let run: number[] = [];
	while (true) {
		let sum = 0;
		run = [];
		let good = false;
		for (let i = starting; i < nums.length; ++i) {
			sum += nums[i];
			run.push(nums[i]);
			if (sum > target) {
				starting++;
				break;
			}
			if (sum === target) {
				good = true;
				break;
			}
		}
		if (good) {
			break;
		}
	}
	return Math.min(...run) + Math.max(...run);
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2020day9_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2020day9_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2020day9_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2020day9_part2(input));
	const part2After = performance.now();

	logSolution(9, 2020, part1Solution, part2Solution);

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
