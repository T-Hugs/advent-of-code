import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { Grid } from "../../../util/grid";

const YEAR = 2015;
const DAY = 6;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2015/06/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2015/06/data.txt
// problem url  : https://adventofcode.com/2015/day/6

async function p2015day6_part1(input: string) {
	const grid = new Grid({ rowCount: 1000, colCount: 1000, fillWith: "." });
	const lines = input.split("\n");
	for (const line of lines) {
		let action: "turn on" | "turn off" | "toggle" = "toggle";
		if (line.startsWith("turn on")) {
			action = "turn on";
		} else if (line.startsWith("turn off")) {
			action = "turn off";
		} else if (line.startsWith("toggle")) {
			action = "toggle";
		} else {
			throw new Error("unknown action");
		}

		const rest = line.substr(line.indexOf(action) + action.length).trim();
		const [start, end] = rest.split(" through ").map(s => s.trim());
		const [startx, starty] = start.split(",").map(Number);
		const [endx, endy] = end.split(",").map(Number);

		const cells = grid.getCells(
			c => c.position[0] >= startx && c.position[0] <= endx && c.position[1] >= starty && c.position[1] <= endy
		);
		for (const cell of cells) {
			if (action === "turn on") {
				cell.setValue("#");
			} else if (action === "turn off") {
				cell.setValue(".");
			} else {
				if (cell.value === ".") {
					cell.setValue("#");
				} else {
					cell.setValue(".");
				}
			}
		}
	}
	return grid.getCells("#").length;
}

async function p2015day6_part2(input: string) {
	const grid = new Grid({ rowCount: 1000, colCount: 1000, fillWith: "0" });
	const lines = input.split("\n");
	for (const line of lines) {
		let action: "turn on" | "turn off" | "toggle" = "toggle";
		if (line.startsWith("turn on")) {
			action = "turn on";
		} else if (line.startsWith("turn off")) {
			action = "turn off";
		} else if (line.startsWith("toggle")) {
			action = "toggle";
		} else {
			throw new Error("unknown action");
		}

		const rest = line.substr(line.indexOf(action) + action.length).trim();
		const [start, end] = rest.split(" through ").map(s => s.trim());
		const [startx, starty] = start.split(",").map(Number);
		const [endx, endy] = end.split(",").map(Number);

		const cells = grid.getCells(
			c => c.position[0] >= startx && c.position[0] <= endx && c.position[1] >= starty && c.position[1] <= endy
		);
		for (const cell of cells) {
			if (action === "turn on") {
				cell.setValue(String(Number(cell.value) + 1));
			} else if (action === "turn off") {
				cell.setValue(String(Math.max(0, Number(cell.value) - 1)));
			} else {
				cell.setValue(String(Number(cell.value) + 2));
			}
		}
	}
	return Array.from(grid)
		.map(c => Number(c.value))
		.reduce((p, c) => p + c, 0);
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2015day6_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2015day6_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2015day6_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2015day6_part2(input));
	const part2After = performance.now();

	logSolution(6, 2015, part1Solution, part2Solution);

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
