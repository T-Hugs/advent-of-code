import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { textChangeRangeNewSpan } from "typescript";

const YEAR = 2020;
const DAY = 10;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2020/10/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2020/10/data.txt
// problem url  : https://adventofcode.com/2020/day/10

async function p2020day10_part1(input: string) {
	const lines = input.split("\n");
	const nums: number[] = [];
	for (const line of lines) {
		nums.push(Number(line));
	}

	let current = 0;
	let ones = 0;
	let threes = 1;
	for (let i = 0; ; ++i) {
		if (nums.includes(current + 1)) {
			ones++;
			current++;
		} else if (nums.includes(current + 3)) {
			threes++;
			current += 3;
		} else {
			break;
		}
	}
	return ones * threes;
}

async function p2020day10_part2(input: string) {
	const lines = input.split("\n");
	const nums: number[] = [];
	for (const line of lines) {
		nums.push(Number(line));
	}

	const memo: Obj<number> = {};
	function getChoices(pool: number[], current?: number, end?: number): number {
		if (current == undefined) {
			current = Math.min(...pool);
		}
		if (end == undefined) {
			end = Math.max(...pool);
		}
		if (memo[current] != undefined) {
			return memo[current];
		}
		if (current + 3 === end) {
			return 1;
		}
		if (!pool.includes(current)) {
			return 0;
		}
		let result =
			getChoices(pool, current + 1, end) +
			getChoices(pool, current + 2, end) +
			getChoices(pool, current + 3, end);
		memo[current] = result;
		return result;
	}
	const min = Math.min(...nums);
	const max = Math.max(...nums);
	nums.push(min - 1);
	nums.push(max + 3);
	return getChoices(nums);
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `16
10
15
5
1
11
7
19
6
12
4`,
			expected: `35`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `16
10
15
5
1
11
7
19
6
12
4`,
			expected: `8`,
		},
		{
			input: `28
33
18
42
31
14
46
20
48
47
24
23
49
45
19
38
39
11
1
32
25
35
8
17
7
9
4
2
34
10
3`,
			expected: `19208`,
		},
		{
			input: `1
2
3
4
5`,
			expected: `13`,
		},{
			input: `1
2
3
4`,
			expected: `4`
		}
	];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2020day10_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2020day10_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2020day10_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2020day10_part2(input));
	const part2After = performance.now();

	logSolution(10, 2020, part1Solution, part2Solution);

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
