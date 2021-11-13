import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import crypto from "crypto";

const YEAR = 2016;
const DAY = 5;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2016/05/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2016/05/data.txt
// problem url  : https://adventofcode.com/2016/day/5

async function p2016day5_part1(input: string) {
	let pw = "";
	for (let i = 0; ; ++i) {
		const toHash = input + i;
		const hash = util.md5(toHash);
		if (hash.startsWith("00000")) {
			pw += hash[5]
		}
		if (pw.length === 8) {
			return pw;
		}
	}
}

async function p2016day5_part2(input: string) {
	let pw: string[] = [];
	let charsFound = 0;
	for (let i = 0; ; ++i) {
		const toHash = input + i;
		const hash = util.md5(toHash);
		if (hash.startsWith("00000")) {
			const pos = Number(hash[5]);
			if (!isNaN(pos) && pos < 8 && !pw[pos]) {
				pw[pos] = hash[6];
				charsFound++;
				if (charsFound === 8) {
					return pw.join("");
				}
			}
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
		test.logTestResult(testCase, String(await p2016day5_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2016day5_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2016day5_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2016day5_part2(input));
	const part2After = performance.now();
	
	logSolution(5, 2016, part1Solution, part2Solution);

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
