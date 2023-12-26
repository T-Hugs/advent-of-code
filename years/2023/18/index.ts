import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";
import { CardinalDirection, Cell, Grid } from "../../../util/grid";

const YEAR = 2023;
const DAY = 18;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/18/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/18/data.txt
// problem url  : https://adventofcode.com/2023/day/18

const dirMap = { U: "north", D: "south", R: "east", L: "west" };

function countEnclosure(grid: Grid) {
	const perimeter = grid.getCells("#").length;
	let dotCell = grid.getCell(".");
	while (dotCell) {
		const cluster = dotCell.findCellCluster({
			allowDiagonal: false,
		});
		let isInside = true;
		for (const cell of cluster) {
			if (cell.isEdge()) {
				isInside = false;
				break;
			}
		}
		for (const cell of cluster) {
			cell.setValue(isInside ? "I" : "O");
		}
		dotCell = grid.getCell(".");
	}
	return perimeter + grid.getCells("I").length;
}

async function p2023day18_part1_orig(input: string, ...params: any[]) {
	const grid = new Grid({ rowCount: 10, colCount: 10, fillWith: "." });
	const lines = input.split("\n");
	let current = grid.getCell([0, 0])!;
	for (const line of lines) {
		const [dir, distSt, color] = line.split(" ");
		const dist = Number(distSt);
		for (let i = 0; i < dist; ++i) {
			current.setValue("#");
			const direction = dirMap[dir as keyof typeof dirMap] as CardinalDirection;
			current = current[direction](1, "expand") as Cell;
		}
	}
	grid.log();
	return countEnclosure(grid);
}

async function p2023day18_part1(input: string, ...params: any[]) {
	const lines = input.split("\n");
	let area = 0;
	let multiplier = 0;
	let perimeter = 0;
	for (const line of lines) {
		const [dir, distSt] = line.split(" ");
		const dist = Number(distSt);
		perimeter += dist;
		if (dir === "L") {
			multiplier -= dist;
		}
		if (dir === "R") {
			multiplier += dist;
		}
		if (dir === "D") {
			area += multiplier * dist;
		}
		if (dir === "U") {
			area -= multiplier * dist;
		}
	}
	return area + Math.floor(perimeter / 2) + 1; // 49897
}

async function p2023day18_part2(input: string, ...params: any[]) {
	const lines = input.split("\n");
	let area = 0;
	let multiplier = 0;
	let perimeter = 0;
	for (const line of lines) {
		const [, , color] = line.split(" ");
		const hex = color.slice(2, -1);
		const dirEnc = Number(hex.slice(-1));
		const distHex = hex.slice(0, -1);
		const dist = parseInt(distHex, 16);
		const dir = ["R", "D", "L", "U"][dirEnc];

		perimeter += dist;
		if (dir === "L") {
			multiplier -= dist;
		}
		if (dir === "R") {
			multiplier += dist;
		}
		if (dir === "D") {
			area += multiplier * dist;
		}
		if (dir === "U") {
			area -= multiplier * dist;
		}
	}
	return area + Math.floor(perimeter / 2) + 1;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `R 2 (#70c710)
D 2 (#0dc571)
R 2 (#5713f0)
D 2 (#d2c081)
L 2 (#59c680)
D 2 (#411b91)
L 2 (#8ceee2)
U 2 (#caa173)
L 2 (#1b58a2)
U 2 (#caa171)
R 2 (#7807d2)
U 2 (#aaaaa1)`,
			extraArgs: [],
			expected: `33`,
			expectedPart2: ``,
		},
		{
			input: `R 6 (#70c710)
D 5 (#0dc571)
L 2 (#5713f0)
D 2 (#d2c081)
R 2 (#59c680)
D 2 (#411b91)
L 5 (#8ceee2)
U 2 (#caa173)
L 1 (#1b58a2)
U 2 (#caa171)
R 2 (#7807d2)
U 3 (#a77fa3)
L 2 (#015232)
U 2 (#7a21e3)`,
			extraArgs: [],
			expected: `62`,
			expectedPart2: `952408144115`,
		},
	];
	const part2tests: TestCase[] = [];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2023day18_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2023day18_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2023day18_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2023day18_part2(input));
	const part2After = performance.now();

	logSolution(18, 2023, part1Solution, part2Solution);

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
