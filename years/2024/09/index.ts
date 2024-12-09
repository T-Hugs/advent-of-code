import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2024;
const DAY = 9;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2024/09/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2024/09/data.txt
// problem url  : https://adventofcode.com/2024/day/9

async function p2024day9_part1(input: string, ...params: any[]) {
	const files: number[] = [];
	for (let i = 0; i < input.length; i += 2) {
		files.push(Number(input[i]));
	}
	const freeSpace: number[] = [];
	for (let i = 1; i < input.length; i += 2) {
		freeSpace.push(Number(input[i]));
	}

	const result: number[] = [];

	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		for (let j = 0; j < file; ++j) {
			result.push(i);
		}
		const nextFree = freeSpace[i];
		for (let j = 0; j < nextFree && i !== files.length - 1; ++j) {
			result.push(files.length - 1);
			files[files.length - 1]--;
			while (files[files.length - 1] === 0) {
				files.pop();
			}
		}
	}

	let checksum = 0;
	for (let i = 0; i < result.length; i++) {
		checksum += result[i] * i;
	}
	return checksum;
}

async function p2024day9_part2(input: string, ...params: any[]) {
	const files: number[] = [];
	for (let i = 0; i < input.length; i += 2) {
		files.push(Number(input[i]));
	}
	const freeSpace: number[] = [];
	for (let i = 1; i < input.length; i += 2) {
		freeSpace.push(Number(input[i]));
	}

	const result: number[] = [];
	const movedIndexes: Set<number> = new Set();

	for (let i = 0; i < files.length; ++i) {
		const file = files[i];
		if (!movedIndexes.has(i)) {
			for (let j = 0; j < file; ++j) {
				result.push(i);
			}
		} else {
			for (let j = 0; j < file; ++j) {
				result.push(NaN);
			}
		}

		// Find the latest file that will fit in this free space
		for (let j = files.length - 1; j > i; --j) {
			if (movedIndexes.has(j)) {
				continue;
			}
			if (files[j] <= freeSpace[i]) {
				for (let k = 0; k < files[j]; ++k) {
					result.push(j);
				}
				movedIndexes.add(j);
				freeSpace[i] -= files[j];
			}
		}

		for (let j = 0; j < freeSpace[i]; ++j) {
			result.push(NaN);
		}
	}

	let checksum = 0;
	for (let i = 0; i < result.length; i++) {
		checksum += (result[i] || 0) * i;
	}
	return checksum;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `2333133121414131402`,
			extraArgs: [],
			expected: `1928`,
			expectedPart2: `2858`,
		},
		{
			input: `12345`,
			extraArgs: [],
			expected: `60`,
			expectedPart2: ``,
		},
	];
	const part2tests: TestCase[] = [];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day9_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day9_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day9_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2024day9_part2(input));
	const part2After = performance.now();

	logSolution(9, 2024, part1Solution, part2Solution);

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
