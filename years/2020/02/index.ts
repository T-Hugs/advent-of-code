import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2020;
const DAY = 2;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2020/02/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2020/02/data.txt
// problem url  : https://adventofcode.com/2020/day/2

async function p2020day2_part1(input: string) {
	const lines = input.split("\n");
	let good = 0;
	for (const line of lines) {
		const split = line.split(" ");
		const pw = split[2];
		const [fewest, most] = split[0].split("-").map(Number);
		const letter = split[1][0];

		let count = 0;
		for (const char of pw) {
			if (letter === char) {
				count++;
			}
		}
		if (count >= fewest && count <= most) {
			good++;
		}
	}
	return good;
}

async function p2020day2_part2(input: string) {
	const lines = input.split("\n");
	let good = 0;
	for (const line of lines) {
		const split = line.split(" ");
		const [first, second] = split[0].split("-").map(Number);
		const letter = split[1][0];
		const pw = split[2];
		if ((pw[first - 1] === letter) !== (pw[second - 1] === letter)) {
			good++;
		}
	}
	return good;
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2020day2_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2020day2_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2020day2_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2020day2_part2(input));
	const part2After = performance.now();

	logSolution(2, 2020, part1Solution, part2Solution);

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
