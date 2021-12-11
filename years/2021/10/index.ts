import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2021;
const DAY = 10;

// solution path: C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\10\index.ts
// data path    : C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\10\data.txt
// problem url  : https://adventofcode.com/2021/day/10

const pointValues: Obj<number> = {
	")": 3,
	"]": 57,
	"}": 1197,
	">": 25137,
};

const pairs: Obj<string> = {
	"(": ")",
	"[": "]",
	"{": "}",
	"<": ">",
};
const opens = Object.keys(pairs);
const closes = Object.values(pairs);

function getScore(line: string) {
	const stack: string[] = [];
	for (const char of line) {
		if (opens.includes(char)) {
			stack.push(char);
		} else if (closes.includes(char)) {
			const mustBe = pairs[stack.pop()!];
			if (char !== mustBe) {
				return pointValues[char];
			}
		}
	}
	return 0;
}

async function p2021day10_part1(input: string, ...params: any[]) {
	const lines = input.split("\n");
	let score = 0;
	for (const line of lines) {
		score += getScore(line);
	}
	return score;
}

const acPointValues: Obj<number> = {
	")": 1,
	"]": 2,
	"}": 3,
	">": 4,
};

function getACScore(line: string) {
	const stack: string[] = [];
	for (const char of line) {
		if (opens.includes(char)) {
			stack.push(char);
		} else if (closes.includes(char)) {
			stack.pop();
		}
	}
	let score = 0;
	stack.reverse();
	for (const char of stack) {
		score *= 5;
		score += acPointValues[pairs[char]];
	}
	return score;
}

async function p2021day10_part2(input: string, ...params: any[]) {
	const lines = input.split("\n");
	let scores: number[] = [];
	for (const line of lines) {
		const syntaxScore = getScore(line);
		if (syntaxScore === 0) {
			scores.push(getACScore(line))
		}
	}
	scores.sort((a, b) => a - b);
	return scores[Math.floor(scores.length / 2)];
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `[({(<(())[]>[[{[]{<()<>>
[(()[<>])]({[<{<<[]>>(
{([(<{}[<>[]}>{[]{[(<()>
(((({<>}<{<{<>}{[]{[]{}
[[<[([]))<([[{}[[()]]]
[{[{({}]{}}([{[{{{}}([]
{<[[]]>}<{[{[{[]{()[[[]
[<(<(<(<{}))><([]([]()
<{([([[(<>()){}]>(<<{{
<{([{{}}[<[[[<>{}]]]>[]]`,
		extraArgs: [],
		expected: `26397`
	}];
	const part2tests: TestCase[] = [{
		input: `[({(<(())[]>[[{[]{<()<>>
[(()[<>])]({[<{<<[]>>(
{([(<{}[<>[]}>{[]{[(<()>
(((({<>}<{<{<>}{[]{[]{}
[[<[([]))<([[{}[[()]]]
[{[{({}]{}}([{[{{{}}([]
{<[[]]>}<{[{[{[]{()[[[]
[<(<(<(<{}))><([]([]()
<{([([[(<>()){}]>(<<{{
<{([{{}}[<[[[<>{}]]]>[]]`,
		extraArgs: [],
		expected: `288957`
	}];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2021day10_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2021day10_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2021day10_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2021day10_part2(input));
	const part2After = performance.now();

	logSolution(10, 2021, part1Solution, part2Solution);

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
