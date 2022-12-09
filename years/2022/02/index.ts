import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2022;
const DAY = 2;

// solution path: C:\Users\trgau\dev\t-hugs\advent-of-code\years\2022\02\index.ts
// data path    : C:\Users\trgau\dev\t-hugs\advent-of-code\years\2022\02\data.txt
// problem url  : https://adventofcode.com/2022/day/2

async function p2022day2_part1(input: string, ...params: any[]) {
	const rockPoints = 1;
	const paperPoints = 2;
	const scissorsPoints = 3;
	const winPoints = 6;
	const tiePoints = 3;
	const losePoints = 0;

	const lines = input.split("\n");
	let score = 0;
	for (const line of lines) {
		const [theirs, mine] = line.split(" ");
		if (theirs === "A" && mine === "X") {
			score += tiePoints + rockPoints;
		}
		if (theirs === "A" && mine === "Y") {
			score += winPoints + paperPoints;
		}
		if (theirs === "A" && mine === "Z") {
			score += losePoints + scissorsPoints;
		}
		if (theirs === "B" && mine === "X") {
			score += losePoints + rockPoints;
		}
		if (theirs === "B" && mine === "Y") {
			score += tiePoints + paperPoints;
		}
		if (theirs === "B" && mine === "Z") {
			score += winPoints + scissorsPoints;
		}
		if (theirs === "C" && mine === "X") {
			score += winPoints + rockPoints;
		}
		if (theirs === "C" && mine === "Y") {
			score += losePoints + paperPoints;
		}
		if (theirs === "C" && mine === "Z") {
			score += tiePoints + scissorsPoints;
		}
	}
	return score;
}

async function p2022day2_part2(input: string, ...params: any[]) {
	const rockPoints = 1;
	const paperPoints = 2;
	const scissorsPoints = 3;
	const winPoints = 6;
	const tiePoints = 3;
	const losePoints = 0;

	let score = 0;
	const lines = input.split("\n");
	for (const line of lines) {
		const [theirs, outcome] = line.split(" ");
		if (theirs === "A" && outcome === "X") {
			score += losePoints + scissorsPoints;
		}
		if (theirs === "A" && outcome === "Y") {
			score += tiePoints + rockPoints;
		}
		if (theirs === "A" && outcome === "Z") {
			score += winPoints + paperPoints;
		}
		if (theirs === "B" && outcome === "X") {
			score += losePoints + rockPoints;
		}
		if (theirs === "B" && outcome === "Y") {
			score += tiePoints + paperPoints;
		}
		if (theirs === "B" && outcome === "Z") {
			score += winPoints + scissorsPoints;
		}
		if (theirs === "C" && outcome === "X") {
			score += losePoints + paperPoints;
		}
		if (theirs === "C" && outcome === "Y") {
			score += tiePoints + scissorsPoints;
		}
		if (theirs === "C" && outcome === "Z") {
			score += winPoints + rockPoints;
		}
	}
	return score;
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `A Y
B X
C Z`,
		extraArgs: [],
		expected: `15`
	}];
	const part2tests: TestCase[] = [{
		input: `A Y
B X
C Z`,
		extraArgs: [],
		expected: `12`
	}];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2022day2_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2022day2_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2022day2_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2022day2_part2(input));
	const part2After = performance.now();

	logSolution(2, 2022, part1Solution, part2Solution);

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
