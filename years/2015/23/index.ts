import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { register } from "ts-node";

const YEAR = 2015;
const DAY = 23;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2015/23/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2015/23/data.txt
// problem url  : https://adventofcode.com/2015/day/23

function runProgram(program: string[], registers: { [name: string]: number } = {}) {
	function ensureRegister(name: string) {
		if (registers[name] == undefined) {
			registers[name] = 0;
		}
	}
	ensureRegister("pc");
	while (true) {
		const instruction = program[registers.pc];
		if (!instruction) {
			break;
		}

		const opcode = instruction.substr(0, 3);
		const args = instruction.substr(4);
		let val: number;
		let reg: string, _val: string;
		switch (opcode) {
			case "hlf":
				ensureRegister(args);
				registers[args] = Math.floor(registers[args] / 2);
				registers.pc++;
				break;
			case "tpl":
				ensureRegister(args);
				registers[args] = registers[args] * 3;
				registers.pc++;
				break;
			case "inc":
				ensureRegister(args);
				registers[args]++;
				registers.pc++;
				break;
			case "jmp":
				val = Number(args);
				registers.pc += val;
				break;
			case "jie":
				[reg, _val] = args.split(",").map(v => v.trim());
				ensureRegister(reg);
				val = Number(_val);
				if (registers[reg] % 2 === 0) {
					registers.pc += val;
				} else {
					registers.pc++;
				}
				break;
			case "jio":
				[reg, _val] = args.split(",").map(v => v.trim());
				ensureRegister(reg);
				val = Number(_val);
				if (registers[reg] === 1) {
					registers.pc += val;
				} else {
					registers.pc++;
				}
				break;
		}
	}
	return registers;
}

async function p2015day23_part1(input: string) {
	const lines = input.split("\n");
	return runProgram(lines)["b"];
}

async function p2015day23_part2(input: string) {
	const lines = input.split("\n");
	return runProgram(lines, { a: 1 })["b"];
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2015day23_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2015day23_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2015day23_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2015day23_part2(input));
	const part2After = performance.now();

	logSolution(23, 2015, part1Solution, part2Solution);

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
