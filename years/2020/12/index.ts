import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2020;
const DAY = 12;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2020/12/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2020/12/data.txt
// problem url  : https://adventofcode.com/2020/day/12

async function p2020day12_part1(input: string) {
	const lines = input.split("\n");
	let currentDir = 1;
	let pos = [0, 0];
	for (const line of lines) {
		const dir = line[0];
		const dist = Number(line.substr(1));
		switch (dir) {
			case "N":
				pos[0] -= dist;
				continue;
			case "S":
				pos[0] += dist;
				continue;
			case "E":
				pos[1] += dist;
				continue;
			case "W":
				pos[1] -= dist;
				continue;
			case "L":
				currentDir = util.mod(currentDir - dist / 90, 4);
				continue;
			case "R":
				currentDir = util.mod(currentDir + dist / 90, 4);
				continue;
			case "F":
				if (currentDir === 0) {
					pos[0] -= dist;
				}
				if (currentDir === 1) {
					pos[1] += dist;
				}
				if (currentDir === 2) {
					pos[0] += dist;
				}
				if (currentDir === 3) {
					pos[1] -= dist;
				}
				break;
		}
	}
	return Math.abs(pos[0]) + Math.abs(pos[1]);
}

async function p2020day12_part2(input: string) {
	const lines = input.split("\n");
	let wp = [-1, 10];
	let pos = [0, 0];
	for (const line of lines) {
		const dir = line[0];
		const dist = Number(line.substr(1));
		const times = dist / 90;
		switch (dir) {
			case "N":
				wp[0] -= dist;
				continue;
			case "S":
				wp[0] += dist;
				continue;
			case "E":
				wp[1] += dist;
				continue;
			case "W":
				wp[1] -= dist;
				continue;
			case "L":
				for (let i = 0; i < times; ++i) {
					wp = [-wp[1], wp[0]];
				}
				continue;
			case "R":
				for (let i = 0; i < times; ++i) {
					wp = [wp[1], -wp[0]];
				}
				continue;
			case "F":
				pos[0] += wp[0] * dist;
				pos[1] += wp[1] * dist;
				continue;
		}
	}
	return Math.abs(pos[0]) + Math.abs(pos[1]);
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `F10
N3
F7
R90
F11`,
			expected: `25`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `F10
N3
F7
R90
F11`,
			expected: `286`,
		},
	];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2020day12_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2020day12_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2020day12_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2020day12_part2(input));
	const part2After = performance.now();

	logSolution(12, 2020, part1Solution, part2Solution);

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
