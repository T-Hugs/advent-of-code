import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2020;
const DAY = 6;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2020/06/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2020/06/data.txt
// problem url  : https://adventofcode.com/2020/day/6

async function p2020day6_part1(input: string) {
	const groups = input.split("\n\n");
	return groups.reduce((p, c) => p + _.uniq(c.split("\n").join("")).length, 0);
}

async function p2020day6_part2(input: string) {
	const groups = input.split("\n\n");
	return groups.reduce((a, b) => {
		const lines = b.split("\n");
		return a + lines.slice(1).reduce((p, c) => p.filter(a => c.split("").includes(a)), lines[0].split("")).length;
	}, 0);
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `abc

a
b
c

ab
ac

a
a
a
a

b
`,
			expected: `11`,
		},
	];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2020day6_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2020day6_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2020day6_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2020day6_part2(input));
	const part2After = performance.now();

	logSolution(6, 2020, part1Solution, part2Solution);

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
