import _, { fill } from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import * as LOGUTIL from "../../../util/log";
import { performance } from "perf_hooks";
const { log, logSolution, trace } = LOGUTIL;

const YEAR = 2020;
const DAY = 17;
const DEBUG = true;
LOGUTIL.setDebug(DEBUG);

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2020/17/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2020/17/data.txt
// problem url  : https://adventofcode.com/2020/day/17

async function p2020day17_part1(input: string) {
	const orig: Obj<boolean> = {};
	const lines = input.split("\n");
	let y = 0;
	let z = 0;
	for (const line of lines) {
		let x = 0;
		for (const char of line) {
			if (char === "#") {
				orig[`${x},${y},${z}`] = true;
			}
			x++;
		}
		y++;
	}
	let filled = orig;
	const getNeighbors = (coord: string) => {
		const [x,y,z] = coord.split(",").map(Number);
		const neighbors: string[] = [];
		neighbors.push(`${x - 1},${y - 1},${z - 1}`);
		neighbors.push(`${x - 1},${y - 1},${z}`);
		neighbors.push(`${x - 1},${y - 1},${z + 1}`);
		neighbors.push(`${x - 1},${y},${z - 1}`);
		neighbors.push(`${x - 1},${y},${z}`)
		neighbors.push(`${x - 1},${y},${z + 1}`)
		neighbors.push(`${x - 1},${y + 1},${z - 1}`);
		neighbors.push(`${x - 1},${y + 1},${z}`);
		neighbors.push(`${x - 1},${y + 1},${z + 1}`);
		neighbors.push(`${x},${y - 1},${z - 1}`);
		neighbors.push(`${x},${y - 1},${z}`);
		neighbors.push(`${x},${y - 1},${z + 1}`);
		neighbors.push(`${x},${y},${z - 1}`);
		neighbors.push(`${x},${y},${z + 1}`)
		neighbors.push(`${x},${y + 1},${z - 1}`);
		neighbors.push(`${x},${y + 1},${z}`);
		neighbors.push(`${x},${y + 1},${z + 1}`);
		neighbors.push(`${x + 1},${y - 1},${z - 1}`);
		neighbors.push(`${x + 1},${y - 1},${z}`);
		neighbors.push(`${x + 1},${y - 1},${z + 1}`);
		neighbors.push(`${x + 1},${y},${z - 1}`);
		neighbors.push(`${x + 1},${y},${z}`)
		neighbors.push(`${x + 1},${y},${z + 1}`)
		neighbors.push(`${x + 1},${y + 1},${z - 1}`);
		neighbors.push(`${x + 1},${y + 1},${z}`);
		neighbors.push(`${x + 1},${y + 1},${z + 1}`);
		return neighbors;
	}
	const getXRange = (filled: Obj<boolean>) => {
		return [Math.min(...Object.keys(filled).map(k => k.split(",")[0]).map(Number)), Math.max(...Object.keys(filled).map(k => k.split(",")[0]).map(Number))];
	}
	const getYRange = (filled: Obj<boolean>) => {
		return [Math.min(...Object.keys(filled).map(k => k.split(",")[1]).map(Number)), Math.max(...Object.keys(filled).map(k => k.split(",")[1]).map(Number))];
	}
	const getZRange = (filled: Obj<boolean>) => {
		return [Math.min(...Object.keys(filled).map(k => k.split(",")[2]).map(Number)), Math.max(...Object.keys(filled).map(k => k.split(",")[2]).map(Number))];
	}


	for (let i = 0; i < 6; ++i) {
		const nextState: Obj<boolean> = {};
		const xRange = getXRange(filled);
		const yRange = getYRange(filled);
		const zRange = getZRange(filled);

		for (let x = xRange[0] - 1; x <= xRange[1] + 1; ++x) {
			for (let y = yRange[0] - 1; y <= yRange[1] + 1; ++y) {
				for (let z = zRange[0] - 1; z <= zRange[1] + 1; ++z) {
					const coord = `${x},${y},${z}`;
					const active = filled[coord];
					const activeNeighbors = getNeighbors(coord).filter(n => filled[n]).length;
					if (active) {
						if (activeNeighbors === 2 || activeNeighbors === 3) {
							nextState[coord] = true;
						}
					} else {
						if (activeNeighbors === 3) {
							nextState[coord] = true;
						}
					}
				}
			}
		}
		filled = nextState;
	}
	return Object.values(filled).filter(v => v === true).length;
}

// function _getNeighbors(coord: number[]): number[][] {
// 	const dimensions = coord.length;
// 	if (dimensions === 1) {
// 		return [[coord[0] - 1], [coord[0]], [coord[0] + 1]];
// 	} else {
// 		const ldNeighbors = _getNeighbors(coord.slice(1));
// 		const neighbors = [];
// 		for (const ld of ldNeighbors) {
// 			for (let i = -1; i <= 1; ++i) {
// 				ldNeighbors.unshift(i + coord[0]);
// 			}
// 		}
// 		return ldNeighbors;
// 	}
// }
// function getNeighbors(coord: string) {
// 	const neighbors = _getNeighbors(coord.split(",").map(Number)).map(n => n.join(","));
// 	return neighbors.filter(n => n !== coord);
// }

async function p2020day17_part2(input: string) {
	//const n = getNeighbors("0,0");
	const orig: Obj<boolean> = {};
	const lines = input.split("\n");
	let y = 0;
	let z = 0;
	let w = 0;
	for (const line of lines) {
		let x = 0;
		for (const char of line) {
			if (char === "#") {
				orig[`${w},${x},${y},${z}`] = true;
			}
			x++;
		}
		y++;
	}
	let filled = orig;
	const getNeighborsManual = (coord: string) => {
		const [w,x,y,z] = coord.split(",").map(Number);
		const neighbors: string[] = [];
		neighbors.push(`${w - 1},${x - 1},${y - 1},${z - 1}`);
		neighbors.push(`${w - 1},${x - 1},${y - 1},${z}`);
		neighbors.push(`${w - 1},${x - 1},${y - 1},${z + 1}`);
		neighbors.push(`${w - 1},${x - 1},${y},${z - 1}`);
		neighbors.push(`${w - 1},${x - 1},${y},${z}`)
		neighbors.push(`${w - 1},${x - 1},${y},${z + 1}`)
		neighbors.push(`${w - 1},${x - 1},${y + 1},${z - 1}`);
		neighbors.push(`${w - 1},${x - 1},${y + 1},${z}`);
		neighbors.push(`${w - 1},${x - 1},${y + 1},${z + 1}`);
		neighbors.push(`${w - 1},${x},${y - 1},${z - 1}`);
		neighbors.push(`${w - 1},${x},${y - 1},${z}`);
		neighbors.push(`${w - 1},${x},${y - 1},${z + 1}`);
		neighbors.push(`${w - 1},${x},${y},${z - 1}`);
		neighbors.push(`${w - 1},${x},${y},${z}`);
		neighbors.push(`${w - 1},${x},${y},${z + 1}`)
		neighbors.push(`${w - 1},${x},${y + 1},${z - 1}`);
		neighbors.push(`${w - 1},${x},${y + 1},${z}`);
		neighbors.push(`${w - 1},${x},${y + 1},${z + 1}`);
		neighbors.push(`${w - 1},${x + 1},${y - 1},${z - 1}`);
		neighbors.push(`${w - 1},${x + 1},${y - 1},${z}`);
		neighbors.push(`${w - 1},${x + 1},${y - 1},${z + 1}`);
		neighbors.push(`${w - 1},${x + 1},${y},${z - 1}`);
		neighbors.push(`${w - 1},${x + 1},${y},${z}`)
		neighbors.push(`${w - 1},${x + 1},${y},${z + 1}`)
		neighbors.push(`${w - 1},${x + 1},${y + 1},${z - 1}`);
		neighbors.push(`${w - 1},${x + 1},${y + 1},${z}`);
		neighbors.push(`${w - 1},${x + 1},${y + 1},${z + 1}`);

		neighbors.push(`${w},${x - 1},${y - 1},${z - 1}`);
		neighbors.push(`${w},${x - 1},${y - 1},${z}`);
		neighbors.push(`${w},${x - 1},${y - 1},${z + 1}`);
		neighbors.push(`${w},${x - 1},${y},${z - 1}`);
		neighbors.push(`${w},${x - 1},${y},${z}`)
		neighbors.push(`${w},${x - 1},${y},${z + 1}`)
		neighbors.push(`${w},${x - 1},${y + 1},${z - 1}`);
		neighbors.push(`${w},${x - 1},${y + 1},${z}`);
		neighbors.push(`${w},${x - 1},${y + 1},${z + 1}`);
		neighbors.push(`${w},${x},${y - 1},${z - 1}`);
		neighbors.push(`${w},${x},${y - 1},${z}`);
		neighbors.push(`${w},${x},${y - 1},${z + 1}`);
		neighbors.push(`${w},${x},${y},${z - 1}`);
		neighbors.push(`${w},${x},${y},${z + 1}`)
		neighbors.push(`${w},${x},${y + 1},${z - 1}`);
		neighbors.push(`${w},${x},${y + 1},${z}`);
		neighbors.push(`${w},${x},${y + 1},${z + 1}`);
		neighbors.push(`${w},${x + 1},${y - 1},${z - 1}`);
		neighbors.push(`${w},${x + 1},${y - 1},${z}`);
		neighbors.push(`${w},${x + 1},${y - 1},${z + 1}`);
		neighbors.push(`${w},${x + 1},${y},${z - 1}`);
		neighbors.push(`${w},${x + 1},${y},${z}`)
		neighbors.push(`${w},${x + 1},${y},${z + 1}`)
		neighbors.push(`${w},${x + 1},${y + 1},${z - 1}`);
		neighbors.push(`${w},${x + 1},${y + 1},${z}`);
		neighbors.push(`${w},${x + 1},${y + 1},${z + 1}`);

		neighbors.push(`${w + 1},${x - 1},${y - 1},${z - 1}`);
		neighbors.push(`${w + 1},${x - 1},${y - 1},${z}`);
		neighbors.push(`${w + 1},${x - 1},${y - 1},${z + 1}`);
		neighbors.push(`${w + 1},${x - 1},${y},${z - 1}`);
		neighbors.push(`${w + 1},${x - 1},${y},${z}`)
		neighbors.push(`${w + 1},${x - 1},${y},${z + 1}`)
		neighbors.push(`${w + 1},${x - 1},${y + 1},${z - 1}`);
		neighbors.push(`${w + 1},${x - 1},${y + 1},${z}`);
		neighbors.push(`${w + 1},${x - 1},${y + 1},${z + 1}`);
		neighbors.push(`${w + 1},${x},${y - 1},${z - 1}`);
		neighbors.push(`${w + 1},${x},${y - 1},${z}`);
		neighbors.push(`${w + 1},${x},${y - 1},${z + 1}`);
		neighbors.push(`${w + 1},${x},${y},${z - 1}`);
		neighbors.push(`${w + 1},${x},${y},${z}`);
		neighbors.push(`${w + 1},${x},${y},${z + 1}`)
		neighbors.push(`${w + 1},${x},${y + 1},${z - 1}`);
		neighbors.push(`${w + 1},${x},${y + 1},${z}`);
		neighbors.push(`${w + 1},${x},${y + 1},${z + 1}`);
		neighbors.push(`${w + 1},${x + 1},${y - 1},${z - 1}`);
		neighbors.push(`${w + 1},${x + 1},${y - 1},${z}`);
		neighbors.push(`${w + 1},${x + 1},${y - 1},${z + 1}`);
		neighbors.push(`${w + 1},${x + 1},${y},${z - 1}`);
		neighbors.push(`${w + 1},${x + 1},${y},${z}`)
		neighbors.push(`${w + 1},${x + 1},${y},${z + 1}`)
		neighbors.push(`${w + 1},${x + 1},${y + 1},${z - 1}`);
		neighbors.push(`${w + 1},${x + 1},${y + 1},${z}`);
		neighbors.push(`${w + 1},${x + 1},${y + 1},${z + 1}`);
		return neighbors;
	}
	const getXRange = (filled: Obj<boolean>) => {
		return [Math.min(...Object.keys(filled).map(k => k.split(",")[1]).map(Number)), Math.max(...Object.keys(filled).map(k => k.split(",")[1]).map(Number))];
	}
	const getYRange = (filled: Obj<boolean>) => {
		return [Math.min(...Object.keys(filled).map(k => k.split(",")[2]).map(Number)), Math.max(...Object.keys(filled).map(k => k.split(",")[2]).map(Number))];
	}
	const getZRange = (filled: Obj<boolean>) => {
		return [Math.min(...Object.keys(filled).map(k => k.split(",")[3]).map(Number)), Math.max(...Object.keys(filled).map(k => k.split(",")[3]).map(Number))];
	}
	const getWRange = (filled: Obj<boolean>) => {
		return [Math.min(...Object.keys(filled).map(k => k.split(",")[0]).map(Number)), Math.max(...Object.keys(filled).map(k => k.split(",")[0]).map(Number))];
	}


	for (let i = 0; i < 6; ++i) {
		const nextState: Obj<boolean> = {};
		const xRange = getXRange(filled);
		const yRange = getYRange(filled);
		const zRange = getZRange(filled);
		const wRange = getZRange(filled);

		for (let x = xRange[0] - 1; x <= xRange[1] + 1; ++x) {
			for (let y = yRange[0] - 1; y <= yRange[1] + 1; ++y) {
				for (let z = zRange[0] - 1; z <= zRange[1] + 1; ++z) {
					for (let w = wRange[0] - 1; w <= wRange[1] + 1; ++w) {
						const coord = `${w},${x},${y},${z}`;
						const active = filled[coord];
						const activeNeighbors = getNeighborsManual(coord).filter(n => filled[n]).length;
						if (active) {
							if (activeNeighbors === 2 || activeNeighbors === 3) {
								nextState[coord] = true;
							}
						} else {
							if (activeNeighbors === 3) {
								nextState[coord] = true;
							}
						}
					}
				}
			}
		}
		filled = nextState;
	}
	return Object.values(filled).filter(v => v === true).length;
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `.#.
..#
###`,
		expected: `112`
	}];
	const part2tests: TestCase[] = [{
		input: `.#.
..#
###`,
		expected: `848`
	}];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2020day17_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2020day17_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2020day17_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2020day17_part2(input));
	const part2After = performance.now();
	
	logSolution(17, 2020, part1Solution, part2Solution);

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
