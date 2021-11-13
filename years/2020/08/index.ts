import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2020;
const DAY = 8;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2020/08/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2020/08/data.txt
// problem url  : https://adventofcode.com/2020/day/8

async function p2020day8_part1(input: string) {
	const lines = input.split("\n");
	const instructions: [string, number][] = [];
	for (const line of lines) {
		const [instruction, val] = line.split(" ");
		instructions.push([instruction, Number(val)]);
	}
	const linesExecuted: Obj<boolean> = {};
	let pc = 0;
	let acc = 0;
	while (true) {
		const currentInstruction = instructions[pc];
		if (linesExecuted[pc]) {
			return acc;
		}
		linesExecuted[pc] = true;
		if (currentInstruction[0] === "jmp") {
			pc += currentInstruction[1];
			continue;
		} else if (currentInstruction[0] === "acc") {
			acc += currentInstruction[1];
			pc++;
		} else if (currentInstruction[0] === "nop") {
			pc++;
		}
	}
}

async function p2020day8_part2(input: string) {
	const lines = input.split("\n");
	const instructions: [string, number][] = [];
	for (const line of lines) {
		const [instruction, val] = line.split(" ");
		instructions.push([instruction, Number(val)]);
	}
	
	let lineToChange = 0;
	while (true) {
		if (instructions[lineToChange][0] === "jmp") {
			instructions[lineToChange][0] = "nop";
		} else if (instructions[lineToChange][0] === "nop") {
			instructions[lineToChange][0] = "jmp";
		}
		const lineExecutionCount: Obj<number> = {};
		let acc = 0;
		let pc = 0;
		while (true) {
			const currentInstruction = instructions[pc];
			if (!currentInstruction) {
				return acc;
			}
			if (lineExecutionCount[pc] == undefined) {
				lineExecutionCount[pc] = 0;
			}
			lineExecutionCount[pc]++;
			if (lineExecutionCount[pc] > 10) {
				if (instructions[lineToChange][0] === "jmp") {
					instructions[lineToChange][0] = "nop";
				} else if (instructions[lineToChange][0] === "nop") {
					instructions[lineToChange][0] = "jmp";
				}
				lineToChange++;
				break;
			}
			if (currentInstruction[0] === "jmp") {
				pc += currentInstruction[1];
				continue;
			} else if (currentInstruction[0] === "acc") {
				acc += currentInstruction[1];
				pc++;
			} else if (currentInstruction[0] === "nop") {
				pc++;
			}
		}
	}
}


async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [{
		input: `nop +0
acc +1
jmp +4
acc +3
jmp -3
acc -99
acc +1
jmp -4
acc +6`,
		expected: `8`
	}];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2020day8_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2020day8_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2020day8_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2020day8_part2(input));
	const part2After = performance.now();
	
	logSolution(8, 2020, part1Solution, part2Solution);

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
