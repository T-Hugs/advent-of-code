import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2015;
const DAY = 11;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2015/11/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2015/11/data.txt
// problem url  : https://adventofcode.com/2015/day/11

function getNext(str: string) {
	let result = str.split("");
	for (let i = str.length - 1; i >= 0; --i) {
		if (str[i] === "z") {
			result[i] = "a";
		} else {
			result[i] = String.fromCharCode(str[i].charCodeAt(0) + 1);
			break;
		}
	}
	return result.join("");
}
function isGood(str: string) {
	const strAsNums = str.split("").map(c => c.charCodeAt(0));
	let test1 = false;
	for (let i = 2; i < strAsNums.length; ++i) {
		if (strAsNums[i] === strAsNums[i - 1] + 1 && strAsNums[i] === strAsNums[i - 2] + 2) {
			test1 = true;
			break;
		}
	}
	const test2 = !/[iol]/.test(str);
	const test3 = /(.)\1.*?(.)\2/.test(str);

	return test1 && test2 && test3;
}
async function p2015day11_part1(input: string) {
	let nextPw = getNext(input);
	while (!isGood(nextPw)) {
		nextPw = getNext(nextPw);
	}
	return nextPw;
}

async function p2015day11_part2(input: string) {
	let nextPw = getNext(await p2015day11_part1(input));
	while (!isGood(nextPw)) {
		nextPw = getNext(nextPw);
	}
	return nextPw;
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2015day11_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2015day11_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2015day11_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2015day11_part2(input));
	const part2After = performance.now();

	logSolution(11, 2015, part1Solution, part2Solution);

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
