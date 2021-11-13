import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2019;
const DAY = 3;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2019/03/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2019/03/data.txt
// problem url  : https://adventofcode.com/2019/day/3

async function p2019day3_part1(input: string) {
	const [wire1, wire2] = input.split("\n").map(w => w.split(","));
	const locations: { [loc: string]: boolean } = {};
	const crosses: number[][] = [];
	for (const wire of [wire1, wire2]) {
		const wirePos: [number, number] = [0, 0];
		for (const segment of wire) {
			const dir = segment[0];
			const len = Number(segment.substr(1));
			for (let i = 0; i < len; ++i) {
				if (dir === "U") {
					wirePos[0]--;
				} else if (dir === "R") {
					wirePos[1]++;
				} else if (dir === "D") {
					wirePos[0]++;
				} else if (dir === "L") {
					wirePos[1]--;
				}

				const key = wirePos.toString();
				if (wire === wire1) {
					locations[key] = true;
				} else {
					if (locations[key]) {
						crosses.push([...wirePos]);
					}
				}
			}
		}
	}
	crosses.sort((a, b) => Math.abs(a[0]) + Math.abs(a[1]) - (Math.abs(b[0]) + Math.abs(b[1])));
	return Math.abs(crosses[0][0]) + Math.abs(crosses[0][1]);
}

async function p2019day3_part2(input: string) {
	const [wire1, wire2] = input.split("\n").map(w => w.split(","));
	const locations: { [loc: string]: number } = {};
	const crosses: [segment: [row: number, col: number], steps: number][] = [];
	for (const wire of [wire1, wire2]) {
		const wirePos: [number, number] = [0, 0];
		let step = 0;
		for (const segment of wire) {
			const dir = segment[0];
			const len = Number(segment.substr(1));
			for (let i = 0; i < len; ++i) {
				step++;
				if (dir === "U") {
					wirePos[0]--;
				} else if (dir === "R") {
					wirePos[1]++;
				} else if (dir === "D") {
					wirePos[0]++;
				} else if (dir === "L") {
					wirePos[1]--;
				}

				const key = wirePos.toString();
				if (wire === wire1) {
					locations[key] = step;
				} else {
					if (locations[key] != undefined) {
						crosses.push([[...wirePos], locations[key] + step]);
					}
				}
			}
		}
	}
	crosses.sort((a, b) => a[1] - b[1]);
	return crosses[0][1];
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2019day3_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2019day3_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2019day3_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2019day3_part2(input));
	const part2After = performance.now();

	logSolution(3, 2019, part1Solution, part2Solution);

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
