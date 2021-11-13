import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2016;
const DAY = 15;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2016/15/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2016/15/data.txt
// problem url  : https://adventofcode.com/2016/day/15

async function p2016day15_part1(input: string) {
	const lines = input.split("\n");
	const discs: number[][] = [];
	for (const line of lines) {
		const [discNo, posCount, posAt0] = /#(\d+) has (\d+) positions; at time=0, it is at position (\d+)/
			.exec(line)!
			.slice(1)
			.map(Number);
		discs.push([posCount, posAt0, discNo]);
	}
	outer: for (let t = 0; ; ++t) {
		for (const disc of discs) {
			const pos = (disc[1] + (t + disc[2])) % disc[0];
			if (pos !== 0) {
				continue outer;
			}
		}
		return t;
	}
}

async function p2016day15_part2(input: string) {
	const lines = input.split("\n");
	const discs: number[][] = [];
	for (const line of lines) {
		const [discNo, posCount, posAt0] = /#(\d+) has (\d+) positions; at time=0, it is at position (\d+)/
			.exec(line)!
			.slice(1)
			.map(Number);
		discs.push([posCount, posAt0, discNo]);
	}
	discs.push([11, 0, discs.length + 1]);
	outer: for (let t = 0; ; ++t) {
		for (const disc of discs) {
			const pos = (disc[1] + (t + disc[2])) % disc[0];
			if (pos !== 0) {
				continue outer;
			}
		}
		return t;
	}
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `Disc #1 has 5 positions; at time=0, it is at position 4.
Disc #2 has 2 positions; at time=0, it is at position 1.`,
			expected: `5`,
		},
	];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2016day15_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2016day15_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2016day15_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2016day15_part2(input));
	const part2After = performance.now();

	logSolution(15, 2016, part1Solution, part2Solution);

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
