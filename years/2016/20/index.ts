import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2016;
const DAY = 20;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2016/20/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2016/20/data.txt
// problem url  : https://adventofcode.com/2016/day/20

async function p2016day20_part1(input: string) {
	const lines = input.split("\n");
	const ranges: [number, number][] = [];
	for (const line of lines) {
		const [low, high] = line.split("-").map(Number);
		ranges.push([low, high]);
	}
	for (let i = 0; i < 2 ** 32 - 1; ++i) {
		if (ranges.some(r => r[0] <= i && r[1] >= i)) {
			continue;
		}
		return i;
	}
}

function normalizeRanges(ranges: [number, number][]) {
	let next = ranges.slice();
	while (true) {
		const normalized: [number, number][] = [];
		for (const range of next) {
			let expanded = false;
			for (const normalizedRange of normalized) {
				const overlaps =
					(range[0] >= normalizedRange[0] - 1 && range[0] <= normalizedRange[1] + 1) ||
					(range[1] >= normalizedRange[0] - 1 && range[1] <= normalizedRange[1] + 1);
				if (overlaps) {
					normalizedRange[0] = Math.min(normalizedRange[0], range[0]);
					normalizedRange[1] = Math.max(normalizedRange[1], range[1]);
					expanded = true;
				}
			}
			if (!expanded) {
				normalized.push(range);
			}
		}
		const updated = next.length !== normalized.length;
		next = normalized;
		next.sort((a, b) => a[0] - b[0]);
		if (!updated) {
			break;
		}
	}
	return next;
}

async function p2016day20_part2(input: string, ...params: any[]) {
	const lines = input.split("\n");
	const ranges: [number, number][] = [];
	for (const line of lines) {
		const [low, high] = line.split("-").map(Number);
		ranges.push([low, high]);
	}

	const normalized = normalizeRanges(ranges);
	normalized.sort((a, b) => a[0] - b[0]);

	let totalRangeSize = normalized.reduce((p, c) => p + c[1] - c[0] + 1, 0);
	return params[0] - totalRangeSize + 1;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `5-8
0-2
4-7`,
			expected: `3`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `5-8
0-2
4-7`,
			extraArgs: [9],
			expected: `2`,
		},
		{
			input: `5-8
0-2
4-7
0-9`,
			extraArgs: [9],
			expected: `0`,
		},
		{
			input: `1-2
3-4
5-6`,
			extraArgs: [9],
			expected: `5`,
		},
		{
			input: `5-6
3-4
1-2`,
			extraArgs: [9],
			expected: `4`,
		},
		{
			input: `5-6
1-2
3-4`,
			extraArgs: [9],
			expected: `4`,
		},
		{
			input: `0-5
6-9`,
			extraArgs: [9],
			expected: `0`,
		},
		{
			input: `1-5
3-4`,
			extraArgs: [9],
			expected: `5`,
		},
		{
			input: `1-5
3-4`,
			extraArgs: [9],
			expected: `5`,
		},
	];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2016day20_part1(testCase.input)));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2016day20_part2(testCase.input, ...(testCase.extraArgs ?? []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2016day20_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2016day20_part2(input, 2 ** 32 - 1));
	const part2After = performance.now();

	logSolution(20, 2016, part1Solution, part2Solution);

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
