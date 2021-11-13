import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2016;
const DAY = 7;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2016/07/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2016/07/data.txt
// problem url  : https://adventofcode.com/2016/day/7

async function p2016day7_part1(input: string) {
	const lines = input.split("\n");
	let count = 0;
	for (const line of lines) {
		if (!/\[[^\]]*(.)((?!\1).)\2\1.*\]/.test(line) && /(.)((?!\1).)\2\1/.test(line)) {
			count++; // in progress!
		}
	}
	return count + 1;
}

async function p2016day7_part2(input: string) {
	const lines = input.split("\n");
	let count = 0;
	for (const line of lines) {
		let inBrackets = false;
		const tls: Set<string> = new Set();
		for (let i = 0; i < line.length - 2; ++i) {
			const char = line[i];
			if (char === "]") {
				inBrackets = false;
			} else if (char === "[") {
				inBrackets = true;
			} else {
				const char2 = line[i + 1];
				const char3 = line[i + 2];
				if (char === char3) {
					const seq = char + char2 + char3;
					const invSeq = char2 + char + char2;
					if (inBrackets) {
						if (tls.has("+" + invSeq)) {
							count++;
							break;
						} else {
							tls.add("-" + seq);
						}
					} else {
						if (tls.has("-" + invSeq)) {
							count++;
							break;
						} else {
							tls.add("+" + seq);
						}
					}
				}
			}
		}
	}
	return count;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `abba[mnop]qrst`,
			expected: `1`,
		},
		{
			input: `abcd[bddb]xyyx`,
			expected: `0`,
		},
		{
			input: `aaaa[qwer]tyui`,
			expected: `0`,
		},
		{
			input: `ioxxoj[asdfgh]zxcvbn`,
			expected: `1`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `aba[bab]xyz`,
			expected: `1`,
		},
		{
			input: `xyx[xyx]xyx`,
			expected: `0`,
		},
		{
			input: `aaa[kek]eke`,
			expected: `1`,
		},
		{
			input: `zazbz[bzb]cdb`,
			expected: `1`,
		},
	];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2016day7_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2016day7_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2016day7_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2016day7_part2(input));
	const part2After = performance.now();

	logSolution(7, 2016, part1Solution, part2Solution);

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
