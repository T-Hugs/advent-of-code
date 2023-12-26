import _, { repeat } from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";
import { Grid } from "../../../util/grid";

const YEAR = 2023;
const DAY = 14;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/14/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/14/data.txt
// problem url  : https://adventofcode.com/2023/day/14

async function p2023day14_part1(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input });

	let moved = false;

	// Bro, do you even while?
	do {
		moved = false;
		for (const rock of grid.getCells("O")) {
			const north = rock.north();
			if (north && north.value === ".") {
				rock.setValue(".");
				north.setValue("O");
				moved = true;
			}
		}
	} while (moved === true);

	return grid.getCells("O").reduce((p, c) => p + (c.grid.rowCount - c.position[0]), 0);
}

function cycle(grid: Grid) {
	for (const dir of ["north", "west", "south", "east"] as const) {
		while (true) {
			// Very inefficient
			let moved = false;
			for (const rock of grid.getCells("O")) {
				const adj = rock[dir]();
				if (adj && adj.value === ".") {
					rock.setValue(".");
					adj.setValue("O");
					moved = true;
				}
			}
			if (!moved) {
				break;
			}
		}
	}
}

async function p2023day14_part2(input: string, ...params: any[]) {
	const totalCycles = 1000000000;
	const grid = new Grid({ serialized: input });
	const memToIndex: Map<string, number> = new Map();
	const memToGrid: Grid[] = [];

	let nextGrid = grid;
	let i = 0;
	while (true) {
		const serialGrid = nextGrid.toString();
		const repeatedIndex = memToIndex.get(serialGrid);
		if (repeatedIndex) {
			const period = i - repeatedIndex;
			nextGrid = memToGrid[repeatedIndex + (totalCycles - repeatedIndex) % period];
			break;
		} else {
			memToIndex.set(serialGrid, i);
			memToGrid.push(nextGrid);
		}
		nextGrid = nextGrid.copyGrid();
		cycle(nextGrid);
		i++;
	}

	return nextGrid.getCells("O").reduce((p, c) => p + (c.grid.rowCount - c.position[0]), 0);
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `O....#....
O.OO#....#
.....##...
OO.#O....O
.O.....O#.
O.#..O.#.#
..O..#O..O
.......O..
#....###..
#OO..#....`,
			extraArgs: [],
			expected: `136`,
			expectedPart2: `64`,
		},
	];
	const part2tests: TestCase[] = [];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2023day14_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2023day14_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2023day14_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2023day14_part2(input));
	const part2After = performance.now();

	logSolution(14, 2023, part1Solution, part2Solution);

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
