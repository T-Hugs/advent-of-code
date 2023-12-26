import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2023;
const DAY = 8;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/08/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/08/data.txt
// problem url  : https://adventofcode.com/2023/day/8

async function p2023day8_part1(input: string, ...params: any[]) {
	const lines = input.split("\n");
	const dirStr = lines.shift();
	if (!dirStr) {
		throw new Error();
	}
	const dirs = dirStr.split("");
	lines.shift();
	const map: { [key: string]: [string, string] } = {};
	for (const line of lines) {
		const [from, toStr] = line.split(" = ");
		const leftDest = toStr.substring(1, 4);
		const rightDest = toStr.substring(6, 9);
		map[from] = [leftDest, rightDest];
	}
	let steps = 0;
	let current = "AAA";
	while (true) {
		const dir = dirs[steps % dirs.length];
		steps++;
		if (dir === "L") {
			current = map[current][0];
		} else {
			current = map[current][1];
		}
		if (current === "ZZZ") {
			break;
		}
	}
	return steps;
}

async function p2023day8_part2(input: string, ...params: any[]) {
	const lines = input.split("\n");
	const dirStr = lines.shift();
	if (!dirStr) {
		throw new Error();
	}
	const dirs = dirStr.split("");
	lines.shift();
	const map: { [key: string]: [string, string] } = {};
	for (const line of lines) {
		const [from, toStr] = line.split(" = ");
		const leftDest = toStr.substring(1, 4);
		const rightDest = toStr.substring(6, 9);
		map[from] = [leftDest, rightDest];
	}

	let stepCounts = Object.fromEntries(
		Object.keys(map)
			.filter(k => k.endsWith("A"))
			.map(k => [k, 0])
	);
	for (const pos of Object.keys(stepCounts)) {
		let steps = 0;
		let current = pos;
		while (true) {
			const dir = dirs[steps % dirs.length];
			steps++;
			if (dir === "L") {
				current = map[current][0];
			} else {
				current = map[current][1];
			}
			if (current.endsWith("Z")) {
				stepCounts[pos] = steps;
				break;
			}
		}
	}
	return util.lcm(Object.values(stepCounts).map(BigInt));
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `RL

AAA = (BBB, CCC)
BBB = (DDD, EEE)
CCC = (ZZZ, GGG)
DDD = (DDD, DDD)
EEE = (EEE, EEE)
GGG = (GGG, GGG)
ZZZ = (ZZZ, ZZZ)`,
			extraArgs: [],
			expected: `2`,
			expectedPart2: ``,
		},
		{
			input: `LLR

AAA = (BBB, BBB)
BBB = (AAA, ZZZ)
ZZZ = (ZZZ, ZZZ)`,
			extraArgs: [],
			expected: `6`,
			expectedPart2: ``,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `LR

11A = (11B, XXX)
11B = (XXX, 11Z)
11Z = (11B, XXX)
22A = (22B, XXX)
22B = (22C, 22C)
22C = (22Z, 22Z)
22Z = (22B, 22B)
XXX = (XXX, XXX)`,
			extraArgs: [],
			expected: `6`,
			expectedPart1: ``,
		},
	];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2023day8_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2023day8_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2023day8_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2023day8_part2(input));
	const part2After = performance.now();

	logSolution(8, 2023, part1Solution, part2Solution);

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
