import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { Dir, Grid } from "../../../util/grid";

const YEAR = 2020;
const DAY = 11;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2020/11/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2020/11/data.txt
// problem url  : https://adventofcode.com/2020/day/11

async function p2020day11_part1(input: string) {
	const grid = new Grid({ serialized: input });
	grid.simulateCellularAutomata(
		(grid, changes) => changes,
		cell => {
			const neighbors = cell.neighbors(true);
			if (cell.value === "L") {
				if (neighbors.every(n => n.value === "L" || n.value === ".")) {
					return "#";
				}
			} else if (cell.value === "#") {
				if (neighbors.filter(n => n.value === "#").length >= 4) {
					return "L";
				}
			}
		}
	);
	return grid.getCells(c => c.value === "#").length;
}

async function p2020day11_part2(input: string) {
	const grid = new Grid({ serialized: input });
	const dirs = "N S E W NE NW SE SW".split(" ");
	grid.simulateCellularAutomata(
		(grid, hasChanges) => hasChanges,
		cell => {
			const neighbors = dirs.map(d => cell.repeatMovements([Dir[d]], { count: cell => cell?.value === "." }));
			if (cell.value === "L" && neighbors.every(n => n == undefined || n.value === "L" || n.value === ".")) {
				return "#";
			} else if (cell.value === "#" && neighbors.filter(n => n != undefined && n!.value === "#").length >= 5) {
				return "L";
			}
		}
	);
	return grid.getCells(c => c.value === "#").length;
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
