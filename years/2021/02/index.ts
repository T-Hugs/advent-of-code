import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2021;
const DAY = 2;

// solution path: C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\02\index.ts
// data path    : C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\02\data.txt
// problem url  : https://adventofcode.com/2021/day/2

async function p2021day2_part1(input: string, ...params: any[]) {
	const lines = input.split("\n");
	let depth = 0;
	let horiz = 0;
	for (const line of lines) {
		const [dir, _qty] = line.split(" ");
		const qty = Number(_qty);
		if (dir === "forward") {
			horiz += qty;
		} else if (dir === "down") {
			depth += qty;
		} else if (dir === "up") {
			depth -= qty;
		}
	}
	return horiz * depth;
}

async function p2021day2_part2(input: string, ...params: any[]) {
	const lines = input.split("\n");
	let depth = 0;
	let horiz = 0;
	let aim = 0;
	for (const line of lines) {
		const [dir, _qty] = line.split(" ");
		const qty = Number(_qty);
		if (dir === "forward") {
			horiz += qty;
			depth += qty * aim;
		} else if (dir === "down") {
			aim += qty;
		} else if (dir === "up") {
			aim -= qty;
		}
	}
	return horiz * depth;
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2021day2_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2021day2_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2021day2_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2021day2_part2(input));
	const part2After = performance.now();

	logSolution(2, 2021, part1Solution, part2Solution);

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
