import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import * as LOGUTIL from "../../../util/log";
import { performance } from "perf_hooks";
import aStar from "a-star";
const { log, logSolution, trace } = LOGUTIL;

const YEAR = 2016;
const DAY = 17;
const DEBUG = true;
LOGUTIL.setDebug(DEBUG);

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2016/17/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2016/17/data.txt
// problem url  : https://adventofcode.com/2016/day/17

const hexletter = /[b-f]/;
async function p2016day17_part1(input: string) {
	return aStar<[number, number, string]>({
		isEnd: n => n[0] === 3 && n[1] === 3,
		hash: n => `${n[0]},${n[1]},${n[2]}`,
		start: [0, 0, ""],
		neighbor: n => {
			const neighbors: [number, number, string][] = [];
			const hash = util.md5(input + n[2]).substr(0, 4);
			if (n[0] > 0 && hexletter.test(hash[0])) {
				neighbors.push([n[0] - 1, n[1], n[2] + "U"]);
			}
			if (n[0] < 3 && hexletter.test(hash[1])) {
				neighbors.push([n[0] + 1, n[1], n[2] + "D"]);
			}
			if (n[1] > 0 && hexletter.test(hash[2])) {
				neighbors.push([n[0], n[1] - 1, n[2] + "L"]);
			}
			if (n[1] < 3 && hexletter.test(hash[3])) {
				neighbors.push([n[0], n[1] + 1, n[2] + "R"]);
			}
			return neighbors;
		},
		distance: () => 1,
		heuristic: n => 3 - n[0] + (3 - n[1]),
	}).path.slice(-1)[0][2];
}

async function p2016day17_part2(input: string) {
	return "Not implemented";
}

async function run() {
	const part1tests: TestCase[] = [
		// {
		// 	input: `hijkl`,
		// 	expected: `DDRRRD`,
		// },
		{
			input: `ihgpwlah`,
			expected: `DDRRRD`,
		},
		{
			input: `kglvqrro`,
			expected: `DDUDRLRRUDRD`,
		},
		{
			input: `ulqzkmiv`,
			expected: `DRURDRUDDLLDLUURRDULRLDUUDDDRR`,
		},
	];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2016day17_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2016day17_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2016day17_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2016day17_part2(input));
	const part2After = performance.now();

	logSolution(17, 2016, part1Solution, part2Solution);

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
