import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";
import { Grid } from "../../../util/grid";

const YEAR = 2023;
const DAY = 11;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/11/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/11/data.txt
// problem url  : https://adventofcode.com/2023/day/11

async function p2023day11_part1(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input });
	const rowsToExpand: number[] = [];
	const colsToExpand: number[] = [];
	for (let i = 0; i < grid.rowCount; ++i) {
		if (grid.getCells(c => c.position[0] === i).every(c => c.value === ".")) {
			rowsToExpand.push(i);
		}
	}
	for (let i = 0; i < grid.colCount; ++i) {
		if (grid.getCells(c => c.position[1] === i).every(c => c.value === ".")) {
			colsToExpand.push(i);
		}
	}

	rowsToExpand.reverse();
	colsToExpand.reverse();

	for (const row of rowsToExpand) {
		grid.editGrid({atRow: {count: 1, index: row}, fillWith: "."});
	}
	for (const col of colsToExpand) {
		grid.editGrid({atCol: {count: 1, index: col}, fillWith: "."});
	}

	const galaxies = grid.getCells("#");
	let sum = 0;

	for (let i = 0; i < galaxies.length - 1; ++i) {
		const gal1 = galaxies[i];
		for (let j = i + 1; j < galaxies.length; ++j) {
			const gal2 = galaxies[j];
			sum += gal1.manhattanDistanceTo(gal2);
		}
	}
	return sum;
}

async function p2023day11_part2(input: string, ...params: any[]) {
	const expandAmount = Number(params[0]) || 1000000;
	const grid = new Grid({ serialized: input });
	const rowsToExpand: number[] = [];
	const colsToExpand: number[] = [];
	for (let i = 0; i < grid.rowCount; ++i) {
		if (grid.getCells(c => c.position[0] === i).every(c => c.value === ".")) {
			rowsToExpand.push(i);
		}
	}
	for (let i = 0; i < grid.colCount; ++i) {
		if (grid.getCells(c => c.position[1] === i).every(c => c.value === ".")) {
			colsToExpand.push(i);
		}
	}

	const galaxies = grid.getCells("#");
	let sum = 0;

	for (let i = 0; i < galaxies.length - 1; ++i) {
		const gal1 = galaxies[i];
		for (let j = i + 1; j < galaxies.length; ++j) {
			const gal2 = galaxies[j];
			const lowRow = Math.min(gal1.position[0], gal2.position[0]);
			const highRow = Math.max(gal1.position[0], gal2.position[0]);
			const lowCol = Math.min(gal1.position[1], gal2.position[1]);
			const highCol = Math.max(gal1.position[1], gal2.position[1]);
			const expandedRowCount = rowsToExpand.filter(r => r > lowRow && r < highRow).length;
			const expandedColCount = colsToExpand.filter(c => c > lowCol && c < highCol).length;
			const vDist = highRow - lowRow - expandedRowCount + expandedRowCount * expandAmount;
			const hDist = highCol - lowCol - expandedColCount + expandedColCount * expandAmount;
			sum += vDist + hDist
			if (!sum) {
				console.log("What");
			}
		}
	}
	return sum;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `...#......
.......#..
#.........
..........
......#...
.#........
.........#
..........
.......#..
#...#.....`,
			extraArgs: [],
			expected: `374`,
			expectedPart2: ``,
		},
	];
	const part2tests: TestCase[] = [{
		input: `...#......
.......#..
#.........
..........
......#...
.#........
.........#
..........
.......#..
#...#.....`,
		extraArgs: [10],
		expected: `1030`,
		expectedPart1: ``
	}, {
		input: `...#......
.......#..
#.........
..........
......#...
.#........
.........#
..........
.......#..
#...#.....`,
		extraArgs: [100],
		expected: `8410`,
		expectedPart1: ``
	}];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2023day11_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2023day11_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2023day11_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2023day11_part2(input));
	const part2After = performance.now();

	logSolution(11, 2023, part1Solution, part2Solution);

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
