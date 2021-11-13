import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { Grid } from "../../../util/grid";

const YEAR = 2016;
const DAY = 8;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2016/08/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2016/08/data.txt
// problem url  : https://adventofcode.com/2016/day/8

async function p2016day8_part1(input: string) {
	const grid = new Grid({ rowCount: 6, colCount: 50, fillWith: "." });
	const lines = input.split("\n");
	for (const line of lines) {
		const words = line.split(" ");
		const inst = words[0];
		if (inst === "rect") {
			const [width, height] = words[1].split("x").map(Number);
			for (const i of _.range(height)) {
				for (const j of _.range(width)) {
					grid.setCell([i, j], "#");
				}
			}
		} else if (inst === "rotate") {
			const rowOrCol = Number(words[2].substr(2));
			const shiftBy = Number(words[4]);
			grid.batchUpdates();
			if (words[1] === "row") {
				for (const i of _.range(grid.colCount)) {
					const cell = grid.getCell([rowOrCol, i])!;
					cell.setValue(cell.west(shiftBy, "wrap")!.value);
				}
			} else {
				for (const i of _.range(grid.rowCount)) {
					const cell = grid.getCell([i, rowOrCol])!;
					cell.setValue(cell.north(shiftBy, "wrap")!.value);
				}
			}
			grid.commit();
		}
	}
	// grid.log();
	return grid.getCells(c => c.value === "#").length;
}

async function p2016day8_part2(input: string) {
	const grid = new Grid({ rowCount: 6, colCount: 50, fillWith: "." });
	const lines = input.split("\n");
	for (const line of lines) {
		const words = line.split(" ");
		const inst = words[0];
		if (inst === "rect") {
			const [width, height] = words[1].split("x").map(Number);
			for (const i of _.range(height)) {
				for (const j of _.range(width)) {
					grid.setCell([i, j], "#");
				}
			}
		} else if (inst === "rotate") {
			const rowOrCol = Number(words[2].substr(2));
			const shiftBy = Number(words[4]);
			grid.batchUpdates();
			if (words[1] === "row") {
				for (const i of _.range(grid.colCount)) {
					const cell = grid.getCell([rowOrCol, i])!;
					cell.setValue(cell.west(shiftBy, "wrap")!.value);
				}
			} else {
				for (const i of _.range(grid.rowCount)) {
					const cell = grid.getCell([i, rowOrCol])!;
					cell.setValue(cell.north(shiftBy, "wrap")!.value);
				}
			}
			grid.commit();
		}
	}
	// grid.log();

	// I would fill in the rest if I had samples of the rest of
	// the characters. Perhaps later I will go online to find
	// them. For now this will solve my input.
	const letters: Obj<string> = {
		"####.\n#....\n###..\n#....\n#....\n####.": "E",
		"####.\n#....\n###..\n#....\n#....\n#....": "F",
		"#...#\n#...#\n.#.#.\n..#..\n..#..\n..#..": "Y",
		"#..#.\n#.#..\n##...\n#.#..\n#.#..\n#..#.": "K",
		"###..\n#..#.\n#..#.\n###..\n#.#..\n#..#.": "R",
		".###.\n..#..\n..#..\n..#..\n..#..\n.###.": "I",
		"..##.\n...#.\n...#.\n...#.\n#..#.\n.##..": "J",
	};
	const letterWidth = 5;

	const letterCount = Math.floor(grid.colCount / letterWidth);
	let answer = "";
	for (let i = 0; i < letterCount; ++i) {
		const subGrid = grid.copyGrid({srcStartCol: i * letterWidth, srcColCount: letterWidth});
		const subGridStr = subGrid.toString();
		const letter = letters[subGridStr];
		answer += letter ?? "?";
	}

	return answer;
}
async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2016day8_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2016day8_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2016day8_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2016day8_part2(input));
	const part2After = performance.now();

	logSolution(8, 2016, part1Solution, part2Solution);

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
