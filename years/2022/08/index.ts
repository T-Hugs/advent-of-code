import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { Dir, Grid } from "../../../util/grid";

const YEAR = 2022;
const DAY = 8;

// solution path: C:\Users\trgau\dev\t-hugs\advent-of-code\years\2022\08\index.ts
// data path    : C:\Users\trgau\dev\t-hugs\advent-of-code\years\2022\08\data.txt
// problem url  : https://adventofcode.com/2022/day/8

async function p2022day8_part1(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input });
	let visCount = 0;
	for (const cell of grid) {
		const treeHeight = Number(cell.value);
		const neighbors = cell.neighbors(false);
		if (neighbors.length < 4) {
			visCount++;
			continue;
		}

		let doneChecking = false;
		for (const direction of [Dir.N, Dir.E, Dir.W, Dir.S]) {
			let current = cell;
			while (true) {
				const next = current.repeatMovements([direction]);
				if (!next) {
					visCount++;
					doneChecking = true;
					break;
				} else {
					const nextHeight = Number(next.value);
					if (nextHeight < treeHeight) {
						current = next;
					} else {
						break;
					}
				}
			}
			if (doneChecking) {
				break;
			}
		}
	}
	return visCount;
}

async function p2022day8_part2(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input });
	const allScores = [];
	for (const cell of grid) {
		const treeHeight = Number(cell.value);
		let score = 1;
		for (const direction of [Dir.N, Dir.E, Dir.W, Dir.S]) {
			let current = cell;
			let directionalScore = 0;
			while (true) {
				const next = current.repeatMovements([direction]);
				if (!next) {
					break;
				}
				directionalScore++;
				if (Number(next.value) < treeHeight) {
					current = next;
				} else {
					break;
				}
			}
			score *= directionalScore;
		}
		allScores.push(score);
	}
	return Math.max(...allScores);
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `30373
25512
65332
33549
35390`,
			extraArgs: [],
			expected: `21`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `30373
25512
65332
33549
35390`,
			extraArgs: [],
			expected: `8`,
		},
	];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2022day8_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2022day8_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2022day8_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2022day8_part2(input));
	const part2After = performance.now();

	logSolution(8, 2022, part1Solution, part2Solution);

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
