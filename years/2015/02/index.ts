import _, { has } from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2015;
const DAY = 2;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2015/02/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2015/02/data.txt
// problem url  : https://adventofcode.com/2015/day/2

async function p2015day2_part1(input: string) {
	const lines = input.split("\n");
	let total = 0;
	for (const line of lines) {
		const [l, w, h] = line.split("x").map(Number);
		const [side1, side2, side3] = [l * w, w * h, l * h];
		const sa = 2 * side1 + 2 * side2 + 2 * side3;
		const smallest = Math.min(side1, side2, side3);
		total += sa + smallest;
	}
	return total;
}

async function p2015day2_part2(input: string) {
	const lines = input.split("\n");
	let total = 0;
	for (const line of lines) {
		const lwh = line.split("x").map(Number);
		const [l, w, h] = lwh;
		const smallest = Math.min(...lwh);
		lwh.splice(lwh.indexOf(smallest), 1);
		const smallest2 = Math.min(...lwh);
		const perimeter = 2 * (smallest + smallest2);
		const bow = l * w * h;
		total += perimeter + bow;
	}
	return total;
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2015day2_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2015day2_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2015day2_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2015day2_part2(input));
	const part2After = performance.now();

	logSolution(2, 2015, part1Solution, part2Solution);

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
