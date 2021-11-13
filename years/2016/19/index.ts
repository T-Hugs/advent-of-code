import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2016;
const DAY = 19;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2016/19/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2016/19/data.txt
// problem url  : https://adventofcode.com/2016/day/19

async function p2016day19_part1(input: string) {
	const presentCount = new Array<number>(Number(input)).fill(1);

	for (let i = 0; i < presentCount.length; i = (i + 1) % presentCount.length) {
		const elf = presentCount[i];
		if (elf > 0) {
			let nextPos = (i) % presentCount.length;
			do {
				nextPos = (nextPos + 1) % presentCount.length;
				if (nextPos === i) {
					return i + 1;
				}
			} while (presentCount[nextPos] === 0);
			presentCount[i] += presentCount[nextPos];
			presentCount[nextPos] = 0;
		}
	}
}

async function p2016day19_part2(input: string) {
	const presentCount = new Array<number>(Number(input)).fill(1);
	let elfCount = Number(input);
	for (let i = 0; i < presentCount.length; i = (i + 1) % presentCount.length) {
		const elf = presentCount[i];
		if (elf > 0) {
			let nextPos = (i + Math.floor(elfCount / 2)) % presentCount.length;
			do {
				nextPos = (nextPos + 1) % presentCount.length;
				if (nextPos === i) {
					return i + 1;
				}
			} while (presentCount[nextPos] === 0);
			presentCount[i] += presentCount[nextPos];
			presentCount[nextPos] = 0;
			elfCount--;
		}
	}}

async function run() {
	const part1tests: TestCase[] = [{
		input: `5`,
		expected: `3`
	},{
		input: `5`,
		expected: `2`
	}];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2016day19_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2016day19_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2016day19_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2016day19_part2(input));
	const part2After = performance.now();

	logSolution(19, 2016, part1Solution, part2Solution);

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
