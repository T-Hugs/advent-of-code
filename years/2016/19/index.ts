import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2016;
const DAY = 19;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2016/19/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2016/19/data.txt
// problem url  : https://adventofcode.com/2016/day/19

async function p2016day19_part1(input: string) {
	const playerCount = Number(input);
	const eliminated = new Set<Number>();

	let pointer = 0;
	let lastToSteal = -1;
	while (eliminated.size < playerCount - 1) {
		let nextToEliminate = (pointer + 1) % playerCount;
		while (eliminated.has(nextToEliminate)) {
			nextToEliminate = (nextToEliminate + 1) % playerCount;
		}
		eliminated.add(nextToEliminate);
		lastToSteal = pointer;
		pointer = (nextToEliminate + 1) % playerCount;
		while (eliminated.has(pointer)) {
			pointer = (pointer + 1) % playerCount;
		}
	}
	return lastToSteal + 1;
}

async function p2016day19_part2(input: string) {
	// Compute the largest value of 3^n + 1 that is less than or equal to the input, where n is an integer > 0.
	const numPlayers = Number(input);
	let lastTimePlayerOneWon = 1;
	let nextTimePlayerOneWillWin = 1;
	for (let i = 0; ; ++i) {
		const next = Math.pow(3, i) + 1;
		if (next > numPlayers) {
			nextTimePlayerOneWillWin = next;
			break;
		}
		lastTimePlayerOneWon = next;
	}

	const difference = nextTimePlayerOneWillWin - lastTimePlayerOneWon;
	const untilJumpByTwo = Math.floor(difference / 2) + lastTimePlayerOneWon - 1;
	if (numPlayers <= untilJumpByTwo) {
		return numPlayers - lastTimePlayerOneWon + 1;
	} else {
		return (untilJumpByTwo - lastTimePlayerOneWon + 1) + 2 * (numPlayers - untilJumpByTwo);
	}
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `5`,
			expected: `3`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `2`,
			extraArgs: [],
			expected: `1`,
		},
		{
			input: `3`,
			extraArgs: [],
			expected: `3`,
		},
		{
			input: `4`,
			extraArgs: [],
			expected: `1`,
		},
		{
			input: `5`,
			extraArgs: [],
			expected: `2`,
		},
		{
			input: `6`,
			extraArgs: [],
			expected: `3`,
		},
		{
			input: `7`,
			extraArgs: [],
			expected: `5`,
		},
		{
			input: `8`,
			extraArgs: [],
			expected: `7`,
		},
		{
			input: `9`,
			extraArgs: [],
			expected: `9`,
		},
		{
			input: `10`,
			extraArgs: [],
			expected: `1`,
		},
		{
			input: `11`,
			extraArgs: [],
			expected: `2`,
		},
	];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2016day19_part1(testCase.input)));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2016day19_part2(testCase.input)));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2016day19_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2016day19_part2(input));
	const part2After = performance.now();

	logSolution(19, 2016, part1Solution, part2Solution);

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
