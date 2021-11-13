import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2015;
const DAY = 10;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2015/10/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2015/10/data.txt
// problem url  : https://adventofcode.com/2015/day/10

async function p2015day10_part1(input: string) {
	let answer = input;
	for (let i = 0; i < 40; ++i) {
		let result = "";
		while (answer.length > 0) {
			const match = /^(.)\1*/.exec(answer)![0];
			result += String(match.length) + match[0];
			answer = answer.substr(match.length);
		}
		answer = result;
	}
	return answer.length;
}

async function p2015day10_part2(input: string) {
	let answer = input;
	for (let i = 0; i < 50; ++i) {
		let result = "";
		while (answer.length > 0) {
			const match = /^(.)\1*/.exec(answer)![0];
			result += String(match.length) + match[0];
			answer = answer.substr(match.length);
		}
		answer = result;
	}
	return answer.length;
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2015day10_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2015day10_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2015day10_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2015day10_part2(input));
	const part2After = performance.now();
	
	logSolution(10, 2015, part1Solution, part2Solution);

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
