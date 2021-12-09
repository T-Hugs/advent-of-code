import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { Grid, GridPos } from "../../../util/grid";

const YEAR = 2021;
const DAY = 5;

// solution path: C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\05\index.ts
// data path    : C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\05\data.txt
// problem url  : https://adventofcode.com/2021/day/5

async function p2021day5_part1(input: string, ...params: any[]) {
	const inLines = input.split("\n");
	const lines: {a: [number, number], b: [number, number]}[] = [];
	let maxX = 0;
	let maxY = 0;
	for (const line of inLines) {
		const [lhs, rhs] = line.split(" -> ");
		const [lx, ly] = lhs.split(",").map(Number);
		const [rx, ry] = rhs.split(",").map(Number);
		lines.push({a: [lx, ly], b: [rx, ry]});
		if (maxX < lx) {
			maxX = lx;
		}
		if (maxY < ly) {
			maxY = ly;
		}
	}
	const grid = new Grid({rowCount: maxY + 1, colCount: maxX + 1, fillWith: '0'});
	for (const line of lines) {
		if (line.a[0] === line.b[0]) {
			for (let i = Math.min(line.a[1], line.b[1]); i <= Math.max(line.a[1], line.b[1]); i++) {
				const cell: GridPos = [line.a[0], i];
				const val = grid.getValue(cell);
				grid.setCell(cell, String(Number(val) + 1))
			}
		}
		else if (line.a[1] === line.b[1]) {
			for (let i = Math.min(line.a[0], line.b[0]); i <= Math.max(line.a[0], line.b[0]); i++) {
				const cell: GridPos = [i, line.a[1]];
				const val = grid.getValue(cell);
				grid.setCell(cell, String(Number(val) + 1))
			}
		}
	}
	return grid.getCells(c => Number(c.value) > 1).length;
}

async function p2021day5_part2(input: string, ...params: any[]) {
	const inLines = input.split("\n");
	const lines: {a: [number, number], b: [number, number]}[] = [];
	let maxX = 0;
	let maxY = 0;
	for (const line of inLines) {
		const [lhs, rhs] = line.split(" -> ");
		const [lx, ly] = lhs.split(",").map(Number);
		const [rx, ry] = rhs.split(",").map(Number);
		lines.push({a: [lx, ly], b: [rx, ry]});
		if (maxX < lx) {
			maxX = lx;
		}
		if (maxY < ly) {
			maxY = ly;
		}
	}
	const grid = new Grid({rowCount: maxY + 1, colCount: maxX + 1, fillWith: '0'});
	for (const line of lines) {
		if (line.a[0] === line.b[0]) {
			for (let i = Math.min(line.a[1], line.b[1]); i <= Math.max(line.a[1], line.b[1]); i++) {
				const cell: GridPos = [line.a[0], i];
				const val = grid.getValue(cell);
				grid.setCell(cell, String(Number(val) + 1))
			}
		}
		else if (line.a[1] === line.b[1]) {
			for (let i = Math.min(line.a[0], line.b[0]); i <= Math.max(line.a[0], line.b[0]); i++) {
				const cell: GridPos = [i, line.a[1]];
				const val = grid.getValue(cell);
				grid.setCell(cell, String(Number(val) + 1))
			}
		} else {
			const dx = line.a[0] < line.b[0] ? 1 : -1;
			const dy = line.a[1] < line.b[1] ? 1 : -1;
			for (let i = 0; i <= Math.abs(line.a[0] - line.b[0]) ; i++) {
				const cell: GridPos = [line.a[0] + i * dx, line.a[1] + i * dy];
				const val = grid.getValue(cell);
				grid.setCell(cell, String(Number(val) + 1))
			}
		}
	}
	return grid.getCells(c => Number(c.value) > 1).length;
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `0,9 -> 5,9
8,0 -> 0,8
9,4 -> 3,4
2,2 -> 2,1
7,0 -> 7,4
6,4 -> 2,0
0,9 -> 2,9
3,4 -> 1,4
0,0 -> 8,8
5,5 -> 8,2`,
		extraArgs: [],
		expected: `5`
	}];
	const part2tests: TestCase[] = [{
		input: `0,9 -> 5,9
8,0 -> 0,8
9,4 -> 3,4
2,2 -> 2,1
7,0 -> 7,4
6,4 -> 2,0
0,9 -> 2,9
3,4 -> 1,4
0,0 -> 8,8
5,5 -> 8,2`,
		extraArgs: [],
		expected: `12`
	}];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2021day5_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2021day5_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2021day5_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2021day5_part2(input));
	const part2After = performance.now();

	logSolution(5, 2021, part1Solution, part2Solution);

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
