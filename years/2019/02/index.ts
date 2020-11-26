import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import * as LOGUTIL from "../../../util/log";
import { performance } from "perf_hooks";
import { compute } from "../intcode";
const { log, logGrid, logSolution, trace } = LOGUTIL;

const YEAR = 2019;
const DAY = 2;
const DEBUG = true;
LOGUTIL.setDebug(DEBUG);

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2019/02/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2019/02/data.txt
// problem url  : https://adventofcode.com/2019/day/2

async function p2019day2_part1(input: string) {
	const vn = input.split(",").map(BigInt);
	vn[1] = 12n;
	vn[2] = 2n;
	const result = compute(vn);
	return result[0];
}

async function p2019day2_part2(input: string) {
	const vn = input.split(",").map(BigInt);
	for (let i = 0; i < 100; ++i) {
		for (let j = 0; j < 100; ++j) {
			vn[1] = BigInt(i);
			vn[2] = BigInt(j);
			const result = compute(vn);
			if (result[0] === 19690720n) {
				return 100 * i + j;
			}
		}
	}
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests()
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2019day2_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2019day2_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2019day2_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2019day2_part2(input));
	const part2After = performance.now();
	
	logSolution(part1Solution, part2Solution);

	log(chalk.gray("--- Performance ---"));
	log(chalk.gray(`Part 1: ${util.msToString(part1After - part1Before)}`));
	log(chalk.gray(`Part 2: ${util.msToString(part2After - part2Before)}`));
	log();
}

run()
	.then(() => {
		process.exit();
	})
	.catch(error => {
		throw error;
	});
