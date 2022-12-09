import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { Grid, GridPos } from "../../../util/grid";
import aStar from "a-star";

const YEAR = 2021;
const DAY = 15;

// solution path: C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\15\index.ts
// data path    : C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\15\data.txt
// problem url  : https://adventofcode.com/2021/day/15

async function p2021day15_part1(input: string, ...params: any[]) {
	const grid = new Grid({serialized: input});

	const result = aStar<GridPos>({
		start: [0, 0],
		isEnd: (pos) => pos[0] === grid.rowCount - 1 && pos[1] === grid.colCount - 1,
		distance: (a, b) => Number(grid.getValue(b)),
		neighbor: (pos) => grid.getCell(pos)!.neighbors().map(c => c.position),
		heuristic: (c) => Number(grid.getCell(c)!.value)
	});
	
	return result.path.slice(1).reduce((p, c) => p + Number(grid.getCell(c)!.value), 0);
}

async function p2021day15_part2(input: string, ...params: any[]) {
	const grid = new Grid({serialized: input});
	const bigGrid = new Grid({colCount: grid.colCount * 5, rowCount: grid.rowCount * 5});

	for (let i = 0; i < 5; ++i) {
		for (let j = 0; j < 5; ++j) {
			for (let k = 0; k < grid.rowCount; ++k) {
				for (let l = 0; l < grid.colCount; ++l) {
					const sourceValue = Number(grid.getValue([k, l]));
					const newValue = sourceValue + i + j;
					bigGrid.setCell([i * grid.rowCount + k, j * grid.colCount + l], String(newValue > 9 ? newValue - 9 : newValue));
				}
			}
		}
	}

	const result = aStar<GridPos>({
		start: [0, 0],
		isEnd: (pos) => pos[0] === bigGrid.rowCount - 1 && pos[1] === bigGrid.colCount - 1,
		distance: (a, b) => Number(bigGrid.getValue(b)),
		neighbor: (pos) => bigGrid.getCell(pos)!.neighbors().map(c => c.position),
		heuristic: (c) => 1 // can't make any assumptions about cost
	});
	return result.path.slice(1).reduce((p, c) => p + Number(bigGrid.getCell(c)!.value), 0);
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `1163751742
1381373672
2136511328
3694931569
7463417111
1319128137
1359912421
3125421639
1293138521
2311944581`,
		extraArgs: [],
		expected: `40`
	}];
	const part2tests: TestCase[] = [{
		input: `1163751742
1381373672
2136511328
3694931569
7463417111
1319128137
1359912421
3125421639
1293138521
2311944581`,
		extraArgs: [],
		expected: `315`
	}];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2021day15_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2021day15_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2021day15_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2021day15_part2(input));
	const part2After = performance.now();

	logSolution(15, 2021, part1Solution, part2Solution);

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
