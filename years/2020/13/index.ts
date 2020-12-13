import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import * as LOGUTIL from "../../../util/log";
import { performance } from "perf_hooks";
const { log, logSolution, trace } = LOGUTIL;

const YEAR = 2020;
const DAY = 13;
const DEBUG = true;
LOGUTIL.setDebug(DEBUG);

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

async function p2020day13_part2(input: string) {
	const lines = input.split("\n");
	const depart = Number(lines[0]);
	const ids: Obj<number> = {};
	let i = 0;
	for (const e of lines[1].split(",")) {
		if (e !== "x") {
			ids[i] = Number(e);
		}
		i++;
	}
	let wa = "solve x = ";
	for (const bus of Object.keys(ids)) {
		let mod = ids[bus];
		let rhs = Number(bus);
		wa += `x = ${rhs} (mod ${mod}), `
	}

	return wa;

	// A = 7x
	// A = 13y - 1
	// A = 59z - 4
	// A = 31w - 6
	// A = 19v - 7

	// A = 0 (mod 7)
	// A = 1 (mod 13)
	// A = 4 (mod 59)
	// A = 6 (mod 31)
	// A = 7 (mod 19)

	//, x = 48 (mod 29), x = 50 (mod 853), x = 56 (mod 37), x = 73 (mod 23)

// lcm 19, 41, 523, 17, 13, 29, 853, 37, 23 = 1895431131329359
//x = 0 (mod 19), x = 9 (mod 41), x = 19 (mod 523), x = 36 (mod 17), x = 37 (mod 13), x = 48 (mod 29), x = 50 (mod 853), x = 56 (mod 37), x = 73 (mod 23), = 1684818206450117

}

async function run() {
	const part1tests: TestCase[] = [{
		input: `939
7,13,x,x,59,x,31,19`,
		expected: `295`
	}];
	const part2tests: TestCase[] = [{
		input: `
7,13,x,x,59,x,31,19`,
		expected: `1068781`
	},{
		input: `
17,x,13,19`,
		expected: `3417`
	}];

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

	const part2Before = performance.now()
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
