import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { Cell, Grid } from "../../../util/grid";

const YEAR = 2021;
const DAY = 11;

// solution path: C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\11\index.ts
// data path    : C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\11\data.txt
// problem url  : https://adventofcode.com/2021/day/11

function flash(cell: Cell, flashedThisRound: Set<string>) {
	if (flashedThisRound.has(cell.position.toString())) {
		return flashedThisRound;
	}
	flashedThisRound.add(cell.position.toString());
	const neighbors = cell.neighbors(true);
	for (const neighbor of neighbors) {
		let nVal = Number(neighbor.value);
		if (nVal >= 9) {
			flash(neighbor, flashedThisRound);
		} else if (!flashedThisRound.has(neighbor.position.toString())) {
			neighbor.setValue(String(nVal + 1));
		}
	}
	cell.setValue("0");
	return flashedThisRound;
}

async function p2021day11_part1(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input });
	let count = 0;
	for (let i = 0; i < params[0]; i++) {
		const flashedThisRound = new Set<string>();
		for (const cell of grid) {
			const val = Number(cell.value);
			if (val >= 9) {
				flash(cell, flashedThisRound);
			} else if (!flashedThisRound.has(cell.position.toString())) {
				cell.setValue(String(val + 1));
			}
		}
		count += flashedThisRound.size;
	}
	return count;
}

async function p2021day11_part2(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input });
	for (let i = 0; i < 1000; i++) {
		const flashedThisRound = new Set<string>();
		for (const cell of grid) {
			const val = Number(cell.value);
			if (val >= 9) {
				flash(cell, flashedThisRound);
			} else if (!flashedThisRound.has(cell.position.toString())) {
				cell.setValue(String(val + 1));
			}
		}
		if (flashedThisRound.size === grid.rowCount * grid.colCount) {
			return i + 1;
		}
	}
	throw new Error("No solution found after 1000 iterations");
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `11111
19991
19191
19991
11111`,
			extraArgs: [2],
			expected: `9`,
		},
		{
			input: `5483143223
2745854711
5264556173
6141336146
6357385478
4167524645
2176841721
6882881134
4846848554
5283751526`,
			extraArgs: [10],
			expected: `204`,
		},{
			input: `5483143223
2745854711
5264556173
6141336146
6357385478
4167524645
2176841721
6882881134
4846848554
5283751526`,
			extraArgs: [100],
			expected: `1656`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `5483143223
2745854711
5264556173
6141336146
6357385478
4167524645
2176841721
6882881134
4846848554
5283751526`,
			extraArgs: [],
			expected: `195`,
		},
	];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2021day11_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2021day11_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2021day11_part1(input, 100));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2021day11_part2(input));
	const part2After = performance.now();

	logSolution(11, 2021, part1Solution, part2Solution);

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
