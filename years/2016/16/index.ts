import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2016;
const DAY = 16;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2016/16/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2016/16/data.txt
// problem url  : https://adventofcode.com/2016/day/16

function step(str: string) {
	const a = str;
	let b = str;
	b = str.split("").reverse().join("");
	b = b.replace(/./g, c => c === "0" ? "1" : "0");
	return a + "0" + b;
}

function checksum(str: string) {
	if (str.length % 2 !== 0) {
		throw new Error("not even");
	}
	let result = str;
	while (result.length % 2 === 0) {
		let next = "";
		for (let i = 0; i < result.length; i += 2) {
			const [c1, c2] = result.substr(i, 2);
			if (c1 === c2) {
				next += "1";
			} else {
				next += "0";
			}
		}
		result = next;
	}
	return result;
}

async function p2016day16_part1(input: string, ...extraArgs: any[]) {
	const fillLen: number = extraArgs[0] ?? 272;
	let data = input;
	while (data.length < fillLen) {
		data = step(data);
	}
	data = data.substr(0, fillLen);
	return checksum(data);
}

async function p2016day16_part2(input: string, ...extraArgs: any[]) {
	const fillLen: number = extraArgs[0] ?? 35651584;
	let data = input;
	while (data.length < fillLen) {
		data = step(data);
	}
	data = data.substr(0, fillLen);
	return checksum(data);
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `10000`,
		extraArgs: [20],
		expected: `01100`
	}];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2016day16_part1(testCase.input, ...(testCase.extraArgs ?? []))));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2016day16_part2(testCase.input, ...(testCase.extraArgs ?? []))));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2016day16_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2016day16_part2(input));
	const part2After = performance.now();

	logSolution(16, 2016, part1Solution, part2Solution);

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
