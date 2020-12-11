import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import * as LOGUTIL from "../../../util/log";
import { performance } from "perf_hooks";
import { Grid } from "../../../util/grid";
const { log, logSolution, trace } = LOGUTIL;

const YEAR = 2020;
const DAY = 11;
const DEBUG = true;
LOGUTIL.setDebug(DEBUG);

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2020/11/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2020/11/data.txt
// problem url  : https://adventofcode.com/2020/day/11

async function p2020day11_part1(input: string) {
	const grid = new Grid({ serialized: input });
	while (true) {
		grid.batchUpdates();
		let changed = false;
		for (const cell of grid) {
			const neighbors = cell.neighbors(true);
			if (cell.value === "L") {
				if (neighbors.every(n => n.value === "L" || n.value === ".")) {
					changed = true;
					cell.setValue("#");
				}
			} else if (cell.value === "#") {
				if (neighbors.filter(n => n.value === "#").length >= 4) {
					changed = true;
					cell.setValue("L");
				}
			}
		}
		grid.commit();
		if (!changed) {
			return grid.getCells(c => c.value === "#").length;
		}
	}
}

async function p2020day11_part2(input: string) {
	const grid = new Grid({ serialized: input });
	while (true) {
		grid.batchUpdates();
		let changed = false;
		for (const cell of grid) {
			let north = cell.north();
			while (north && north.value === ".") {
				north = north.north();
			}
			let east = cell.east();
			while (east && east.value === ".") {
				east = east.east();
			}
			let south = cell.south();
			while (south && south.value === ".") {
				south = south.south();
			}
			let west = cell.west();
			while (west && west.value === ".") {
				west = west.west();
			}
			let northeast = cell.north()?.east();
			while (northeast && northeast.value === ".") {
				northeast = northeast.north()?.east();
			}
			let southeast = cell.south()?.east();
			while (southeast && southeast.value === ".") {
				southeast = southeast.south()?.east();
			}
			let southwest = cell.south()?.west();
			while (southwest && southwest.value === ".") {
				southwest = southwest.south()?.west();
			}
			let northwest = cell.north()?.west();
			while (northwest && northwest.value === ".") {
				northwest = northwest.north()?.west();
			}
			const neighbors = [north, south, west, east, northeast, southeast, northwest, southwest];
			if (cell.value === "#") {
				if (neighbors.filter(n => n != undefined && n.value === "#").length >= 5) {
					changed = true;
					cell.setValue("L");
				}
			} else if (cell.value === "L") {
				const num = neighbors.filter(n => n == undefined || n.value === "L").length;
				if (num === 8) {
					changed = true;
					cell.setValue("#");
				}
			}
		}
		grid.commit();
		
		if (!changed) {
			return grid.getCells(c => c.value === "#").length;
		}
	}
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `#.##.##.##
#######.##
#.#.#..#..
####.##.##
#.##.##.##
#.#####.##
..#.#.....
##########
#.######.#
#.#####.##`,
			expected: `37`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `L.LL.LL.LL
LLLLLLL.LL
L.L.L..L..
LLLL.LL.LL
L.LL.LL.LL
L.LLLLL.LL
..L.L.....
LLLLLLLLLL
L.LLLLLL.L
L.LLLLL.LL`,
			expected: `26`,
		},
	];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2020day11_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2020day11_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2020day11_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2020day11_part2(input));
	const part2After = performance.now();

	logSolution(11, 2020, part1Solution, part2Solution);

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
