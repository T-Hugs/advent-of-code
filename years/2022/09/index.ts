import _, { head } from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { Cell, Grid, GridPos } from "../../../util/grid";

const YEAR = 2022;
const DAY = 9;

// solution path: C:\Users\trgau\dev\t-hugs\advent-of-code\years\2022\09\index.ts
// data path    : C:\Users\trgau\dev\t-hugs\advent-of-code\years\2022\09\data.txt
// problem url  : https://adventofcode.com/2022/day/9

async function p2022day9_part1(input: string, ...params: any[]) {
	const grid = new Grid({ colCount: 1, rowCount: 1, fillWith: "." });

	let headCell = grid.getCell([0, 0]);
	let tailCell = grid.getCell([0, 0], true);
	const lines = input.split("\n");
	for (const line of lines) {
		const [dir, valStr] = line.split(" ");
		const val = Number(valStr);

		for (let i = 0; i < val; ++i) {
			tailCell?.setValue("#");
			if (dir === "U") {
				headCell = headCell?.north(1, "expand", { updateTracking: true });
			}
			if (dir === "D") {
				headCell = headCell?.south(1, "expand", { updateTracking: true });
			}
			if (dir === "L") {
				headCell = headCell?.west(1, "expand", { updateTracking: true });
			}
			if (dir === "R") {
				headCell = headCell?.east(1, "expand", { updateTracking: true });
			}
			if (headCell && tailCell) {
				const headNeighbors = headCell?.neighbors(true);
				if (!headNeighbors.some(n => n.isEqual(tailCell))) {
					const dx = headCell.position[1] - tailCell.position[1];
					const dy = headCell.position[0] - tailCell.position[0];
					if (dx !== 0) {
						tailCell = tailCell.repeatMovements([[util.clamp(dy, -1, 1), util.clamp(dx, -1, 1)]]);
					}
				}
			} else {
				throw new Error("Catastrophic error");
			}
		}
	}
	return grid.getCells(c => c.value === "#").length;
}

async function p2022day9_part2(input: string, ...params: any[]) {
	const knotCount = 10;
	const grid = new Grid({ colCount: params[0] ?? 1, rowCount: params[1] ?? 1, fillWith: "." });
	const knots: Cell[] = new Array(knotCount)
		.fill(undefined)
		.map((_, i) => grid.getCell([params[2] ?? 0, params[3] ?? 0], true)!);
	const visited = new Set<Cell>();
	const knotMap: Map<Cell, Set<string>> = new Map();

	knotMap.set(
		knots[0]!,
		// {H, 1, 2, 3, 4, 5, 6, 7, 8, 9}
		new Set(["H", ...[...new Array(knotCount).keys()].map(k => String(k)).slice(1)])
	);

	const lines = input.split("\n");
	for (const line of lines) {
		const [dir, valStr] = line.split(" ");
		const val = Number(valStr);

		for (let i = 0; i < val; ++i) {
			knotMap.get(knots[0])!.delete("H");
			if (knotMap.get(knots[0])!.size === 0) {
				knotMap.delete(knots[0]);
			}
			if (dir === "U") {
				knots[0] = knots[0]?.north(1, "expand")!;
			}
			if (dir === "D") {
				knots[0] = knots[0]?.south(1, "expand")!;
			}
			if (dir === "L") {
				knots[0] = knots[0]?.west(1, "expand")!;
			}
			if (dir === "R") {
				knots[0] = knots[0]?.east(1, "expand")!;
			}
			if (!knotMap.has(knots[0])) {
				knotMap.set(knots[0], new Set());
			}
			grid.trackCell(knots[0]);
			knotMap.get(knots[0])!.add("H");
			for (let i = 1; i < knots.length; ++i) {
				const headCell = knots[i - 1];
				let tailCell = knots[i];
				if (headCell && tailCell) {
					const headNeighbors = headCell?.neighbors(true, true);
					if (!headNeighbors.some(n => n.isEqual(tailCell))) {
						const dx = headCell.position[1] - tailCell.position[1];
						const dy = headCell.position[0] - tailCell.position[0];
						if (dx !== 0 || dy !== 0) {
							knotMap.get(knots[i])!.delete(String(i));
							if (knotMap.get(knots[i])!.size === 0) {
								knotMap.delete(knots[i]);
							}

							tailCell = tailCell.repeatMovements([[util.clamp(dy, -1, 1), util.clamp(dx, -1, 1)]])!;
							knots[i] = tailCell;
							grid.trackCell(tailCell);
							if (!knotMap.has(knots[i])) {
								knotMap.set(knots[i], new Set());
							}
							knotMap.get(knots[i])!.add(String(i));
						}
						if (!tailCell) {
							throw new Error("Another catastrophe!");
						}
					}
				}
			}
			visited.add(knots[knots.length - 1]);
		}
		// Log the positions of knots
		// log(line);
		// grid.log(false, c => {
		// 	if (knotMap.has(c)) {
		// 		return [...knotMap.get(c)!].sort((a, b) => Number(a) - Number(b))[0];
		// 	}
		// 	return c.value;
		// });
	}
	// Log the cells visited by the tail knot
	// grid.log(false, c => {
	// 	if (visited.has(c)) {
	// 		return "#";
	// 	}
	// 	return ".";
	// });
	return visited.size;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `R 4
U 4
L 3
D 1
R 4
D 1
L 5
R 2`,
			extraArgs: [],
			expected: `13`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `R 4
U 4
L 3
D 1
R 4
D 1
L 5
R 2`,
			extraArgs: [],
			expected: `1`,
		},
		{
			input: `R 5
U 8
L 8
D 3
R 17
D 10
L 25
U 20`,
			extraArgs: [26, 21, 15, 11],
			expected: `36`,
		},
	];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2022day9_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2022day9_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2022day9_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2022day9_part2(input));
	const part2After = performance.now();

	logSolution(9, 2022, part1Solution, part2Solution);

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
