import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2016;
const DAY = 14;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2016/14/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2016/14/data.txt
// problem url  : https://adventofcode.com/2016/day/14

function findRun(str: string, len: number) {
	outer: for (let i = 0; i < str.length - (len - 1); ++i) {
		for (let j = i + 1; j < i + len; ++j) {
			if (str[i] !== str[j]) {
				continue outer;
			}
		}
		return str[i];
	}
}

async function p2016day14_part1(input: string) {
	let i = 0;
	let keys: number[] = [];
	while (true) {
		const nextHash = util.md5(input + i);
		const trip = findRun(nextHash, 3);
		if (trip) {
			for (let j = i + 1; j < i + 1001; j++) {
				const checkHash = util.md5(input + j);
				if (findRun(checkHash, 5) === trip) {
					keys.push(i);
					console.log(`Key found: ${i} ( ${keys.length} total)`);
					if (keys.length === 64) {
						return i;
					}
					break;
				}
			}
		}
		++i;
	}
}
const memo: Obj<string> = {};
function hash(str: string) {
	if (memo[str]) {
		return memo[str];
	}
	let current = str;
	for (let i = 0; i <= 2016; ++i) {
		current = util.md5(current);
	}
	memo[str] = current;
	return current;
}
async function p2016day14_part2(input: string) {
	let i = 0;
	let keys: number[] = [];
	while (true) {
		const nextHash = hash(input + i);
		const trip = findRun(nextHash, 3);
		if (trip) {
			for (let j = i + 1; j < i + 1001; j++) {
				const checkHash = hash(input + j);
				if (findRun(checkHash, 5) === trip) {
					keys.push(i);
					console.log(`Key found: ${i} ( ${keys.length} total)`);
					if (keys.length === 64) {
						return i;
					}
					break;
				}
			}
		}
		++i;
	}
}

async function run() {
	const part1tests: TestCase[] = [
		// {
		// 	input: `abc`,
		// 	expected: `22728`,
		// },
	];
	const part2tests: TestCase[] = [
		// {
		// 	input: `abc`,
		// 	expected: `22728`,
		// },
	];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2016day14_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2016day14_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2016day14_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2016day14_part2(input));
	const part2After = performance.now();

	logSolution(14, 2016, part1Solution, part2Solution);

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
