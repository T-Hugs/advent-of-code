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
const DAY = 10;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/10/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/10/data.txt
// problem url  : https://adventofcode.com/2023/day/10

function getConnectedCell(cell: Cell, from: Cell | undefined) {
	const north = cell.north();
	const west = cell.west();
	const south = cell.south();
	const east = cell.east();

	if (cell.value === "S") {
		if (north && !north.isEqual(from) && (north.value === "F" || north.value === "7" || north.value === "|")) {
			return north;
		}
		if (south && !south.isEqual(from) && (south.value === "J" || south.value === "L" || south.value === "|")) {
			return south;
		}
		if (west && !west.isEqual(from) && (west.value === "J" || west.value === "7" || west.value === "-")) {
			return west;
		}
		if (east && !east.isEqual(from) && (east.value === "F" || east.value === "L" || east.value === "-")) {
			return east;
		}
		throw new Error();
	} else {
		let conn1: Cell | undefined;
		let conn2: Cell | undefined;
		if (cell.value === "-") {
			conn1 = cell.east();
			conn2 = cell.west();
		} else if (cell.value === "|") {
			conn1 = cell.north();
			conn2 = cell.south();
		} else if (cell.value === "L") {
			conn1 = cell.north();
			conn2 = cell.east();
		} else if (cell.value === "F") {
			conn1 = cell.east();
			conn2 = cell.south();
		} else if (cell.value === "J") {
			conn1 = cell.north();
			conn2 = cell.west();
		} else if (cell.value === "7") {
			conn1 = cell.west();
			conn2 = cell.south();
		}
		if (!conn1 || !conn2) {
			throw new Error();
		}
		if (conn1?.isEqual(from)) {
			return conn2;
		} else {
			return conn1;
		}
	}
}

async function p2023day10_part1(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input });
	const start = grid.getCell("S");
	if (!start) {
		throw new Error();
	}
	const distances = new WeakMap<Cell, number>();
	let i = 0;
	distances.set(start, i++);

	let prev = start;
	let next: Cell = getConnectedCell(start, undefined);
	while (next.value !== "S") {
		const connected = getConnectedCell(next, prev);
		distances.set(connected, i++);
		prev = next;
		next = connected;
	}
	return i / 2;
}

function canEscape(cell: Cell, hdGrid: Grid) {
	const hdGridCell = hdGrid.getCell([cell.position[0] * 2 + 1, cell.position[1] * 2 + 1]);
	if (!hdGridCell) {
		throw new Error();
	}
	// @todo make this more efficient
	const { status, path } = aStar({
		start: hdGridCell,
		isEnd: cell => {
			return cell?.isEastEdge() || cell?.isNorthEdge() || cell?.isSouthEdge() || cell?.isWestEdge();
		},
		neighbor: cell => {
			const neighbors = cell.neighbors(false);
			return neighbors.filter(n => n.value === ".");
		},
		distance: () => 1,
		heuristic: () => 1,
	});
	return status === "success";
}

async function p2023day10_part2(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input });

	// Add a border of cells that we can assume are on the outside of the loop
	grid.editGrid({ top: 1, left: 1, right: 1, bottom: 1, fillWith: "." });

	const start = grid.getCell("S");
	if (!start) {
		throw new Error();
	}
	const distances = new WeakMap<Cell, number>();
	let i = 0;
	distances.set(start, i++);

	let prev = start;
	let next: Cell = getConnectedCell(start, undefined);
	const loopCells: Set<string> = new Set();
	loopCells.add(start.toString());
	loopCells.add(next.toString());
	while (next.value !== "S") {
		const connected = getConnectedCell(next, prev);
		distances.set(connected, i++);
		loopCells.add(connected.toString());
		prev = next;
		next = connected;
	}

	const otherCells: Cell[] = [];
	for (const cell of grid) {
		if (!loopCells.has(cell.toString())) {
			cell.setValue(".");
			otherCells.push(cell);
		}
	}

	const hdGrid = new Grid({ colCount: grid.colCount * 2, rowCount: grid.rowCount * 2 });
	for (const cell of grid) {
		hdGrid.setCell([cell.position[0] * 2 + 1, cell.position[1] * 2], ".");
		hdGrid.setCell([cell.position[0] * 2, cell.position[1] * 2 + 1], ".");
		hdGrid.setCell([cell.position[0] * 2, cell.position[1] * 2], ".");
		hdGrid.setCell([cell.position[0] * 2 + 1, cell.position[1] * 2 + 1], cell.value);
	}

	for (const cell of hdGrid) {
		const west = cell.west()?.value;
		const east = cell.east()?.value;
		const south = cell.south()?.value;
		const north = cell.north()?.value;
		if (
			((west === "-" || west === "S") && (east === "-" || east === "S" || east === "7" || east === "J")) ||
			((east === "-" || east === "S") && (west === "-" || west === "S" || west === "F" || west === "L")) ||
			(west === "L" && east === "J") ||
			(west === "F" && east === "7") ||
			(west === "L" && east === "7") ||
			(west === "F" && east === "J")
		) {
			cell.setValue("-");
		}
		if (
			((north === "|" || north === "S") && (south === "|" || south === "S" || south === "L" || south === "J")) ||
			((south === "|" || south === "S") && (north === "|" || north === "S" || north === "F" || north === "7")) ||
			(north === "F" && south === "L") ||
			(north === "7" && south === "J") ||
			(north === "7" && south === "L") ||
			(north === "F" && south === "J")
		) {
			cell.setValue("|");
		}
	}

	return otherCells.filter(c => !canEscape(c, hdGrid)).length;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `-L|F7
7S-7|
L|7||
-L-J|
L|-JF`,
			extraArgs: [],
			expected: `4`,
			expectedPart2: ``,
		},
		{
			input: `7-F7-
.FJ|7
SJLL7
|F--J
LJ.LJ`,
			extraArgs: [],
			expected: `8`,
			expectedPart2: ``,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `...........
.S-------7.
.|F-----7|.
.||.....||.
.||.....||.
.|L-7.F-J|.
.|..|.|..|.
.L--J.L--J.
...........`,
			extraArgs: [],
			expected: `4`,
			expectedPart1: ``,
		},
		{
			input: `.F----7F7F7F7F-7....
.|F--7||||||||FJ....
.||.FJ||||||||L7....
FJL7L7LJLJ||LJ.L-7..
L--J.L7...LJS7F-7L7.
....F-J..F7FJ|L7L7L7
....L7.F7||L7|.L7L7|
.....|FJLJ|FJ|F7|.LJ
....FJL-7.||.||||...
....L---J.LJ.LJLJ...`,
			extraArgs: [],
			expected: `8`,
			expectedPart1: ``,
		}, {
			input: `FF7FSF7F7F7F7F7F---7
L|LJ||||||||||||F--J
FL-7LJLJ||||||LJL-77
F--JF--7||LJLJ7F7FJ-
L---JF-JLJ.||-FJLJJ7
|F|F-JF---7F7-L7L|7|
|FFJF7L7F-JF7|JL---7
7-L-JL7||F7|L7F-7F7|
L.L7LFJ|||||FJL7||LJ
L7JLJL-JLJLJL--JLJ.L`,
			extraArgs: [],
			expected: `10`,
			expectedPart1: ``
		},
	];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2023day10_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2023day10_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2023day10_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2023day10_part2(input));
	const part2After = performance.now();

	logSolution(10, 2023, part1Solution, part2Solution);

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
