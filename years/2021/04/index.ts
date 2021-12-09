import _, { isPlainObject } from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2021;
const DAY = 4;

// solution path: C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\04\index.ts
// data path    : C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\04\data.txt
// problem url  : https://adventofcode.com/2021/day/4

function winsAfter(grid: number[][], sequence: number[]): [number, boolean[][]] {
	const punchCard: boolean[][] = [];
	for (const row of grid) {
		const punchRow: boolean[] = [];
		punchCard.push(punchRow);
		for (const num of row) {
			punchRow.push(false);
		}
	}

	let seqIndex = 0;
	for (const next of sequence) {
		for (let i = 0; i < grid.length; i++) {
			for (let j = 0; j < grid[i].length; j++) {
				if (grid[i][j] === next) {
					punchCard[i][j] = true;
				}
			}
		}
		if (isWinner(punchCard)) {
			return [seqIndex, punchCard];
		}
		seqIndex++;
	}
	return [-1, punchCard];
}

function isWinner(punchCard: boolean[][]) {
	// Check rows for a winner
	for (const row of punchCard) {
		if (row.every(x => x)) {
			return true;
		}
	}
	
	// Check columns for a winner
	for (let i = 0; i < punchCard[0].length; i++) {
		const column = punchCard.map(r => r[i]);
		if (column.every(x => x)) {
			return true;
		}
	}

	return false;
}

async function p2021day4_part1(input: string, ...params: any[]) {
	const lines = input.split("\n");
	const numOrder = lines.shift()?.split(",").map(Number) ?? [];

	const groups = input.split("\n\n");
	groups.shift();
	const grids: number[][][] = [];
	for (const group of groups) {
		const grid: number[][] = [];
		grids.push(grid);
		const lines = group.split("\n");
		for (const line of lines) {
			const gridLine: number[] = line.split(/\s+/).filter(l => Boolean(l.trim())).map(n => Number(n.trim()));
			grid.push(gridLine);
		}
	}
	const movesToWin = grids.map(g => winsAfter(g, numOrder));
	const minResult = util.min(movesToWin, x => x[0]);
	const winningGrid = grids[minResult.index];

	let sumUnused = 0;
	for (let i = 0; i < winningGrid.length; i++) {
		for (let j = 0; j < winningGrid[i].length; j++) {
			if (!minResult.elem[1][i][j]) {
				sumUnused += winningGrid[i][j];
			}
		}
	}
	return numOrder[minResult.value] * sumUnused;
}

async function p2021day4_part2(input: string, ...params: any[]) {
	const lines = input.split("\n");
	const numOrder = lines.shift()?.split(",").map(Number) ?? [];

	const groups = input.split("\n\n");
	groups.shift();
	const grids: number[][][] = [];
	for (const group of groups) {
		const grid: number[][] = [];
		grids.push(grid);
		const lines = group.split("\n");
		for (const line of lines) {
			const gridLine: number[] = line.split(/\s+/).filter(l => Boolean(l.trim())).map(n => Number(n.trim()));
			grid.push(gridLine);
		}
	}
	const movesToWin = grids.map(g => winsAfter(g, numOrder));
	const maxResult = util.max(movesToWin, x => x[0]);
	const winningGrid = grids[maxResult.index];

	let sumUnused = 0;
	for (let i = 0; i < winningGrid.length; i++) {
		for (let j = 0; j < winningGrid[i].length; j++) {
			if (!maxResult.elem[1][i][j]) {
				sumUnused += winningGrid[i][j];
			}
		}
	}
	return numOrder[maxResult.value] * sumUnused;
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `7,4,9,5,11,17,23,2,0,14,21,24,10,16,13,6,15,25,12,22,18,20,8,19,3,26,1

22 13 17 11  0
 8  2 23  4 24
21  9 14 16  7
 6 10  3 18  5
 1 12 20 15 19

 3 15  0  2 22
 9 18 13 17  5
19  8  7 25 23
20 11 10 24  4
14 21 16 12  6

14 21 17 24  4
10 16 15  9 19
18  8 23 26 20
22 11 13  6  5
 2  0 12  3  7`,
		extraArgs: [],
		expected: `4512`
	}];
	const part2tests: TestCase[] = [{
		input: `7,4,9,5,11,17,23,2,0,14,21,24,10,16,13,6,15,25,12,22,18,20,8,19,3,26,1

22 13 17 11  0
 8  2 23  4 24
21  9 14 16  7
 6 10  3 18  5
 1 12 20 15 19

 3 15  0  2 22
 9 18 13 17  5
19  8  7 25 23
20 11 10 24  4
14 21 16 12  6

14 21 17 24  4
10 16 15  9 19
18  8 23 26 20
22 11 13  6  5
 2  0 12  3  7`,
		extraArgs: [],
		expected: `1924`
	}];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2021day4_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2021day4_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2021day4_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2021day4_part2(input));
	const part2After = performance.now();

	logSolution(4, 2021, part1Solution, part2Solution);

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
