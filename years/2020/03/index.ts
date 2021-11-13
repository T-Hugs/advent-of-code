import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { Grid } from "../../../util/grid";

const YEAR = 2020;
const DAY = 3;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2020/03/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2020/03/data.txt
// problem url  : https://adventofcode.com/2020/day/3

async function p2020day3_part1(input: string) {
	const grid = new Grid({ serialized: input });
	const start = grid.getCell([0, 0]);
	let pos = start;
	let count = 0;
	while (pos != undefined) {
		pos = pos.east(3, "wrap")?.south();
		if (pos && pos.value === "#") {
			count++;
		}
	}
	return count;
}

async function p2020day3_part2(input: string) {
	const grid = new Grid({ serialized: input });
	const start = grid.getCell([0, 0]);
	const slopes = [
		[1, 1],
		[3, 1],
		[5, 1],
		[7, 1],
		[1, 2],
	];
	let result = 1;
	for (const slope of slopes) {
		let trees = 0;
		let pos = start;
		while (pos != undefined) {
			pos = pos.east(slope[0], "wrap")?.south(slope[1]);
			if (pos && pos.value === "#") {
				trees++;
			}
		}
		result *= trees;
	}
	return result;
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2020day3_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2020day3_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2020day3_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2020day3_part2(input));
	const part2After = performance.now();

	logSolution(3, 2020, part1Solution, part2Solution);

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
