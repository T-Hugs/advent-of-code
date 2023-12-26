import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2023;
const DAY = 9;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/09/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/09/data.txt
// problem url  : https://adventofcode.com/2023/day/9

async function p2023day9_part1(input: string, ...params: any[]) {
	const lines = input.split("\n");
	let sequences: number[][] = [];
	for (const line of lines) {
		sequences.push(line.split(" ").map(Number));
	}

	let sum = 0;
	for (const seq of sequences) {
		const diffs: number[][] = [seq];
		while (true) {
			const diffSeq: number[] = [];
			const current = diffs[diffs.length - 1];
			diffs.push(diffSeq);
			let allZeros = true;
			for (let i = 0; i < current.length - 1; ++i) {
				const diffVal = current[i + 1] - current[i];
				diffSeq.push(diffVal);
				if (diffVal !== 0) {
					allZeros = false;
				}
			}
			if (allZeros) {
				break;
			}
		}
		diffs.reverse();
		diffs[0].push(0);
		for (let i = 1; i < diffs.length; ++i) {
			diffs[i].push(diffs[i][diffs[i].length - 1] + diffs[i - 1][diffs[i - 1].length - 1]);
		}
		const topDiff = diffs[diffs.length - 1];
		const extra = topDiff[topDiff.length - 1];
		sum += extra;
	}
	return sum;
}

async function p2023day9_part2(input: string, ...params: any[]) {
	const lines = input.split("\n");
	let sequences: number[][] = [];
	for (const line of lines) {
		sequences.push(line.split(" ").map(Number));
	}

	let sum = 0;
	for (const seq of sequences) {
		const diffs: number[][] = [seq];
		while (true) {
			const diffSeq: number[] = [];
			const current = diffs[diffs.length - 1];
			diffs.push(diffSeq);
			let allZeros = true;
			for (let i = 0; i < current.length - 1; ++i) {
				const diffVal = current[i + 1] - current[i];
				diffSeq.push(diffVal);
				if (diffVal !== 0) {
					allZeros = false;
				}
			}
			if (allZeros) {
				break;
			}
		}
		diffs.reverse();
		diffs[0].unshift(0);
		for (let i = 1; i < diffs.length; ++i) {
			diffs[i].unshift(diffs[i][0] - diffs[i - 1][0]);
		}
		const topDiff = diffs[diffs.length - 1];
		const extra = topDiff[0];
		sum += extra;
	}
	return sum;
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `0 3 6 9 12 15
1 3 6 10 15 21
10 13 16 21 30 45`,
		extraArgs: [],
		expected: `114`,
		expectedPart2: `2`
	}];
	const part2tests: TestCase[] = [];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2023day9_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2023day9_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2023day9_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2023day9_part2(input));
	const part2After = performance.now();

	logSolution(9, 2023, part1Solution, part2Solution);

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
