import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { Grid } from "../../../util/grid";

const YEAR = 2016;
const DAY = 18;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2016/18/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2016/18/data.txt
// problem url  : https://adventofcode.com/2016/day/18

async function p2016day18_part1(input: string, ...extraArgs: any[]) {
	const rowCount = extraArgs[0] ?? 40;
	const grid = new Grid({ rowCount, colCount: input.length });
	for (let i = 0; i < input.length; ++i) {
		grid.setCell([0, i], input[i]);
	}
	for (let i = 1; i < rowCount; ++i) {
		for (let j = 0; j < grid.colCount; ++j) {
			const cell = grid.getCell([i, j]);
			const L = cell?.north()?.west();
			const C = cell?.north();
			const R = cell?.north()?.east();
			const c1 = L?.value === "^" && C?.value === "^" && R?.value !== "^";
			const c2 = L?.value !== "^" && C?.value === "^" && R?.value === "^";
			const c3 = L?.value === "^" && C?.value !== "^" && R?.value !== "^";
			const c4 = L?.value !== "^" && C?.value !== "^" && R?.value === "^";
			if (c1 || c2 || c3 || c4) {
				cell?.setValue("^");
			} else {
				cell?.setValue(".");
			}
		}
	}
	return grid.getCells(".").length;
}

async function p2016day18_part2(input: string, ...extraArgs: any[]) {
	const rowCount: number = extraArgs[0] ?? 400000;
	const grid = new Grid({ rowCount, colCount: input.length });
	for (let i = 0; i < input.length; ++i) {
		grid.setCell([0, i], input[i]);
	}
	for (let i = 1; i < rowCount; ++i) {
		for (let j = 0; j < grid.colCount; ++j) {
			const cell = grid.getCell([i, j]);
			const L = cell?.north()?.west();
			const C = cell?.north();
			const R = cell?.north()?.east();
			const c1 = L?.value === "^" && C?.value === "^" && R?.value !== "^";
			const c2 = L?.value !== "^" && C?.value === "^" && R?.value === "^";
			const c3 = L?.value === "^" && C?.value !== "^" && R?.value !== "^";
			const c4 = L?.value !== "^" && C?.value !== "^" && R?.value === "^";
			if (c1 || c2 || c3 || c4) {
				cell?.setValue("^");
			} else {
				cell?.setValue(".");
			}
		}
	}
	return grid.getCells(".").length;
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `.^^.^.^^^^`,
		expected: `38`,
		extraArgs: [10]
	},{
		input: `..^^.`,
		expected: `6`,
		extraArgs: [3]
	}];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2016day18_part1(testCase.input, ...(testCase.extraArgs ?? []))));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2016day18_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2016day18_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2016day18_part2(input));
	const part2After = performance.now();

	logSolution(18, 2016, part1Solution, part2Solution);

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
