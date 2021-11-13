import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2016;
const DAY = 12;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2016/12/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2016/12/data.txt
// problem url  : https://adventofcode.com/2016/day/12

async function p2016day12_part1(input: string) {
	const lines = input.split("\n");
	const registers: Obj<number> = {};
	function getVal(arg: string) {
		let val: number = registers[arg] ?? 0;
		if (/\d+/.test(arg)) {
			val = Number(arg);
		}
		return val;
	}
	let pc = 0;
	while (true) {
		const line = lines[pc];
		if (!line) {
			break;
		}
		const split = line.split(" ");
		const command = split[0];
		if (command === "cpy") {
			registers[split[2]] = getVal(split[1]);
			pc++;
		} else if (command === "inc") {
			if (registers[split[1]] == undefined) {
				registers[split[1]] = 0;
			}
			registers[split[1]]++;
			pc++;
		} else if (command === "dec") {
			if (registers[split[1]] == undefined) {
				registers[split[1]] = 0;
			}
			registers[split[1]]--;
			pc++;
		} else if (command === "jnz") {
			if (getVal(split[1]) !== 0) {
				pc += getVal(split[2]);
			} else {
				pc++;
			}
		}
	}
	return registers.a;
}

async function p2016day12_part2(input: string) {
	const lines = input.split("\n");
	const registers: Obj<number> = { c: 1 };
	function getVal(arg: string) {
		let val: number = registers[arg] ?? 0;
		if (/\d+/.test(arg)) {
			val = Number(arg);
		}
		return val;
	}
	let pc = 0;
	while (true) {
		const line = lines[pc];
		if (!line) {
			break;
		}
		const split = line.split(" ");
		const command = split[0];
		if (command === "cpy") {
			registers[split[2]] = getVal(split[1]);
			pc++;
		} else if (command === "inc") {
			if (registers[split[1]] == undefined) {
				registers[split[1]] = 0;
			}
			registers[split[1]]++;
			pc++;
		} else if (command === "dec") {
			if (registers[split[1]] == undefined) {
				registers[split[1]] = 0;
			}
			registers[split[1]]--;
			pc++;
		} else if (command === "jnz") {
			if (getVal(split[1]) !== 0) {
				pc += getVal(split[2]);
			} else {
				pc++;
			}
		}
	}
	return registers.a;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `cpy 41 a
inc a
inc a
dec a
jnz a 2
dec a`,
			expected: `42`,
		},
	];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2016day12_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2016day12_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2016day12_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2016day12_part2(input));
	const part2After = performance.now();

	logSolution(12, 2016, part1Solution, part2Solution);

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
