import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2020;
const DAY = 13;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2020/13/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2020/13/data.txt
// problem url  : https://adventofcode.com/2020/day/13

async function p2020day13_part1(input: string) {
	const lines = input.split("\n");
	const depart = Number(lines[0]);
	const ids: number[] = [];
	for (const e of lines[1].split(",")) {
		if (e !== "x") {
			ids.push(Number(e));
		}
	}

	for (let i = depart; ; ++i) {
		for (const id of ids) {
			const departure = i / id;
			if (Math.floor(departure) === departure) {
				return id * (departure * id - depart);
			}
		}
	}
}

/**
 * compute the chinese remainder theorem, crt (for searching if needed later!)
 * Solves a system of modular equations in the form:
 * x = rem1 (mod m1)
 * x = rem2 (mod m2)
 * x = rem3 (mod m3)
 * ... etc
 */
function chineseRemainderTheorem(remainders: bigint[], mods: bigint[]) {
	const prod = mods.reduce((p, c) => p * c, 1n);
	return (
		mods
			.map((val: bigint, index: number) => {
				const p = prod / val;
				return remainders[index] * p * util.modInverse(p, val);
			})
			.reduce((p, c) => p + c, 0n) % prod
	);
}

async function p2020day13_part2(input: string) {
	const lines = input.split("\n");
	const ids: Obj<number> = {};
	let i = 0;
	for (const e of lines[1].split(",")) {
		if (e !== "x") {
			ids[i] = Number(e);
		}
		i++;
	}

	// @todo clean up all the BigInt crap
	const lcm = util.lcm(Object.values(ids).map(i => BigInt(i)));
	const crt = chineseRemainderTheorem(
		Object.keys(ids).map(i => BigInt(i)),
		Object.values(ids).map(i => BigInt(i))
	);

	return lcm - crt;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `939
7,13,x,x,59,x,31,19`,
			expected: `295`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `
7,13,x,x,59,x,31,19`,
			expected: `1068781`,
		},
		{
			input: `
17,x,13,19`,
			expected: `3417`,
		},
	];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2020day13_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2020day13_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2020day13_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2020day13_part2(input));
	const part2After = performance.now();

	logSolution(13, 2020, part1Solution, part2Solution);

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
