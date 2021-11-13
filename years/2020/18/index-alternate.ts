import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2020;
const DAY = 18;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2020/18/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2020/18/data.txt
// problem url  : https://adventofcode.com/2020/day/18

function calc1(str: string) {
	const noSpace = str.replace(/\s/g, "");
	const nums = noSpace
		.split(/\*|\+/)
		.map(x => x.trim())
		.filter(x => x !== "")
		.map(Number);
	const operators = noSpace
		.split(/\d/)
		.map(x => x.trim())
		.filter(x => x !== "");

	let result = nums[0];
	for (let i = 1; i < nums.length; ++i) {
		const op = operators[i - 1];
		if (op === "+") {
			result += nums[i];
		} else if (op === "*") {
			result *= nums[i];
		}
	}
	return result;
}
async function p2020day18_part1(input: string) {
	const lines = input.split("\n");
	let sum = 0;
	for (const line of lines) {
		let updatedLine = line;
		while (/\([^(]*?\)/.test(updatedLine)) {
			const match = /\([^(]*?\)/.exec(updatedLine)!;
			const result = calc1(match[0].trim().slice(1, -1));
			updatedLine = updatedLine.replace(match[0], String(result));
		}
		sum += calc1(updatedLine);
	}
	return sum;
}
function calc2(str: string) {
	let working = str.replace(/\s/g, "");
	while (/(\d+)\+(\d+)/.test(working)) {
		const match = /(\d+)\+(\d+)/.exec(working)!;
		const [num1, num2] = match.slice(1).map(Number);
		const result = num1 + num2;
		working = working.replace(match[0], String(result));
	}
	return calc1(working);
}
async function p2020day18_part2(input: string) {
	const lines = input.split("\n");
	let sum = 0;
	for (const line of lines) {
		let updatedLine = line;
		while (/\([^(]*?\)/.test(updatedLine)) {
			const match = /\([^(]*?\)/.exec(updatedLine)!;
			const result = calc2(match[0].trim().slice(1, -1));
			updatedLine = updatedLine.replace(match[0], String(result));
		}
		sum += calc2(updatedLine);
	}
	return sum;
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2020day18_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2020day18_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2020day18_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2020day18_part2(input));
	const part2After = performance.now();

	logSolution(18, 2020, part1Solution, part2Solution);

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
