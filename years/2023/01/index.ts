import _, { first } from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2023;
const DAY = 1;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/01/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/01/data.txt
// problem url  : https://adventofcode.com/2023/day/1

async function p2023day1_part1(input: string, ...params: any[]) {
	const lines = input.split("\n");
	let sum = 0;
	for (const line of lines) {
		const arr = [...line];
		const firstNumber = arr.find(x => /\d/.test(x));
		const lastNumber = arr.findLast(x => /\d/.test(x));
		if (firstNumber && lastNumber) {
			//log("Adding", firstNumber, lastNumber);
			sum += Number(firstNumber + lastNumber);
		}
	}
	return sum;
}

async function p2023day1_part2(input: string, ...params: any[]) {
	const lines = input.split("\n");
	let sum = 0;
	const fre = /(\d)|(one)|(two)|(three)|(four)|(five)|(six)|(seven)|(eight)|(nine)|(zero)/;
	const bre = /(\d)|(eno)|(owt)|(eerht)|(ruof)|(evif)|(xis)|(neves)|(thgie)|(enin)|(orez)/;
	const english: { [key: string]: number } = {
		one: 1,
		two: 2,
		three: 3,
		four: 4,
		five: 5,
		six: 6,
		seven: 7,
		eight: 8,
		nine: 9,
		zero: 0,
	};
	for (const line of lines) {
		const first = fre.exec(line)?.[0];
		const lastReversed = bre.exec([...line].reverse().join(""))?.[0];
		if (first && lastReversed) {
			const last = [...lastReversed].reverse().join("");
			const firstVal = first.length > 1 ? english[first] : Number(first);
			const lastVal = last.length > 1 ? english[last] : Number(last);
			sum += Number(String(firstVal) + String(lastVal));
		}
	}
	return sum;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `1abc2
pqr3stu8vwx
a1b2c3d4e5f
treb7uchet`,
			extraArgs: [],
			expected: `142`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `two1nine
eightwothree
abcone2threexyz
xtwone3four
4nineeightseven2
zoneight234
7pqrstsixteen`,
			extraArgs: [],
			expected: `281`,
		},
	];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2023day1_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2023day1_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2023day1_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2023day1_part2(input));
	const part2After = performance.now();

	logSolution(1, 2023, part1Solution, part2Solution);

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
