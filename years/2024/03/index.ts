import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2024;
const DAY = 3;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2024/03/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2024/03/data.txt
// problem url  : https://adventofcode.com/2024/day/3

async function p2024day3_part1(input: string, ...params: any[]) {
	const mulInstruction = /mul\(\d{1,3},\d{1,3}\)/g;

	let match: RegExpExecArray | null;
	let total = 0;
	while ((match = mulInstruction.exec(input)) !== null) {
		const [a, b] = match[0]
			.replace(/[^\d,]/g, "")
			.split(",")
			.map(Number);
		total += a * b;
	}
	return total;
}

async function p2024day3_part2(input: string, ...params: any[]) {
	const removeDonts = /don\'t\(\).*?do\(\)/gs;
	const noDonts = input.replace(removeDonts, "");

	const mulInstruction = /mul\(\d{1,3},\d{1,3}\)/g;

	let match: RegExpExecArray | null;
	let total = 0;
	while ((match = mulInstruction.exec(noDonts)) !== null) {
		const [a, b] = match[0]
			.replace(/[^\d,]/g, "")
			.split(",")
			.map(Number);
		total += a * b;
	}
	return total;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `xmul(2,4)%&mul[3,7]!@^do_not_mul(5,5)+mul(32,64]then(mul(11,8)mul(8,5))`,
			extraArgs: [],
			expected: `161`,
			expectedPart2: ``,
		},
	];
	const part2tests: TestCase[] = [{
		input: `xmul(2,4)&mul[3,7]!^don't()_mul(5,5)+mul(32,64](mul(11,8)undo()?mul(8,5))`,
		extraArgs: [],
		expected: `48`,
		expectedPart2: ``,
	}];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day3_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day3_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day3_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2024day3_part2(input));
	const part2After = performance.now();

	logSolution(3, 2024, part1Solution, part2Solution);

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
