import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { CopyGridOptions, Grid } from "../../../util/grid";

const YEAR = 2021;
const DAY = 13;

// solution path: C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\13\index.ts
// data path    : C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\13\data.txt
// problem url  : https://adventofcode.com/2021/day/13

async function p2021day13_part1(input: string, ...params: any[]) {
	const groups = input.split("\n\n");
	const coords: [number, number][] = [];
	for (const line of groups[0].split("\n")) {
		const [y, x] = line.split(",");
		coords.push([parseInt(x), parseInt(y)]);
	}
	const folds: ["x" | "y", number][] = [];
	for (const line of groups[1].split("\n")) {
		const data = line.substr(11);
		const [axis, value] = data.split("=");
		folds.push([axis as "x" | "y", parseInt(value)]);
	}
	const maxY = util.max(coords, x => x[0]);
	const maxX = util.max(coords, x => x[1]);
	const grid = new Grid({ rowCount: maxY.value + 1, colCount: maxX.value + 1, fillWith: "." });
	for (const coord of coords) {
		grid.setCell(coord, "#");
	}

	for (const fold of folds) {
		const [axis, value] = fold;
		const half1 = grid.copyGrid({
			copyValues: true,
			srcEndRow: axis === "y" ? value : grid.rowCount - 1,
			srcEndCol: axis === "x" ? value : grid.colCount - 1,
		});
		const half2 = grid
			.copyGrid({
				copyValues: true,
				srcStartRow: axis === "y" ? value : 0,
				srcStartCol: axis === "x" ? value : 0,
			})
			.flip(axis === "y" ? "vertical" : "horizontal");

		for (const cell of half2) {
			half1.setCell(cell.position, half1.getValue(cell.position) === "." && cell.value === "." ? "." : "#");
		}

		return half1.getCells(c => c.value === "#").length;
	}
}

async function p2021day13_part2(input: string, ...params: any[]) {
	const groups = input.split("\n\n");
	const coords: [number, number][] = [];
	for (const line of groups[0].split("\n")) {
		const [col, row] = line.split(",");
		coords.push([parseInt(row), parseInt(col)]);
	}
	const folds: ["x" | "y", number][] = [];
	for (const line of groups[1].split("\n")) {
		const data = line.substr(11);
		const [axis, value] = data.split("=");
		folds.push([axis as "x" | "y", parseInt(value)]);
	}
	const maxRow = util.max(coords, x => x[0]);
	const maxCol = util.max(coords, x => x[1]);
	let grid = new Grid({ rowCount: maxRow.value + 1 + (params[0] ?? 0), colCount: maxCol.value + 1, fillWith: "." });
	for (const coord of coords) {
		grid.setCell(coord, "#");
	}

	for (const fold of folds) {
		const [axis, value] = fold;

		if (axis === "y" && Math.floor(grid.rowCount / 2) - 1 !== value - 1) {
			debugger;
		}
		const half1 = grid.copyGrid({
			copyValues: true,
			srcEndRow: axis === "y" ? Math.floor(grid.rowCount / 2) - 1 : grid.rowCount - 1,
			srcEndCol: axis === "x" ? Math.floor(grid.colCount / 2) - 1 : grid.colCount - 1,
		});
		const half2 = grid
			.copyGrid({
				copyValues: true,
				srcStartRow: axis === "y" ? Math.floor(grid.rowCount / 2) + 1 : 0,
				srcStartCol: axis === "x" ? Math.floor(grid.colCount / 2) + 1 : 0,
			})
			.flip(axis === "y" ? "vertical" : "horizontal");

		for (const cell of half2) {
			half1.setCell(cell.position, half1.getValue(cell.position) === "." && cell.value === "." ? "." : "#");
		}
		grid = half1;
	}

	grid.log();
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `6,10
0,14
9,10
0,3
10,4
4,11
6,0
6,12
4,1
0,13
10,12
3,4
3,0
8,4
1,10
2,14
8,10
9,0

fold along y=7
fold along x=5`,
			extraArgs: [],
			expected: `17`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `6,10
0,14
9,10
0,3
10,4
4,11
6,0
6,12
4,1
0,13
10,12
3,4
3,0
8,4
1,10
2,14
8,10
9,0

fold along y=7
fold along x=5`,
			extraArgs: [],
			expected: `undefined`,
		},
	];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2021day13_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2021day13_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2021day13_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2021day13_part2(input, 2));
	const part2After = performance.now();

	logSolution(13, 2021, part1Solution, part2Solution);

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
