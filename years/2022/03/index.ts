import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2022;
const DAY = 3;

// solution path: C:\Users\trgau\dev\t-hugs\advent-of-code\years\2022\03\index.ts
// data path    : C:\Users\trgau\dev\t-hugs\advent-of-code\years\2022\03\data.txt
// problem url  : https://adventofcode.com/2022/day/3

const alpha = "abcdefghijklmnopqrstuvwxyz";
const priorities = alpha.split("");
priorities.push(...alpha.toUpperCase().split(""));
function getPriority(letter: string) {
	return priorities.indexOf(letter) + 1;
}

async function p2022day3_part1(input: string, ...params: any[]) {
	const lines = input.split("\n");
	const commons = [];
	for (const line of lines) {
		const first = line.slice(0, line.length / 2);
		const second = line.slice(line.length / 2);
		const uniqFirst = util.countUniqueElements(first);
		for (const l of second) {
			if (uniqFirst[l]) {
				commons.push(l);
				break;
			}
		}
	}
	return commons.reduce((p, c) => p + getPriority(c), 0);
}

async function p2022day3_part2(input: string, ...params: any[]) {
	const lines = input.split("\n");
	const alpha = "abcdefghijklmnopqrstuvwxyz";
	const badges = [];
	for (let i = 0; i < lines.length; i += 3) {
		const first = lines[i];
		const second = lines[i + 1];
		const third = lines[i + 2];

		for (const letter of alpha + alpha.toUpperCase()) {
			if (first.includes(letter) && second.includes(letter) && third.includes(letter)) {
				badges.push(letter);
				break;
			}
		}
	}
	return badges.reduce((p, c) => p + getPriority(c), 0);
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `vJrwpWtwJgWrhcsFMMfFFhFp
jqHRNqRjqzjGDLGLrsFMfFZSrLrFZsSL
PmmdzqPrVvPwwTWBwg
wMqvLMZHhHMvwLHjbvcjnnSBnvTQFn
ttgJtRGJQctTZtZT
CrZsJsPPZsGzwwsLwLmpwMDw`,
			extraArgs: [],
			expected: `157`,
		},
	];
	const part2tests: TestCase[] = [{
		input: `vJrwpWtwJgWrhcsFMMfFFhFp
jqHRNqRjqzjGDLGLrsFMfFZSrLrFZsSL
PmmdzqPrVvPwwTWBwg
wMqvLMZHhHMvwLHjbvcjnnSBnvTQFn
ttgJtRGJQctTZtZT
CrZsJsPPZsGzwwsLwLmpwMDw`,
		extraArgs: [],
		expected: `70`
	}];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2022day3_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2022day3_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2022day3_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2022day3_part2(input));
	const part2After = performance.now();

	logSolution(3, 2022, part1Solution, part2Solution);

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
