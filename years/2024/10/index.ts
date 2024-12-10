import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";
import { Grid } from "../../../util/grid";
import { bfSearch, undirectedAllPaths } from "../../../util/graph";
import aStar from "a-star";

const YEAR = 2024;
const DAY = 10;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2024/10/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2024/10/data.txt
// problem url  : https://adventofcode.com/2024/day/10

async function p2024day10_part1(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input });

	return grid
		.getCells("0")
		.map(
			start =>
				grid
					.getCells("9")
					.map(end =>
						aStar({
							start: start,
							isEnd: node => node.position.join(",") === end.position.join(","),
							distance: (a, b) => 1,
							neighbor: node =>
								node
									.neighbors(false, false, true, true)
									.filter(n => Number(n.value) === Number(node.value) + 1),
							hash: node => node.position.join(","),
							heuristic: node =>
								Math.abs(node.position[0] - end.position[0]) +
								Math.abs(node.position[1] - end.position[1]),
						})
					)
					.filter(r => r.status === "success").length
		)
		.reduce((a, b) => a + b, 0);
}

async function p2024day10_part2(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input });

	const starts = grid.getCells("0");
	const ends = grid.getCells("9");
	let total = 0;
	for (const start of starts) {
		for (const end of ends) {
			total += undirectedAllPaths({
				start: start,
				isEnd: node => node.position.join(",") === end.position.join(","),
				neighbors: node =>
					node.neighbors(false, false, true, true).filter(n => Number(n.value) === Number(node.value) + 1),
				canRevisit: () => false,
			}).length;
		}
	}
	return total;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `0123
1234
8765
9876`,
			extraArgs: [],
			expected: `1`,
			expectedPart2: ``,
		},
		{
			input: `...0...
...1...
...2...
6543456
7.....7
8.....8
9.....9`,
			extraArgs: [],
			expected: `2`,
			expectedPart2: ``,
		},
		{
			input: `89010123
78121874
87430965
96549874
45678903
32019012
01329801
10456732`,
			extraArgs: [],
			expected: `36`,
			expectedPart2: `81`,
		},
	];
	const part2tests: TestCase[] = [];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day10_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day10_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day10_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2024day10_part2(input));
	const part2After = performance.now();

	logSolution(10, 2024, part1Solution, part2Solution);

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
