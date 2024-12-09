import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";
import { Cell, Grid } from "../../../util/grid";

const YEAR = 2024;
const DAY = 4;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2024/04/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2024/04/data.txt
// problem url  : https://adventofcode.com/2024/day/4

async function p2024day4_part1(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input });

	const search = "XMAS";
	const searches = ["east", "southeast", "south", "southwest", "west", "northwest", "north", "northeast"] as const;

	let targetCount = 0;
	for (const cell of grid) {
		if (cell.value === search[0]) {
			for (const direction of searches) {
				const candidates: Cell[] = [cell];
				for (let i = 1; i < search.length; ++i) {
					const candidate = (candidates[i - 1] as any)[direction]() as Cell;
					if (candidate) {
						candidates.push(candidate);
					} else {
						break;
					}
				}
				if (candidates.length === search.length) {
					let good = true;
					for (let i = 0; i < search.length; ++i) {
						if (candidates[i].value !== search[i]) {
							good = false;
							break;
						}
					}
					if (good) {
						targetCount++;
					}
				}
			}
		}
	}
	return targetCount;
}

async function p2024day4_part2(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input });

	const search = "MAS";
	const searchReverse = search.split("").reverse().join("");
	let count = 0;

	for (const cell of grid) {
		if (cell.isEdge()) {
			continue;
		}
		const d1 = [cell.northwest(), cell, cell.southeast()];
		const d2 = [cell.southwest(), cell, cell.northeast()];

		const d1word = d1.map(c => c?.value).join("");
		const d2word = d2.map(c => c?.value).join("");

		if ((d1word === search || d1word === searchReverse) && (d2word === search || d2word === searchReverse)) {
			count++;
		}
	}
	return count;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `MMMSXXMASM
MSAMXMSMSA
AMXSXMAAMM
MSAMASMSMX
XMASAMXAMM
XXAMMXXAMA
SMSMSASXSS
SAXAMASAAA
MAMMMXMMMM
MXMXAXMASX`,
			extraArgs: [],
			expected: `18`,
			expectedPart2: `9`,
		},
		{
			input: `....XXMAS.
.SAMXMS...
...S..A...
..A.A.MS.X
XMASAMX.MM
X.....XA.A
S.S.S.S.SS
.A.A.A.A.A
..M.M.M.MM
.X.X.XMASX`,
			extraArgs: [],
			expected: `18`,
			expectedPart2: ``,
		},
		{
			input: `..X...
.SAMX.
.A..A.
XMAS.S
.X....`,
			extraArgs: [],
			expected: `4`,
			expectedPart2: ``,
		},
	];
	const part2tests: TestCase[] = [];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day4_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day4_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day4_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2024day4_part2(input));
	const part2After = performance.now();

	logSolution(4, 2024, part1Solution, part2Solution);

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
