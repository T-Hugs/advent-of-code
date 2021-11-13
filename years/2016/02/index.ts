import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { Grid } from "../../../util/grid";

const YEAR = 2016;
const DAY = 2;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2016/02/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2016/02/data.txt
// problem url  : https://adventofcode.com/2016/day/2

async function p2016day2_part1(input: string) {
	const keypad = new Grid({ serialized: `123\n456\n789` });
	const lines = input.split("\n");
	let code = "5";
	for (const line of lines) {
		const directions = line.split("");
		let currentCell = keypad.getCell(code[code.length - 1])!;
		for (const direction of directions) {
			switch (direction) {
				case "U":
					currentCell = currentCell.north(1, "stay")!;
					break;
				case "R":
					currentCell = currentCell.east(1, "stay")!;
					break;
				case "D":
					currentCell = currentCell.south(1, "stay")!;
					break;
				case "L":
					currentCell = currentCell.west(1, "stay")!;
					break;
			}
		}
		code += currentCell.value;
	}

	return code.substr(1);
}

async function p2016day2_part2(input: string) {
	const keypad = new Grid({ serialized: `..1..\n.234.\n56789\n.ABC.\n..D..` });
	const lines = input.split("\n");
	let code = "5";
	for (const line of lines) {
		const directions = line.split("");
		let currentCell = keypad.getCell(code[code.length - 1])!;
		for (const direction of directions) {
			let prevCell = currentCell;
			switch (direction) {
				case "U":
					currentCell = currentCell.north(1, "stay")!;
					break;
				case "R":
					currentCell = currentCell.east(1, "stay")!;
					break;
				case "D":
					currentCell = currentCell.south(1, "stay")!;
					break;
				case "L":
					currentCell = currentCell.west(1, "stay")!;
					break;
			}
			if (currentCell.value === ".") {
				currentCell = prevCell;
			}
		}
		code += currentCell.value;
	}

	return code.substr(1);
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2016day2_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2016day2_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2016day2_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2016day2_part2(input));
	const part2After = performance.now();

	logSolution(2, 2016, part1Solution, part2Solution);

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
