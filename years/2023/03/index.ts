import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { Cell, Grid, serializeCellArray } from "../../../util/grid";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2023;
const DAY = 3;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/03/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/03/data.txt
// problem url  : https://adventofcode.com/2023/day/3

function isDigit(char: string) {
	return /\d/.test(char);
}

async function p2023day3_part1(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input });
	const clusters = new Map<string, Cell[]>();
	const symbolCells = grid.getCells(c => !isDigit(c.value) && c.value !== ".");
	for (const symbol of symbolCells) {
		const neighbors = symbol.neighbors(true);
		for (const neighbor of neighbors) {
			if (isDigit(neighbor.value)) {
				const cluster = neighbor.findCellCluster({
					test: c => isDigit(c.value),
					allowDiagonal: false,
					allowHorizontal: true,
					allowVertical: false,
				});
				clusters.set(serializeCellArray(cluster), cluster);
			}
		}
	}
	return [...clusters.values()].map(cells => Number(cells.map(c => c.value).join(""))).reduce((a, b) => a + b);
}

async function p2023day3_part2(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input });
	const symbolCells = grid.getCells(c => !isDigit(c.value) && c.value !== ".");
	let sum = 0;
	for (const symbol of symbolCells) {
		const neighbors = symbol.neighbors(true);
		const clusters = new Map<string, Cell[]>();
		for (const neighbor of neighbors) {
			if (isDigit(neighbor.value)) {
				const cluster = neighbor.findCellCluster({
					test: c => isDigit(c.value),
					allowDiagonal: false,
					allowHorizontal: true,
					allowVertical: false,
				});
				clusters.set(serializeCellArray(cluster), cluster);
			}
		}
		const clusterValues = [...clusters.values()];
		if (clusterValues.length === 2) {
			sum += Number(clusterValues[0].map(c => c.value).join("")) * Number(clusterValues[1].map(c => c.value).join(""));
		}
	}
	return sum;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `467..114..
...*......
..35..633.
......#...
617*......
.....+.58.
..592.....
......755.
...$.*....
.664.598..`,
			extraArgs: [],
			expected: `4361`,
			expectedPart2: `467835`,
		},
	];
	const part2tests: TestCase[] = [];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2023day3_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2023day3_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2023day3_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2023day3_part2(input));
	const part2After = performance.now();

	logSolution(3, 2023, part1Solution, part2Solution);

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
