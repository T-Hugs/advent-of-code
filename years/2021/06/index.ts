import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2021;
const DAY = 6;

// solution path: C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\06\index.ts
// data path    : C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\06\data.txt
// problem url  : https://adventofcode.com/2021/day/6

async function p2021day6_part1(input: string, ...params: any[]) {
	const fish = input.split(",").map(Number);
	const map: { [age: string]: number } = {};
	for (const f of fish) {
		if (map[f] === undefined) {
			map[f] = 0;
		}
		map[f]++;
	}
	for (let i = 0; i < 80; ++i) {
		const at0 = map[0];
		for (let j = 0; j < 8; ++j) {
			map[j] = map[j + 1] || 0;
		}
		map[8] = at0;
		map[6] = at0 + map[6];
	}
	return Object.values(map).reduce((a, b) => a + b, 0);
}

async function p2021day6_part2(input: string, ...params: any[]) {
	const fish = input.split(",").map(Number);
	const map: { [age: string]: number } = {};
	for (const f of fish) {
		if (map[f] === undefined) {
			map[f] = 0;
		}
		map[f]++;
	}
	for (let i = 0; i < 256; ++i) {
		const at0 = map[0];
		for (let j = 0; j < 8; ++j) {
			map[j] = map[j + 1] || 0;
		}
		map[8] = at0;
		map[6] = at0 + map[6];
	}
	return Object.values(map).reduce((a, b) => a + b, 0);
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `3,4,3,1,2`,
		extraArgs: [],
		expected: `5934`
	}];
	const part2tests: TestCase[] = [{
		input: `3,4,3,1,2`,
		extraArgs: [],
		expected: `26984457539`
	}];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2021day6_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2021day6_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2021day6_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2021day6_part2(input));
	const part2After = performance.now();

	logSolution(6, 2021, part1Solution, part2Solution);

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
