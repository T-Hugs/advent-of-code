import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { Cell, Grid } from "../../../util/grid";

const YEAR = 2015;
const DAY = 18;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2015/18/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2015/18/data.txt
// problem url  : https://adventofcode.com/2015/day/18

async function p2015day18_part1(input: string) {
	const grid = new Grid({ serialized: input });
	for (let i = 0; i < 100; ++i) {
		grid.batchUpdates();

		for (const cell of grid) {
			const neighbors = cell.neighbors(true);
			const litNeighbors = neighbors.filter(c => c.value === "#").length;
			if (cell.value === "#") {
				if (!(litNeighbors === 2 || litNeighbors === 3)) {
					cell.setValue(".");
				}
			} else {
				if (litNeighbors === 3) {
					cell.setValue("#");
				}
			}
		}

		grid.commit();
	}
	return Array.from(grid).filter(c => c.value === "#").length;
}

async function p2015day18_part2(input: string) {
	const grid = new Grid({ serialized: input });
	for (const cell of grid.getCells(c => c.isCorner())) {
		cell.setValue("#");
	}
	for (let i = 0; i < 100; ++i) {
		grid.batchUpdates();

		for (const cell of grid) {
			if (cell.isCorner()) {
				continue;
			}
			const neighbors = cell.neighbors(true);
			const litNeighbors = neighbors.filter(c => c.value === "#").length;
			if (cell.value === "#") {
				if (!(litNeighbors === 2 || litNeighbors === 3)) {
					cell.setValue(".");
				}
			} else {
				if (litNeighbors === 3) {
					cell.setValue("#");
				}
			}
		}

		grid.commit();
	}
	return Array.from(grid).filter(c => c.value === "#").length;
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2015day18_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2015day18_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2015day18_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2015day18_part2(input));
	const part2After = performance.now();

	logSolution(18, 2015, part1Solution, part2Solution);

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
