import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { Cell, Grid } from "../../../util/grid";

const YEAR = 2021;
const DAY = 9;

// solution path: C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\09\index.ts
// data path    : C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\09\data.txt
// problem url  : https://adventofcode.com/2021/day/9

async function p2021day9_part1(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input });
	let sum = 0;
	for (const cell of grid) {
		const neighbors = cell.neighbors(false);
		const cellVal = Number(cell.value);
		if (neighbors.every(c => Number(c.value) > cellVal)) {
			sum += cellVal + 1;
		}
	}
	return sum;
}

function getHigherNeighbors(cell: Cell) {
	const neighbors = cell.neighbors(false);
	const cellVal = Number(cell.value);
	const withDups = neighbors.filter(c => Number(c.value) > Number(cell.value) && c.value !== "9");
	return _.uniqBy(withDups, c => `${c.position[0]},${c.position[1]}`);
}

function getBasin(cell: Cell) {
	const cellsToCheck = [cell];
	const checkedCells: Set<string> = new Set();
	const basin: Cell[] = [];
	while (cellsToCheck.length > 0) {
		const currentCell = cellsToCheck.pop()!;
		if (checkedCells.has(`${currentCell.position[0]},${currentCell.position[1]}`)) {
			continue;
		}
		checkedCells.add(`${currentCell.position[0]},${currentCell.position[1]}`);
		const oneBigger = getHigherNeighbors(currentCell);
		for (const cell of oneBigger) {
			cellsToCheck.push(cell);
		}
		basin.push(currentCell);
	}
	return basin;
}

async function p2021day9_part2(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input });
	const lowPoints: Cell[] = [];
	const basins: Cell[][] = [];
	for (const cell of grid) {
		const neighbors = cell.neighbors(false);
		const cellVal = Number(cell.value);
		if (neighbors.every(c => Number(c.value) > cellVal)) {
			lowPoints.push(cell);
		}
	}

	for (const low of lowPoints) {
		basins.push(getBasin(low));
	}
	basins.sort((a, b) => b.length - a.length);
	return basins[0].length * basins[1].length * basins[2].length;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `2199943210
3987894921
9856789892
8767896789
9899965678`,
			extraArgs: [],
			expected: `15`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `2199943210
3987894921
9856789892
8767896789
9899965678`,
			extraArgs: [],
			expected: `1134`,
		},
	];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2021day9_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2021day9_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2021day9_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2021day9_part2(input));
	const part2After = performance.now();

	logSolution(9, 2021, part1Solution, part2Solution);

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
