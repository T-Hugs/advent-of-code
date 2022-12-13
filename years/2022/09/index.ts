import _, { head } from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { Grid, GridPos } from "../../../util/grid";

const YEAR = 2022;
const DAY = 9;

// solution path: C:\Users\trgau\dev\t-hugs\advent-of-code\years\2022\09\index.ts
// data path    : C:\Users\trgau\dev\t-hugs\advent-of-code\years\2022\09\data.txt
// problem url  : https://adventofcode.com/2022/day/9

async function p2022day9_part1(input: string, ...params: any[]) {
	const grid = new Grid({ colCount: 1000, rowCount: 1000, fillWith: "." });
	const headPos: GridPos = [500, 500];
	const tailPos: GridPos = [500, 500];

	let headCell = grid.getCell(headPos);
	let tailCell = grid.getCell(tailPos);
	const lines = input.split("\n");
	for (const line of lines) {
		const [dir, valStr] = line.split(" ");
		const val = Number(valStr);
		
		for (let i = 0; i < val; ++i) {
			tailCell?.setValue("#");
			if (dir === "U") {
				headCell = headCell?.north();
			}
			if (dir === "D") {
				headCell = headCell?.south();
			}
			if (dir === "L") {
				headCell = headCell?.west();
			}
			if (dir === "R") {
				headCell = headCell?.east();
			}
			if (headCell && tailCell) {
				const headNeighbors = headCell?.neighbors(true);
				if (!headNeighbors.some(n => n.isEqual(tailCell))) {
					const dx = headCell.position[1] - tailCell.position[1];
					const dy = headCell.position[0] - tailCell.position[0];
					if (dx !== 0) {
						tailCell = tailCell.repeatMovements([[0, util.clamp(dx, -1, 1)]]);
					}
					if (!tailCell) {
						throw new Error("Another catastrophe!");
					}
					if (dy !== 0) {
						tailCell = tailCell.repeatMovements([[util.clamp(dy, -1, 1), 0]]);
					}
				}
			} else {
				throw new Error("Catastrophic error");
			}
			//headCell.setValue("H");
			//tailCell?.setValue("T");
			//grid.log();
		}
	}
	// grid.log();
	return grid.getCells(c => c.value === "#").length;
}

async function p2022day9_part2(input: string, ...params: any[]) {
	return "Not implemented";
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `R 4
U 4
L 3
D 1
R 4
D 1
L 5
R 2`,
			extraArgs: [],
			expected: `13`,
		},
	];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2022day9_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2022day9_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2022day9_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2022day9_part2(input));
	const part2After = performance.now();

	logSolution(9, 2022, part1Solution, part2Solution);

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
