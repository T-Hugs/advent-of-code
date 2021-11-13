import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2015;
const DAY = 8;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2015/08/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2015/08/data.txt
// problem url  : https://adventofcode.com/2015/day/8

async function p2015day8_part1(input: string) {
	const lines = input.split("\n");
	const codeChars = input.length - (lines.length - 1);
	let regChars = 0;
	for (const line of lines) {
		const noSurroundingQuotes = line.slice(1, line.length - 1);
		const quotesAndBackslashes = util.replaceAll(noSurroundingQuotes, {"\\\\": "\\", "\\\"": "\""});
		const ascii = quotesAndBackslashes.replace(/\\x([0-9a-f]{2})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16)));
		regChars += ascii.split("").length;
	}
	return codeChars - regChars;
}

async function p2015day8_part2(input: string) {
	const lines = input.split("\n");
	const codeChars = input.length - (lines.length - 1);
	let newChars = 0;
	for (const line of lines) {
		const newStr = line.replace(/([\\\"])/g, m => "\\" + m);
		newChars += newStr.length + 2;
	}
	return newChars - codeChars;
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `""
"abc"
"aaa\\"aaa"
"\\x27"`,
		expected: `12`
	}];
	const part2tests: TestCase[] = [{
		input: `""
"abc"
"aaa\\"aaa"
"\\x27"`,
		expected: `19`
	}];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2015day8_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2015day8_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2015day8_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2015day8_part2(input));
	const part2After = performance.now();
	
	logSolution(8, 2015, part1Solution, part2Solution);

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
