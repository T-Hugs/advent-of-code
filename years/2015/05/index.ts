import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2015;
const DAY = 5;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2015/05/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2015/05/data.txt
// problem url  : https://adventofcode.com/2015/day/5

async function p2015day5_part1(input: string) {
	const lines = input.split("\n");
	let nice = 0;
	for (const line of lines) {
		const has3vowels = /([aeiou]).*?([aeiou]).*?([aeiou])/.test(line);
		const doubled = /(.)\1/.test(line);
		const hasBad = /(ab)|(cd)|(pq)|(xy)/.test(line);
		if (has3vowels && doubled && !hasBad) {
			nice++;
		}
	}
	return nice;
}

async function p2015day5_part2(input: string) {
	const lines = input.split("\n");
	let nice = 0;
	for (const line of lines) {
		const twopairs = /(..).*?(\1)/.test(line);
		const sandwich = /(.).(\1)/.test(line);
		if (twopairs && sandwich) {
			nice++;
		}
	}
	return nice;
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2015day5_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2015day5_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2015day5_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2015day5_part2(input));
	const part2After = performance.now();
	
	logSolution(5, 2015, part1Solution, part2Solution);

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
