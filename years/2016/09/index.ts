import _, { first } from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2016;
const DAY = 9;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2016/09/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2016/09/data.txt
// problem url  : https://adventofcode.com/2016/day/9
const re = /\((.*?)x(.*?)\)/;
async function p2016day9_part1(input: string) {
	let current = input;
	let offset = 0;
	while (true) {
		let next = current;
		const match = re.exec(next.substr(offset));
		if (match) {
			const numChars = Number(match[1]);
			const matchIndex = offset + match.index;
			const first = next.substr(0, matchIndex);
			const middle = _.repeat(next.substr(matchIndex + match[0].length, numChars), Number(match[2]));
			const end = next.substr(matchIndex + match[0].length + numChars);
			next = first + middle + end;
			offset = first.length + middle.length;
		}

		if (next === current) {
			break;
		}
		current = next;
	}
	return current.length;
}

function getLength(str: string): number {
	const match = re.exec(str);
	if (match) {
		const numChars = Number(match[1]);
		const repeatCt = Number(match[2]);
		const charsToRepeat = str.substr(match.index + match[0].length, numChars);
		return (
			match.index +
			getLength(charsToRepeat) * repeatCt +
			getLength(str.substr(match.index + match[0].length + numChars))
		);
	} else {
		return str.length;
	}
}

async function p2016day9_part2(input: string) {
	return getLength(input);
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `ADVENT`,
			expected: `6`,
		},
		{
			input: `A(1x5)BC`,
			expected: `7`,
		},
		{
			input: `(3x3)XYZ`,
			expected: `9`,
		},
		{
			input: `A(2x2)BCD(2x2)EFG`,
			expected: `11`,
		},
		{
			input: `(6x1)(1x3)A`,
			expected: `6`,
		},
		{
			input: `X(8x2)(3x3)ABCY`,
			expected: `18`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `(3x3)XYZ`,
			expected: `9`,
		},
		{
			input: `X(8x2)(3x3)ABCY`,
			expected: `${"XABCABCABCABCABCABCY".length}`,
		},
		{
			input: `(27x12)(20x12)(13x14)(7x10)(1x12)A`,
			expected: `241920`,
		},
		{
			input: `(25x3)(3x3)ABC(2x3)XY(5x2)PQRSTX(18x9)(3x2)TWO(5x7)SEVEN`,
			expected: `445`,
		},
	];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2016day9_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2016day9_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2016day9_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2016day9_part2(input));
	const part2After = performance.now();

	logSolution(9, 2016, part1Solution, part2Solution);

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
