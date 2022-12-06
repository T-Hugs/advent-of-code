import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2022;
const DAY = 6;

// solution path: C:\Users\trgau\dev\t-hugs\advent-of-code\years\2022\06\index.ts
// data path    : C:\Users\trgau\dev\t-hugs\advent-of-code\years\2022\06\data.txt
// problem url  : https://adventofcode.com/2022/day/6

function solve(input: string, n: number) {
	const lastN: (string | undefined)[] = new Array(n);
	for (let i = 0; i < input.length; ++i) {
		lastN[i % n] = input[i];

		if (i >= n && new Set(lastN).size === n) {
			return i + 1;
		}
	}
	return undefined;
}

async function p2022day6_part1(input: string, ...params: any[]) {
	return solve(input, 4);
}

async function p2022day6_part2(input: string, ...params: any[]) {
	return solve(input, 14);
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `mjqjpqmgbljsphdztnvjfqwrcgsmlb`,
			extraArgs: [],
			expected: `7`,
		},
		{
			input: `bvwbjplbgvbhsrlpgdmjqwftvncz`,
			extraArgs: [],
			expected: `5`,
		},
		{
			input: `nppdvjthqldpwncqszvftbrmjlhg`,
			extraArgs: [],
			expected: `6`,
		},
		{
			input: `nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg`,
			extraArgs: [],
			expected: `10`,
		},
		{
			input: `zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw`,
			extraArgs: [],
			expected: `11`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `mjqjpqmgbljsphdztnvjfqwrcgsmlb`,
			extraArgs: [],
			expected: `19`,
		},
		{
			input: `bvwbjplbgvbhsrlpgdmjqwftvncz`,
			extraArgs: [],
			expected: `23`,
		},
		{
			input: `nppdvjthqldpwncqszvftbrmjlhg`,
			extraArgs: [],
			expected: `23`,
		},
		{
			input: `nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg`,
			extraArgs: [],
			expected: `29`,
		},
		{
			input: `zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw`,
			extraArgs: [],
			expected: `26`,
		},
	];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2022day6_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2022day6_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2022day6_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2022day6_part2(input));
	const part2After = performance.now();

	logSolution(6, 2022, part1Solution, part2Solution);

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
