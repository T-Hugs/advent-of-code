import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";
import { Cell, Grid } from "../../../util/grid";
import { permutation } from "js-combinatorics";

const YEAR = 2024;
const DAY = 8;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2024/08/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2024/08/data.txt
// problem url  : https://adventofcode.com/2024/day/8

async function p2024day8_part1(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input });

	const frequencies: Set<string> = new Set();

	for (const cell of grid) {
		if (cell.value !== ".") {
			frequencies.add(cell.value);
		}
	}

	const spots: Set<string> = new Set();

	for (const freq of frequencies) {
		const allBeacons = grid.getCells(freq);
		for (const [a, b] of util.choose(allBeacons, 2)) {
			const vert = Math.abs(b.position[0] - a.position[0]);
			const over = Math.abs(b.position[1] - a.position[1]);

			const topCell = a.position[0] > b.position[0] ? b : a;
			const bottomCell = a === topCell ? b : a;
			const leftCell = a.position[1] > b.position[1] ? b : a;
			const rightCell = a === leftCell ? b : a;

			if (topCell === leftCell) {
				const spot1 = topCell.repeatMovements([[-vert, -over]]);
				const spot2 = bottomCell.repeatMovements([[vert, over]]);
				if (spot1) {
					//grid.setCell(spot1.position, "#");
					spots.add(spot1.position.join(","));
				}
				if (spot2) {
					//grid.setCell(spot2.position, "#");
					spots.add(spot2.position.join(","));
				}
			} else if (topCell === rightCell) {
				const spot1 = topCell.repeatMovements([[-vert, over]]);
				const spot2 = bottomCell.repeatMovements([[vert, -over]]);
				if (spot1) {
					//grid.setCell(spot1.position, "#");
					spots.add(spot1.position.join(","));
				}
				if (spot2) {
					//grid.setCell(spot2.position, "#");
					spots.add(spot2.position.join(","));
				}
			}
		}
	}
	//grid.log();
	return spots.size;
}

async function p2024day8_part2(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input });

	const frequencies: Set<string> = new Set();

	for (const cell of grid) {
		if (cell.value !== ".") {
			frequencies.add(cell.value);
		}
	}

	const spots: Set<string> = new Set();

	for (const freq of frequencies) {
		const allBeacons = grid.getCells(freq);
		for (const [a, b] of util.choose(allBeacons, 2)) {
			const vert = Math.abs(b.position[0] - a.position[0]);
			const over = Math.abs(b.position[1] - a.position[1]);

			const topCell = a.position[0] > b.position[0] ? b : a;
			const bottomCell = a === topCell ? b : a;
			const leftCell = a.position[1] > b.position[1] ? b : a;
			const rightCell = a === leftCell ? b : a;

			if (topCell === leftCell) {
				let spot1: Cell | undefined = topCell;
				let spot2: Cell | undefined = leftCell;
				while (spot1) {
					//grid.setCell(spot1.position, "#");
					spots.add(spot1.position.join(","));
					spot1 = spot1.repeatMovements([[-vert, -over]]);
				}
				while (spot2) {
					//grid.setCell(spot2.position, "#");
					spots.add(spot2.position.join(","));
					spot2 = spot2.repeatMovements([[vert, over]])
				}
			} else if (topCell === rightCell) {
				let spot1: Cell | undefined = topCell;
				let spot2: Cell | undefined = bottomCell;
				while (spot1) {
					//grid.setCell(spot1.position, "#");
					spots.add(spot1.position.join(","));
					spot1 = spot1.repeatMovements([[-vert, over]]);
				}
				while (spot2) {
					//grid.setCell(spot2.position, "#");
					spots.add(spot2.position.join(","));
					spot2 = spot2.repeatMovements([[vert, -over]]);
				}
			}
		}
	}
	//grid.log();
	return spots.size;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `............
........0...
.....0......
.......0....
....0.......
......A.....
............
............
........A...
.........A..
............
............`,
			extraArgs: [],
			expected: `14`,
			expectedPart2: `34`,
		},
		{
			input: `............
........0...
............
............
....0.......
............
............
............
............
............
............
............`,
			extraArgs: [],
			expected: `1`,
			expectedPart2: ``,
		},
	];
	const part2tests: TestCase[] = [];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day8_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day8_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day8_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2024day8_part2(input));
	const part2After = performance.now();

	logSolution(8, 2024, part1Solution, part2Solution);

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
