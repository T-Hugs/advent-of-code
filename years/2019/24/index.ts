import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { Grid, Cell } from "../../../util/grid";
import { performance } from "perf_hooks";

const YEAR = 2019;
const DAY = 24;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2019/24/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2019/24/data.txt
// problem url  : https://adventofcode.com/2019/day/24

async function p2019day24_part1(input: string) {
	const grid = new Grid({ serialized: input });
	const seenLayouts = new Set();
	seenLayouts.add(grid.toString());
	while (true) {
		grid.batchUpdates();
		for (const cell of grid) {
			if (cell.value === "#") {
				if (cell.neighbors().filter(n => n.value === "#").length !== 1) {
					cell.setValue(".");
				}
			} else {
				const neighborBugs = cell.neighbors().filter(n => n.value === "#").length;
				if (neighborBugs === 1 || neighborBugs === 2) {
					cell.setValue("#");
				}
			}
		}
		grid.commit();
		const newGridStr = grid.toString();
		if (seenLayouts.has(newGridStr)) {
			let biodiv = 0;
			for (const cell of grid) {
				if (cell.value === "#") {
					biodiv += Math.pow(2, cell.index);
				}
			}
			return biodiv;
		}
		seenLayouts.add(newGridStr);
	}
}

async function p2019day24_part2(input: string, minutes: number = 200) {
	const zeroGrid = new Grid({ serialized: input });
	const grids: { [id: number]: Grid } = { 0: zeroGrid };
	let lowestGridWithBug = 0;
	let highestGridWithBug = 0;

	function ensureAdjacentGrids() {
		for (let i = lowestGridWithBug - 1; i <= highestGridWithBug + 1; ++i) {
			if (!grids[i]) {
				grids[i] = new Grid({ fillWith: ".", rowCount: zeroGrid.rowCount, colCount: zeroGrid.colCount });
			}
		}
	}

	function getNeighbors(cell: Cell, id: number) {
		const neighbors: (readonly [cell: Cell, gridId: number])[] = [];
		neighbors.push(
			...cell
				.neighbors()
				.filter(n => n.position[0] !== 2 || n.position[1] !== 2)
				.map(n => [n, id] as const)
		);
		if (grids[id - 1]) {
			if (cell.isNorthEdge()) {
				const northGridCell = grids[id - 1].getCell([1, 2]);
				if (northGridCell) {
					neighbors.push([northGridCell, id - 1]);
				}
			}
			if (cell.isEastEdge()) {
				const eastGridCell = grids[id - 1].getCell([2, 3]);
				if (eastGridCell) {
					neighbors.push([eastGridCell, id - 1]);
				}
			}
			if (cell.isSouthEdge()) {
				const southGridCell = grids[id - 1].getCell([3, 2]);
				if (southGridCell) {
					neighbors.push([southGridCell, id - 1]);
				}
			}
			if (cell.isWestEdge()) {
				const westGridCell = grids[id - 1].getCell([2, 1]);
				if (westGridCell) {
					neighbors.push([westGridCell, id - 1]);
				}
			}
		}
		if (grids[id + 1]) {
			if (cell.position[0] === 1 && cell.position[1] === 2) {
				neighbors.push(...grids[id + 1].getCells(c => c.isNorthEdge()).map(c => [c, id + 1] as const));
			}
			if (cell.position[0] === 2 && cell.position[1] === 3) {
				neighbors.push(...grids[id + 1].getCells(c => c.isEastEdge()).map(c => [c, id + 1] as const));
			}
			if (cell.position[0] === 3 && cell.position[1] === 2) {
				neighbors.push(...grids[id + 1].getCells(c => c.isSouthEdge()).map(c => [c, id + 1] as const));
			}
			if (cell.position[0] === 2 && cell.position[1] === 1) {
				neighbors.push(...grids[id + 1].getCells(c => c.isWestEdge()).map(c => [c, id + 1] as const));
			}
		}
		return neighbors;
	}

	for (const i of _.range(minutes)) {
		ensureAdjacentGrids();
		for (const _id of Object.keys(grids)) {
			const id = Number(_id);
			const grid = grids[id];
			grid.batchUpdates();
			
			for (const cell of grid) {
				if (cell.position[0] === 2 && cell.position[1] === 2) {
					continue;
				}
				const neighbors = getNeighbors(cell, id);

				// Life!
				if (cell.value === "#") {
					if (neighbors.filter(n => n[0].value === "#").length !== 1) {
						cell.setValue(".");
					}
				} else {
					const neighborBugs = neighbors.filter(n => n[0].value === "#").length;
					if (neighborBugs === 1 || neighborBugs === 2) {
						cell.setValue("#");
						lowestGridWithBug = Math.min(id, lowestGridWithBug);
						highestGridWithBug = Math.max(id, highestGridWithBug);
					}
				}
			}
		}
		for (const grid of Object.values(grids)) {
			grid.commit();
		}
	}

	let bugCount = 0;
	for (const grid of Object.values(grids)) {
		bugCount += Array.from(grid).filter(c => c.value === "#").length;
	}
	return bugCount;
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [{
		input: `....#
#..#.
#..##
..#..
#....`,
		expected: `99`
	}];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2019day24_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2019day24_part2(testCase.input, 10)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2019day24_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2019day24_part2(input, 200));
	const part2After = performance.now();

	logSolution(24, 2019, part1Solution, part2Solution);

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
