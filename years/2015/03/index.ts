import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2015;
const DAY = 3;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2015/03/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2015/03/data.txt
// problem url  : https://adventofcode.com/2015/day/3

async function p2015day3_part1(input: string) {
	const moves = input.split("");
	const visited = new Set<string>();
	let currentPos = [0, 0];
	for (const move of moves) {
		visited.add(`${currentPos[0]},${currentPos[1]}`);
		switch (move) {
			case ">":
				currentPos[1]++;
				break;
			case "<":
				currentPos[1]--;
				break;
			case "v":
				currentPos[0]++;
				break;
			case "^":
				currentPos[0]--;
				break;
		}
	}
	return visited.size;
}

async function p2015day3_part2(input: string) {
	const moves = input.split("");
	const visited = new Set<string>();
	let santaPos = [0, 0];
	let roboPos = [0, 0];
	let turn = false;
	for (const move of moves) {
		visited.add(`${santaPos[0]},${santaPos[1]}`);
		visited.add(`${roboPos[0]},${roboPos[1]}`);
		if (turn) {
			switch (move) {
				case ">":
					santaPos[1]++;
					break;
				case "<":
					santaPos[1]--;
					break;
				case "v":
					santaPos[0]++;
					break;
				case "^":
					santaPos[0]--;
					break;
			}
		} else {
			switch (move) {
				case ">":
					roboPos[1]++;
					break;
				case "<":
					roboPos[1]--;
					break;
				case "v":
					roboPos[0]++;
					break;
				case "^":
					roboPos[0]--;
					break;
			}
		}
		turn = !turn;
	}
	return visited.size;
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2015day3_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2015day3_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2015day3_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2015day3_part2(input));
	const part2After = performance.now();

	logSolution(3, 2015, part1Solution, part2Solution);

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
