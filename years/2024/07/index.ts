import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2024;
const DAY = 7;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2024/07/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2024/07/data.txt
// problem url  : https://adventofcode.com/2024/day/7

async function p2024day7_part1(input: string, ...params: any[]) {
	const equations: Map<number, number[]> = new Map();
	const lines = input.split("\n");
	for (const line of lines) {
		const [resultStr, valuesStr] = line.split(": ");
		equations.set(Number(resultStr), valuesStr.split(" ").map(Number));
	}
	let sum = 0;
	for (const [target, values] of equations) {
		const permutations = Math.pow(2, values.length - 1);
		for (let i = 0; i < permutations; ++i) {
			const binary = i.toString(2).padStart(values.length - 1, "0");
			let answer = values[0];
			for (let j = 0; j < binary.length; ++j) {
				if (binary[j] === "0") {
					answer += values[j + 1];
				} else {
					answer *= values[j + 1];
				}
			}
			if (answer === target) {
				sum += target;
				break;
			}
		}
	}
	return sum;
}

async function p2024day7_part2(input: string, ...params: any[]) {
	const equations: Map<number, number[]> = new Map();
	const lines = input.split("\n");
	for (const line of lines) {
		const [resultStr, valuesStr] = line.split(": ");
		equations.set(Number(resultStr), valuesStr.split(" ").map(Number));
	}
	let sum = 0;
	for (const [target, values] of equations) {

		// Permutations is the number of ways to arrange the operators
		const permutations = Math.pow(3, values.length - 1);
		for (let i = 0; i < permutations; ++i) {

			// Turn i into base-3
			const trinary = i.toString(3).padStart(values.length - 1, "0");

			let answer = values[0];
			for (let j = 0; j < trinary.length; ++j) {
				
				// Turn the string representation of the base-3 number into a sequence of operators.
				if (trinary[j] === "0") {
					answer += values[j + 1];
				} else if (trinary[j] === "1") {
					answer *= values[j + 1];
				} else {
					answer = Number(String(answer) + values[j + 1]);
				}
			}
			if (answer === target) {
				sum += target;
				break;
			}
		}
	}
	return sum;
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `190: 10 19
3267: 81 40 27
83: 17 5
156: 15 6
7290: 6 8 6 15
161011: 16 10 13
192: 17 8 14
21037: 9 7 18 13
292: 11 6 16 20`,
		extraArgs: [],
		expected: `3749`,
		expectedPart2: `11387`,
	}];
	const part2tests: TestCase[] = [];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day7_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day7_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day7_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2024day7_part2(input));
	const part2After = performance.now();

	logSolution(7, 2024, part1Solution, part2Solution);

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
