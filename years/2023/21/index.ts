import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";
import { Grid } from "../../../util/grid";
import aStar from "a-star";

const YEAR = 2023;
const DAY = 21;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/21/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/21/data.txt
// problem url  : https://adventofcode.com/2023/day/21

async function p2023day21_part1(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input });
	const steps = params[0] || 64;

	const startCell = grid.getCell("S");
	if (!startCell) {
		throw new Error();
	}
	startCell?.setValue(".");

	let validCount = 0;
	// let percent = 0;
	for (const cell of grid) {
		// let newPercent = Math.round((cell.position[0] / grid.rowCount) * 100);
		// if (newPercent !== percent) {
		// 	percent = newPercent;
		// 	console.log(percent, "%");
		// }
		if (cell.value === "#") {
			continue;
		}
		const manhattanDistanceToStart = cell.manhattanDistanceTo(startCell);
		if (manhattanDistanceToStart % 2 === 1) {
			continue;
		}
		if (manhattanDistanceToStart > steps) {
			continue;
		}
		if (cell.neighbors(false, false).filter(n => n.value !== "#").length === 0) {
			continue;
		}
		if (steps > 20) {
			cell.setValue("O");
			validCount++;
		} else {
			const path = aStar({
				start: cell,
				distance(a, b) {
					return 1;
				},
				heuristic(n) {
					return manhattanDistanceToStart;
				},
				isEnd(n) {
					return startCell.isEqual(n);
				},
				neighbor(node, rawNode) {
					return node.neighbors(false, false).filter(n => n.value !== "#");
				},
			});
			if (path.status === "success" && path.path.length - 1 <= steps) {
				cell.setValue("O");
				validCount++;
			}
		}
	}
	//grid.log();

	// answer: 3743
	return validCount;
}

async function p2023day21_part2(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input });
	const gridFactor = 3;
	const bigGrid = new Grid({ rowCount: grid.rowCount * gridFactor, colCount: grid.colCount * gridFactor });
	for (const cell of grid) {
		for (let i = 0; i < gridFactor; ++i) {
			for (let j = 0; j < gridFactor; ++j) {
				bigGrid.setCell(
					[cell.position[0] + grid.rowCount * i, cell.position[1] + grid.colCount * j],
					cell.value
				);
			}
		}
	}
	const steps = params[0] || 384;

	// 64: 3743
	// 128: 11119 (delta = 7376)
	// 196: 19914 (delta = 8795)
	// 256: 29349 (delta = 9435)
	// 320: 41107 (delta = 11758)
	// 384: 54854

	const startCell = grid.getCell("S");
	if (!startCell) {
		throw new Error();
	}
	startCell?.setValue(".");

	let validCount = 0;
	// let percent = 0;
	for (const cell of bigGrid) {
		// let newPercent = Math.round((cell.position[0] / grid.rowCount) * 100);
		// if (newPercent !== percent) {
		// 	percent = newPercent;
		// 	console.log(percent, "%");
		// }
		if (cell.value === "#") {
			continue;
		}
		const manhattanDistanceToStart = cell.manhattanDistanceTo(startCell);
		if (manhattanDistanceToStart % 2 === 1) {
			continue;
		}
		if (manhattanDistanceToStart > steps) {
			continue;
		}
		if (cell.neighbors(false, false).filter(n => n.value !== "#").length === 0) {
			continue;
		}
		if (steps > 20) {
			cell.setValue("O");
			validCount++;
		} else {
			const path = aStar({
				start: cell,
				distance(a, b) {
					return 1;
				},
				heuristic(n) {
					return manhattanDistanceToStart;
				},
				isEnd(n) {
					return startCell.isEqual(n);
				},
				neighbor(node, rawNode) {
					return node.neighbors(false, false).filter(n => n.value !== "#");
				},
			});
			if (path.status === "success" && path.path.length - 1 <= steps) {
				cell.setValue("O");
				validCount++;
			}
		}
	}
	//grid.log();

	// answer: 3743
	return validCount;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `...........
.....###.#.
.###.##..#.
..#.#...#..
....#.#....
.##..S####.
.##..#...#.
.......##..
.##.#.####.
.##..##.##.
...........`,
			extraArgs: [6],
			expected: `16`,
			expectedPart2: ``,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `...........
.....###.#.
.###.##..#.
..#.#...#..
....#.#....
.##..S####.
.##..#...#.
.......##..
.##.#.####.
.##..##.##.
...........`,
			extraArgs: [6],
			expected: `16`,
			expectedPart1: ``,
		},
		{
			input: `...........
.....###.#.
.###.##..#.
..#.#...#..
....#.#....
.##..S####.
.##..#...#.
.......##..
.##.#.####.
.##..##.##.
...........`,
			extraArgs: [10],
			expected: `50`,
			expectedPart1: ``,
		},
		{
			input: `...........
.....###.#.
.###.##..#.
..#.#...#..
....#.#....
.##..S####.
.##..#...#.
.......##..
.##.#.####.
.##..##.##.
...........`,
			extraArgs: [50],
			expected: `1594`,
			expectedPart1: ``,
		},
		{
			input: `...........
.....###.#.
.###.##..#.
..#.#...#..
....#.#....
.##..S####.
.##..#...#.
.......##..
.##.#.####.
.##..##.##.
...........`,
			extraArgs: [100],
			expected: `6536`,
			expectedPart1: ``,
		},
		{
			input: `...........
.....###.#.
.###.##..#.
..#.#...#..
....#.#....
.##..S####.
.##..#...#.
.......##..
.##.#.####.
.##..##.##.
...........`,
			extraArgs: [500],
			expected: `167004`,
			expectedPart1: ``,
		},
		{
			input: `...........
.....###.#.
.###.##..#.
..#.#...#..
....#.#....
.##..S####.
.##..#...#.
.......##..
.##.#.####.
.##..##.##.
...........`,
			extraArgs: [1000],
			expected: `668697`,
			expectedPart1: ``,
		},
		{
			input: `...........
.....###.#.
.###.##..#.
..#.#...#..
....#.#....
.##..S####.
.##..#...#.
.......##..
.##.#.####.
.##..##.##.
...........`,
			extraArgs: [5000],
			expected: `16733044`,
			expectedPart1: ``,
		},
	];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2023day21_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2023day21_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2023day21_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2023day21_part2(input));
	const part2After = performance.now();

	logSolution(21, 2023, part1Solution, part2Solution);

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
