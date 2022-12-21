import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2022;
const DAY = 10;

// solution path: C:\Users\trgau\dev\t-hugs\advent-of-code\years\2022\10\index.ts
// data path    : C:\Users\trgau\dev\t-hugs\advent-of-code\years\2022\10\data.txt
// problem url  : https://adventofcode.com/2022/day/10

async function p2022day10_part1(input: string, ...params: any[]) {
	let regX = 1;

	const magicCycles = [20, 60, 100, 140, 180, 220];
	let magicCycleIndex = 0;
	let signalStrengthSum = 0;

	const lines = input.split("\n");

	let state: "ready" | "adding" = "ready";
	let toAdd = 0;
	let inputPointer = 0;

	for (let cycle = 1; ; ++cycle) {
		if (cycle === magicCycles[magicCycleIndex]) {
			magicCycleIndex++;
			signalStrengthSum += cycle * regX;
		}
		if (state === "ready") {
			const line = lines[inputPointer++];
			if (!line) {
				break;
			}
			const [op, operand] = line.split(" ");
			if (op === "addx") {
				const val = Number(operand);
				toAdd = val;
				state = "adding";
			}
		} else if (state === "adding") {
			regX += toAdd;
			state = "ready";
		}
	}

	return signalStrengthSum;
}

// flag:ocr
async function p2022day10_part2(input: string, ...params: any[]) {
	let regX = 1;
	const lines = input.split("\n");

	let state: "ready" | "adding" = "ready";
	let toAdd = 0;
	let inputPointer = 0;

	let display = "";

	for (let cycle = 1; cycle < 40 * 6 + 1; ++cycle) {
		const xPos = (cycle - 1) % 40;
		if (xPos === 0) {
			display += "\n";
		}
		if (regX - 1 <= xPos && regX + 1 >= xPos) {
			display += "#";
		} else {
			display += " ";
		}
		if (state === "ready") {
			const line = lines[inputPointer++];
			if (!line) {
				break;
			}
			const [op, operand] = line.split(" ");
			if (op === "addx") {
				const val = Number(operand);
				toAdd = val;
				state = "adding";
			}
		} else if (state === "adding") {
			regX += toAdd;
			state = "ready";
		}
	}

	console.log();
	console.log(display);
	console.log();
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `noop
addx 3
addx -5
`,
			extraArgs: [],
			expected: `0`,
		},
		{
			input: `addx 15
addx -11
addx 6
addx -3
addx 5
addx -1
addx -8
addx 13
addx 4
noop
addx -1
addx 5
addx -1
addx 5
addx -1
addx 5
addx -1
addx 5
addx -1
addx -35
addx 1
addx 24
addx -19
addx 1
addx 16
addx -11
noop
noop
addx 21
addx -15
noop
noop
addx -3
addx 9
addx 1
addx -3
addx 8
addx 1
addx 5
noop
noop
noop
noop
noop
addx -36
noop
addx 1
addx 7
noop
noop
noop
addx 2
addx 6
noop
noop
noop
noop
noop
addx 1
noop
noop
addx 7
addx 1
noop
addx -13
addx 13
addx 7
noop
addx 1
addx -33
noop
noop
noop
addx 2
noop
noop
noop
addx 8
noop
addx -1
addx 2
addx 1
noop
addx 17
addx -9
addx 1
addx 1
addx -3
addx 11
noop
noop
addx 1
noop
addx 1
noop
noop
addx -13
addx -19
addx 1
addx 3
addx 26
addx -30
addx 12
addx -1
addx 3
addx 1
noop
noop
noop
addx -9
addx 18
addx 1
addx 2
noop
noop
addx 9
noop
noop
noop
addx -1
addx 2
addx -37
addx 1
addx 3
noop
addx 15
addx -21
addx 22
addx -6
addx 1
noop
addx 2
addx 1
noop
addx -10
noop
noop
addx 20
addx 1
addx 2
addx 2
addx -6
addx -11
noop
noop
noop`,
			extraArgs: [],
			expected: `13140`,
		},
	];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2022day10_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2022day10_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2022day10_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2022day10_part2(input));
	const part2After = performance.now();

	logSolution(10, 2022, part1Solution, part2Solution);

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
