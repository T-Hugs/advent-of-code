import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2015;
const DAY = 7;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2015/07/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2015/07/data.txt
// problem url  : https://adventofcode.com/2015/day/7

async function p2015day7_part1(input: string) {
	const lines = input.split("\n");
	const signals: { [name: string]: number } = {};
	while (true) {
		let stillWaiting = false;
		for (const line of lines) {
			const [input, output] = line.split("->").map(x => x.trim());
			if (input.includes("AND")) {
				const operation = "AND";
				const [lhs, rhs] = input
					.split(operation)
					.map(v => v.trim())
					.map(v => (Number.isNaN(Number(v)) ? signals[v] : Number(v)));
				if (lhs != undefined && rhs != undefined) {
					signals[output] = lhs & rhs;
				} else {
					stillWaiting = true;
				}
			} else if (input.includes("OR")) {
				const operation = "OR";
				const [lhs, rhs] = input
					.split(operation)
					.map(v => v.trim())
					.map(v => (Number.isNaN(Number(v)) ? signals[v] : Number(v)));
				if (lhs != undefined && rhs != undefined) {
					signals[output] = lhs | rhs;
				} else {
					stillWaiting = true;
				}
			} else if (input.includes("LSHIFT")) {
				const operation = "LSHIFT";
				const [lhs, rhs] = input
					.split(operation)
					.map(v => v.trim())
					.map(v => (Number.isNaN(Number(v)) ? signals[v] : Number(v)));
				if (lhs != undefined && rhs != undefined) {
					signals[output] = lhs << rhs;
				} else {
					stillWaiting = true;
				}
			} else if (input.includes("RSHIFT")) {
				const operation = "RSHIFT";
				const [lhs, rhs] = input
					.split(operation)
					.map(v => v.trim())
					.map(v => (Number.isNaN(Number(v)) ? signals[v] : Number(v)));
				if (lhs != undefined && rhs != undefined) {
					signals[output] = lhs >> rhs;
				} else {
					stillWaiting = true;
				}
			} else if (input.includes("NOT")) {
				const operand = input.substr(4);
				const value = Number.isNaN(Number(operand)) ? signals[operand] : Number(operand);
				if (value != undefined) {
					signals[output] = ~value;
				} else {
					stillWaiting = true;
				}
			} else {
				const lhs = Number.isNaN(Number(input)) ? signals[input] : Number(input);
				if (lhs != undefined) {
					signals[output] = lhs;
				} else {
					stillWaiting = true;
				}
			}
		}
		if (!stillWaiting) {
			break;
		}
	}
	return signals["a"] & 0xffff;
}

async function p2015day7_part2(input: string) {
	const lines = input.split("\n");
	const signals: { [name: string]: number } = {b: await p2015day7_part1(input)};
	while (true) {
		let stillWaiting = false;
		for (const line of lines) {
			const [input, output] = line.split("->").map(x => x.trim());
			if (input.includes("AND")) {
				const operation = "AND";
				const [lhs, rhs] = input
					.split(operation)
					.map(v => v.trim())
					.map(v => (Number.isNaN(Number(v)) ? signals[v] : Number(v)));
				if (lhs != undefined && rhs != undefined) {
					signals[output] = lhs & rhs;
				} else {
					stillWaiting = true;
				}
			} else if (input.includes("OR")) {
				const operation = "OR";
				const [lhs, rhs] = input
					.split(operation)
					.map(v => v.trim())
					.map(v => (Number.isNaN(Number(v)) ? signals[v] : Number(v)));
				if (lhs != undefined && rhs != undefined) {
					signals[output] = lhs | rhs;
				} else {
					stillWaiting = true;
				}
			} else if (input.includes("LSHIFT")) {
				const operation = "LSHIFT";
				const [lhs, rhs] = input
					.split(operation)
					.map(v => v.trim())
					.map(v => (Number.isNaN(Number(v)) ? signals[v] : Number(v)));
				if (lhs != undefined && rhs != undefined) {
					signals[output] = lhs << rhs;
				} else {
					stillWaiting = true;
				}
			} else if (input.includes("RSHIFT")) {
				const operation = "RSHIFT";
				const [lhs, rhs] = input
					.split(operation)
					.map(v => v.trim())
					.map(v => (Number.isNaN(Number(v)) ? signals[v] : Number(v)));
				if (lhs != undefined && rhs != undefined) {
					signals[output] = lhs >> rhs;
				} else {
					stillWaiting = true;
				}
			} else if (input.includes("NOT")) {
				const operand = input.substr(4);
				const value = Number.isNaN(Number(operand)) ? signals[operand] : Number(operand);
				if (value != undefined) {
					signals[output] = ~value;
				} else {
					stillWaiting = true;
				}
			} else {
				if (output === "b") {
					continue;
				}
				const lhs = Number.isNaN(Number(input)) ? signals[input] : Number(input);
				if (lhs != undefined) {
					signals[output] = lhs;
				} else {
					stillWaiting = true;
				}
			}
		}
		if (!stillWaiting) {
			break;
		}
	}
	return signals["a"] & 0xffff;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `123 -> x
456 -> y
x AND y -> d
x OR y -> e
x LSHIFT 2 -> f
y RSHIFT 2 -> g
NOT x -> h
NOT y -> i`,
			expected: `undefined`,
		},
	];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		//test.logTestResult(testCase, String(await p2015day7_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2015day7_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2015day7_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2015day7_part2(input));
	const part2After = performance.now();

	logSolution(7, 2015, part1Solution, part2Solution);

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
