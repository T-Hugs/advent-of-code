import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2022;
const DAY = 5;

// solution path: C:\Users\trgau\dev\t-hugs\advent-of-code\years\2022\05\index.ts
// data path    : C:\Users\trgau\dev\t-hugs\advent-of-code\years\2022\05\data.txt
// problem url  : https://adventofcode.com/2022/day/5

function parseInput(input: string) {
	const stacks: string[][] = [];
	const [stackInput, moves] = input.split("\n\n").map(s => s.split("\n"));

	for (let i = 0; i < stackInput.length; ++i) {
		for (let j = 0; j < stackInput[i].length; j += 4) {
			const letter = stackInput[i][j + 1];
			if (/[A-Z]/.test(letter)) {
				if (!stacks[j / 4]) {
					stacks[j / 4] = [];
				}
				stacks[j / 4].unshift(letter);
			}
		}
	}
	return { stacks, moves };
}

async function p2022day5_part1(input: string, ...params: any[]) {
	const { stacks, moves } = parseInput(input);

	for (const move of moves) {
		const [_, qty, __, from, ___, to] = move.split(" ").map(Number);
		for (let i = 0; i < Number(qty); ++i) {
			const popped = stacks[from - 1].pop();
			if (popped) {
				stacks[to - 1].push(popped);
			}
		}
	}
	return stacks.reduce((p, c) => p + c.pop(), "");
}

async function p2022day5_part2(input: string, ...params: any[]) {
	const { stacks, moves } = parseInput(input);

	for (const move of moves) {
		const [_, qty, __, from, ___, to] = move.split(" ").map(Number);

		const removed = stacks[from - 1].splice(stacks[from - 1].length - qty, qty);
		stacks[to - 1].push(...removed);
	}
	return stacks.reduce((p, c) => p + c.pop(), "");
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `    [D]    
[N] [C]    
[Z] [M] [P]
	1   2   3 

move 1 from 2 to 1
move 3 from 1 to 3
move 2 from 2 to 1
move 1 from 1 to 2`,
			extraArgs: [],
			expected: `CMZ`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `    [D]    
[N] [C]    
[Z] [M] [P]
	1   2   3 

move 1 from 2 to 1
move 3 from 1 to 3
move 2 from 2 to 1
move 1 from 1 to 2`,
			extraArgs: [],
			expected: `MCD`,
		},
	];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2022day5_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2022day5_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2022day5_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2022day5_part2(input));
	const part2After = performance.now();

	logSolution(5, 2022, part1Solution, part2Solution);

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
