import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";
import { Cell, Grid } from "../../../util/grid";
import aStar from "a-star";

const YEAR = 2023;
const DAY = 21;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/21/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/21/data.txt
// problem url  : https://adventofcode.com/2023/day/21

function astarCalc(grid: Grid, start: Cell, steps: number, mark = false) {
	let validCount = 0;
	let invalidCount = 0;
	for (const cell of grid) {
		const manhattanDistanceToStart = cell.manhattanDistanceTo(start);
		if (manhattanDistanceToStart % 2 !== steps % 2) {
			continue;
		}
		if (manhattanDistanceToStart > steps) {
			continue;
		}
		if (cell.neighbors(false, false).filter(n => n.value !== "#").length === 0) {
			invalidCount++;
			continue;
		}
		if (cell.value === "#") {
			invalidCount++;
			continue;
		}

		const path = aStar({
			start: cell,
			distance(a, b) {
				return 1;
			},
			heuristic(n) {
				return manhattanDistanceToStart;
			},
			isEnd(n) {
				return start.isEqual(n);
			},
			neighbor(node, rawNode) {
				return node.neighbors(false, false).filter(n => n.value !== "#");
			},
		});
		if (path.status === "success" && path.path.length - 1 <= steps) {
			if (mark) {
				if (cell.value === "S") {
					cell.setValue("@");
				} else {
					cell.setValue("O");
				}
			}
			validCount++;
		}
	}
	return validCount;
}

function quickCalc(grid: Grid, start: Cell, steps: number, mark = false) {
	let validCount = 0;
	let invalidCount = 0;
	for (const cell of grid) {
		const manhattanDistanceToStart = cell.manhattanDistanceTo(start);
		if (manhattanDistanceToStart % 2 !== steps % 2) {
			continue;
		}
		if (manhattanDistanceToStart > steps) {
			continue;
		}
		if (cell.neighbors(false, false).filter(n => n.value !== "#").length === 0) {
			invalidCount++;
			continue;
		}
		if (cell.value === "#") {
			invalidCount++;
			continue;
		}

		if (mark) {
			if (cell.value === "S") {
				cell.setValue("@");
			} else {
				cell.setValue("O");
			}
		}
		validCount++;
	}
	return validCount;
}

async function p2023day21_part1(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input });
	const steps = params[0] || 64;

	const startCell = grid.getCell("S");
	if (!startCell) {
		throw new Error();
	}
	startCell?.setValue(".");

	if (steps > 20) {
		return quickCalc(grid, startCell, steps);
	} else {
		return astarCalc(grid, startCell, steps);
	}
}

async function p2023day21_part2(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input });
	const gridStartCell = grid.getCell("S");
	if (!gridStartCell) {
		throw new Error();
	}
	gridStartCell?.setValue(".");
	const gridFactor = 9;
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
	const startCell = bigGrid.getCell([(bigGrid.rowCount - 1) / 2, (bigGrid.colCount - 1) / 2])!;
	startCell.setValue("S");
	const steps = params[0] || 384;

	// 64: 3743
	// 128: 11119 (delta = 7376)
	// 196: 19914 (delta = 8795)
	// 256: 29349 (delta = 9435)
	// 320: 41107 (delta = 11758)
	// 384: 54854

	// const quickCounts: number[] = [];
	// const astarCounts: number[] = [];
	// for (let i = 1; i <= 32; ++i) {
	// 	console.log(i);
	// 	quickCounts.push(quickCalc(bigGrid, startCell, i));
	// 	astarCounts.push(astarCalc(grid, startCell, i));
	// }
	// Result from above
	// 4 9 14 23 32 43 55 72 85 109 125 149 169 195 222 251 276 313 340 386 418 464 495 552 575 643 675 740 771 845 878 956
	// 4 9 14 22 32 43 55 71 85 108 124 148 167 195 221 250 276 311 339 383 415 463 493 550 575 642 674 740 769 842 876 954

	// const c63 = quickCalc(bigGrid, startCell, 63);
	// const c64 = quickCalc(bigGrid, startCell, 64);
	// const c65 = quickCalc(bigGrid, startCell, 65);
	// const c66 = quickCalc(bigGrid, startCell, 66);
	// const a63 = astarCalc(grid, startCell, 63);
	// const a64 = astarCalc(grid, startCell, 64);
	// const a65 = astarCalc(grid, startCell, 65);
	// const a66 = astarCalc(grid, startCell, 66);
	// Result from above:
	//        63   64   65   66
	// Quick: 3587 3743 3847 4005
	// Astar: 3587 3743 3847 4003

	// let quick = quickCalc(bigGrid, startCell, 65, true); // 3847 (378 off square)
	// console.log(quick);
	let quick = quickCalc(bigGrid, startCell, 855, true); // 33853 for a 3x3 diamondgrid, 520197 for a 9x9
	// bigGrid.log();
	console.log(quick);

	return 0;
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
		// 		{
		// 			input: `...........
		// .....###.#.
		// .###.##..#.
		// ..#.#...#..
		// ....#.#....
		// .##..S####.
		// .##..#...#.
		// .......##..
		// .##.#.####.
		// .##..##.##.
		// ...........`,
		// 			extraArgs: [6],
		// 			expected: `16`,
		// 			expectedPart1: ``,
		// 		},
		// 		{
		// 			input: `...........
		// .....###.#.
		// .###.##..#.
		// ..#.#...#..
		// ....#.#....
		// .##..S####.
		// .##..#...#.
		// .......##..
		// .##.#.####.
		// .##..##.##.
		// ...........`,
		// 			extraArgs: [10],
		// 			expected: `50`,
		// 			expectedPart1: ``,
		// 		},
		// 		{
		// 			input: `...........
		// .....###.#.
		// .###.##..#.
		// ..#.#...#..
		// ....#.#....
		// .##..S####.
		// .##..#...#.
		// .......##..
		// .##.#.####.
		// .##..##.##.
		// ...........`,
		// 			extraArgs: [50],
		// 			expected: `1594`,
		// 			expectedPart1: ``,
		// 		},
		// 		{
		// 			input: `...........
		// .....###.#.
		// .###.##..#.
		// ..#.#...#..
		// ....#.#....
		// .##..S####.
		// .##..#...#.
		// .......##..
		// .##.#.####.
		// .##..##.##.
		// ...........`,
		// 			extraArgs: [100],
		// 			expected: `6536`,
		// 			expectedPart1: ``,
		// 		},
		// 		{
		// 			input: `...........
		// .....###.#.
		// .###.##..#.
		// ..#.#...#..
		// ....#.#....
		// .##..S####.
		// .##..#...#.
		// .......##..
		// .##.#.####.
		// .##..##.##.
		// ...........`,
		// 			extraArgs: [500],
		// 			expected: `167004`,
		// 			expectedPart1: ``,
		// 		},
		// 		{
		// 			input: `...........
		// .....###.#.
		// .###.##..#.
		// ..#.#...#..
		// ....#.#....
		// .##..S####.
		// .##..#...#.
		// .......##..
		// .##.#.####.
		// .##..##.##.
		// ...........`,
		// 			extraArgs: [1000],
		// 			expected: `668697`,
		// 			expectedPart1: ``,
		// 		},
		// 		{
		// 			input: `...........
		// .....###.#.
		// .###.##..#.
		// ..#.#...#..
		// ....#.#....
		// .##..S####.
		// .##..#...#.
		// .......##..
		// .##.#.####.
		// .##..##.##.
		// ...........`,
		// 			extraArgs: [5000],
		// 			expected: `16733044`,
		// 			expectedPart1: ``,
		// 		},
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
