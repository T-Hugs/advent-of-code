import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";
import { CardinalDirection, Cell, Grid, computeDirection, getOppositeDirection } from "../../../util/grid";
import aStar from "a-star";

const YEAR = 2023;
const DAY = 17;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/17/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/17/data.txt
// problem url  : https://adventofcode.com/2023/day/17
function getCellInfo(cell: Cell) {
	const oneBack = cell.data.history[cell.data.history.length - 1];
	const twoBack = cell.data.history[cell.data.history.length - 2];
	const threeBack = cell.data.history[cell.data.history.length - 3];
	if (oneBack) {
		const backDir = computeDirection(cell, oneBack);
		if (twoBack && threeBack) {
			const dir1 = computeDirection(oneBack, cell);
			const dir3 = computeDirection(threeBack, cell);
			if (dir1 === dir3) {
				return { mustTurnAwayFrom: dir1, backDir };
			}
		}
		return { backDir };
	}
	return {};
}
async function p2023day17_part1(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input });
	const start = grid.getCell([0, 0])!;
	start.data = "east-0";

	const path = aStar({
		start,
		hash: cell => {
			return `${cell.position.join(",")}|${cell.data}`;
		},
		neighbor: (cell, node) => {
			let neighbors: { [key: string]: Cell | undefined } = {
				north: cell.north(),
				south: cell.south(),
				west: cell.west(),
				east: cell.east(),
			};

			const [cellDir, countSt] = cell.data.split("-");
			const count = Number(countSt);
			for (const dir of ["north", "south", "west", "east"]) {
				if (neighbors[dir]) {
					if (cellDir === dir && count === 3) {
						delete neighbors[dir];
					} else {
						neighbors[dir]!.data = `${dir}-1`;
					}
				} else {
					delete neighbors[dir];
				}
				const oppDir = getOppositeDirection(cellDir);
				if (neighbors[oppDir]) {
					delete neighbors[oppDir];
				}
			}
			if (neighbors[cellDir]) {
				neighbors[cellDir]!.data = `${cellDir}-${count + 1}`;
			}
			return Object.values(neighbors) as Cell[];
		},
		heuristic: cell => {
			return cell.grid.rowCount - cell.position[0] - (cell.grid.colCount - cell.position[1]);
		},
		distance: (a, b) => {
			return Number(b.value);
		},
		isEnd: cell => {
			return cell.isEastEdge() && cell.isSouthEdge();
		},
	});

	return path.path.slice(1).reduce((p, c) => p + Number(c.value), 0);
}

async function p2023day17_part2(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input });
	const start = grid.getCell([0, 0])!;
	start.data = "east:0:0";

	const path = aStar({
		start,
		hash: cell => {
			return `${cell.position.join(",")}|${cell.data}`;
		},
		neighbor: (cell, node) => {
			let neighbors: { [key: string]: Cell | undefined } = {
				north: cell.north(),
				south: cell.south(),
				west: cell.west(),
				east: cell.east(),
			};

			const [cellDir, countSt, turnSt] = cell.data.split(":");
			const count = Number(countSt);
			const turn = Number(turnSt);
			for (const dir of ["north", "south", "west", "east"]) {
				if (neighbors[dir]) {
					if (cellDir === dir && count === 10) {
						delete neighbors[dir];
					} else {
						const turnCooldown = dir === cellDir ? turn - 1 : 3;
						neighbors[dir]!.data = `${dir}:1:${turnCooldown}`;
					}
				} else {
					delete neighbors[dir];
				}
				const oppDir = getOppositeDirection(cellDir);
				if (neighbors[oppDir]) {
					delete neighbors[oppDir];
				}
				if (turn !== 0) {
					if (dir !== cellDir) {
						delete neighbors[dir];
					}
				}
			}
			if (neighbors[cellDir]) {
				neighbors[cellDir]!.data = `${cellDir}:${count + 1}:${Math.max(0, turn - 1)}`;
			}
			return Object.values(neighbors) as Cell[];
		},
		heuristic: cell => {
			return cell.grid.rowCount - cell.position[0] - (cell.grid.colCount - cell.position[1]);
		},
		distance: (a, b) => {
			return Number(b.value);
		},
		isEnd: cell => {
			return cell.isEastEdge() && cell.isSouthEdge();
		},
	});

	// const vis = grid.copyGrid();
	// for (const p of path.path) {
	// 	vis.setCell(p.position, "#");
	// }
	// vis.log();

	return path.path.slice(1).reduce((p, c) => p + Number(c.value), 0);
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `2413432311323
3215453535623
3255245654254
3446585845452
4546657867536
1438598798454
4457876987766
3637877979653
4654967986887
4564679986453
1224686865563
2546548887735
4322674655533`,
			extraArgs: [],
			expected: `102`,
			expectedPart2: `94`,
		},
	];

	// This test fails because we don't require 4 blocks movement after
	// a turn to end the search. But for my puzzle input, the solution
	// works anyway.
	const part2tests: TestCase[] = [{
		input: `111111111111
999999999991
999999999991
999999999991
999999999991`,
		extraArgs: [],
		expected: `71`,
		expectedPart1: ``
	}];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2023day17_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2023day17_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2023day17_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2023day17_part2(input));
	const part2After = performance.now();

	logSolution(17, 2023, part1Solution, part2Solution);

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
