import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2023;
const DAY = 2;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/02/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/02/data.txt
// problem url  : https://adventofcode.com/2023/day/2

async function p2023day2_part1(input: string, ...params: any[]) {
	const lines = input.split("\n");
	const maxRed = 12;
	const maxGreen = 13;
	const maxBlue = 14;
	let sum = 0;
	for (const line of lines) {
		const [gameIdStr, rest] = line.split(": ");
		const gameId = Number(gameIdStr.split(" ")[1]);
		const sets = rest.split("; ");
		let isPossible = true;
		for (const set of sets) {
			const cubeStrs = set.split(", ");
			for (const cubeStr of cubeStrs) {
				const [count, color] = cubeStr.split(" ");
				const countNum = Number(count);
				if (color === "red" && countNum > maxRed) {
					isPossible = false;
					break;
				}
				if (color === "green" && countNum > maxGreen) {
					isPossible = false;
					break;
				}
				if (color === "blue" && countNum > maxBlue) {
					isPossible = false;
					break;
				}
			}
		}
		if (isPossible) {
			sum += gameId;
		}
	}
	return sum;
}

async function p2023day2_part2(input: string, ...params: any[]) {
	const lines = input.split("\n");
	let sum = 0;
	for (const line of lines) {
		const [gameIdStr, rest] = line.split(": ");
		const gameId = Number(gameIdStr.split(" ")[1]);
		const sets = rest.split("; ");
		let minRed = 0;
		let minGreen = 0;
		let minBlue = 0;
		for (const set of sets) {
			const cubeStrs = set.split(", ");
			for (const cubeStr of cubeStrs) {
				const [count, color] = cubeStr.split(" ");
				const countNum = Number(count);
				if (color === "red") {
					minRed = Math.max(minRed, countNum);
				}
				if (color === "green") {
					minGreen = Math.max(minGreen, countNum);
				}
				if (color === "blue") {
					minBlue = Math.max(minBlue, countNum);
				}
			}
		}
		sum += minRed * minGreen * minBlue;
	}
	return sum;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green
Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue
Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red
Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red
Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green`,
			extraArgs: [],
			expected: `8`,
			expectedPart2: `2286`
		},
	];
	const part2tests: TestCase[] = [];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2023day2_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2023day2_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2023day2_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2023day2_part2(input));
	const part2After = performance.now();

	logSolution(3, 2023, part1Solution, part2Solution);

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
