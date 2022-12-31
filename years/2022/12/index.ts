import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { Grid } from "../../../util/grid";
import aStar from "a-star";

const YEAR = 2022;
const DAY = 12;

// solution path: C:\Users\trgau\dev\t-hugs\advent-of-code\years\2022\12\index.ts
// data path    : C:\Users\trgau\dev\t-hugs\advent-of-code\years\2022\12\data.txt
// problem url  : https://adventofcode.com/2022/day/12

function height(val: string) {
	if (val === "S") {
		return 0;
	}
	if (val === "E") {
		return 25;
	}
	return val.charCodeAt(0) - "a".charCodeAt(0);
}

async function p2022day12_part1(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input });

	const path = aStar({
		start: grid.getCell("S")!,
		isEnd: n => n?.value === "E",
		neighbor: c => {
			const neighbors = c.neighbors() ?? [];
			return neighbors.filter(n => height(n.value) - 1 <= height(c.value));
		},
		heuristic: c => 25 - height(c.value),
		distance: (a, b) => 1,
	});

	grid.log();
	return path.path.length - 1;
}

async function p2022day12_part2(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input });

	const lengths: number[] = [];
	for (const cell of grid.getCells("a")) {
		const path = aStar({
			start: cell,
			isEnd: n => n?.value === "E",
			neighbor: c => {
				const neighbors = c.neighbors() ?? [];
				return neighbors.filter(n => height(n.value) - 1 <= height(c.value));
			},
			heuristic: c => 25 - height(c.value),
			distance: (a, b) => 1,
		});
		if (path.status === "success") {
			lengths.push(path.path.length - 1);
		}
	}
	return Math.min(...lengths);
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `Sabqponm
abcryxxl
accszExk
acctuvwj
abdefghi`,
			extraArgs: [],
			expected: `31`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `Sabqponm
abcryxxl
accszExk
acctuvwj
abdefghi`,
			extraArgs: [],
			expected: `29`,
		},
	];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2022day12_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2022day12_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2022day12_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2022day12_part2(input));
	const part2After = performance.now();

	logSolution(12, 2022, part1Solution, part2Solution);

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
