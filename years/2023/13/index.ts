import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";
import { Grid } from "../../../util/grid";

const YEAR = 2023;
const DAY = 13;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/13/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/13/data.txt
// problem url  : https://adventofcode.com/2023/day/13

function reflects(grid: Grid, index: number, vertical: boolean, allowOneDifference = false): boolean {
	if (vertical) {
		const distanceToEdge = Math.min(index, grid.colCount - index);
		const leftGrid = grid.copyGrid({ srcStartCol: index - distanceToEdge, srcColCount: distanceToEdge });
		const rightGrid = grid.copyGrid({ srcStartCol: index, srcColCount: distanceToEdge }).flip("horizontal");

		if (allowOneDifference) {
			return leftGrid.countDifferences(rightGrid) === 1;
		} else {
			return leftGrid.equals(rightGrid);
		}
	} else {
		const distanceToEdge = Math.min(index, grid.rowCount - index);
		const topGrid = grid.copyGrid({ srcStartRow: index - distanceToEdge, srcRowCount: distanceToEdge });
		const bottomGrid = grid.copyGrid({ srcStartRow: index, srcRowCount: distanceToEdge }).flip("vertical");

		if (allowOneDifference) {
			return topGrid.countDifferences(bottomGrid) === 1;
		} else {
			return topGrid.equals(bottomGrid);
		}
	}
}

async function p2023day13_part1(input: string, ...params: any[]) {
	const groups = input.split("\n\n");
	let summary = 0;
	for (const group of groups) {
		const grid = new Grid({ serialized: group });
		let gridSummary = 0;
		for (let i = 1; i < grid.colCount; ++i) {
			if (reflects(grid, i, true)) {
				gridSummary = i;
			}
		}
		if (gridSummary === 0) {
			for (let i = 1; i < grid.rowCount; ++i) {
				if (reflects(grid, i, false)) {
					gridSummary += 100 * i;
				}
			}
		}
		summary += gridSummary;
	}
	return summary;
}

async function p2023day13_part2(input: string, ...params: any[]) {
	const groups = input.split("\n\n");
	let summary = 0;
	for (const group of groups) {
		const grid = new Grid({ serialized: group });
		let gridSummary = 0;
		for (let i = 1; i < grid.colCount; ++i) {
			if (reflects(grid, i, true, true)) {
				gridSummary = i;
			}
		}
		if (gridSummary === 0) {
			for (let i = 1; i < grid.rowCount; ++i) {
				if (reflects(grid, i, false, true)) {
					gridSummary += 100 * i;
				}
			}
		}
		summary += gridSummary;
	}
	return summary;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `#.##..##.
..#.##.#.
##......#
##......#
..#.##.#.
..##..##.
#.#.##.#.

#...##..#
#....#..#
..##..###
#####.##.
#####.##.
..##..###
#....#..#`,
			extraArgs: [],
			expected: `405`,
			expectedPart2: `400`,
		},
		{
			input: `#...##..#
#....#..#
..##..###
#####.##.
#####.##.
..##..###
#....#..#

#.##..##.
..#.##.#.
##......#
##......#
..#.##.#.
..##..##.
#.#.##.#.`,
			extraArgs: [],
			expected: `405`,
			expectedPart2: `400`,
		},
	];
	const part2tests: TestCase[] = [];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2023day13_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2023day13_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2023day13_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2023day13_part2(input));
	const part2After = performance.now();

	logSolution(13, 2023, part1Solution, part2Solution);

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
