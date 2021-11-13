import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { Combination } from "js-combinatorics/commonjs/combinatorics";

const YEAR = 2015;
const DAY = 24;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2015/24/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2015/24/data.txt
// problem url  : https://adventofcode.com/2015/day/24

async function p2015day24_part1(input: string) {
	const weights = input.split("\n").map(Number);
	weights.reverse();
	const sum = weights.reduce((p, c) => p + c, 0);
	const perGroup = sum / 3;

	for (let i = 0; ; ++i) {
		const it = new Combination(weights, i);
		let lowestQE = Number.MAX_SAFE_INTEGER;
		for (const group of it) {
			if (group.reduce((p, c) => p + c, 0) === perGroup) {
				const qe = group.reduce((p, c) => p * c, 1);
				if (qe < lowestQE) {
					lowestQE = qe;
				}
			}
		}
		if (lowestQE < Number.MAX_SAFE_INTEGER) {
			return lowestQE;
		}
	}
}

async function p2015day24_part2(input: string) {
	const weights = input.split("\n").map(Number);
	weights.reverse();
	const sum = weights.reduce((p, c) => p + c, 0);
	const perGroup = sum / 4;

	for (let i = 0; ; ++i) {
		const it = new Combination(weights, i);
		let lowestQE = Number.MAX_SAFE_INTEGER;
		for (const group of it) {
			if (group.reduce((p, c) => p + c, 0) === perGroup) {
				const qe = group.reduce((p, c) => p * c, 1);
				if (qe < lowestQE) {
					lowestQE = qe;
				}
			}
		}
		if (lowestQE < Number.MAX_SAFE_INTEGER) {
			return lowestQE;
		}
	}
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2015day24_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2015day24_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2015day24_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2015day24_part2(input));
	const part2After = performance.now();

	logSolution(24, 2015, part1Solution, part2Solution);

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
