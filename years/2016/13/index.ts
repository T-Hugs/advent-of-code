import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import aStar from "a-star";

const YEAR = 2016;
const DAY = 13;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2016/13/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2016/13/data.txt
// problem url  : https://adventofcode.com/2016/day/13

async function p2016day13_part1(input: string) {
	const inNum = Number(input);
	function isWall(node: number[]) {
		const [x, y] = node;
		const first = x * x + 3 * x + 2 * x * y + y + y * y;
		const second = first + inNum;
		const bin = second.toString(2);
		const ones = bin.split("").filter(bit => bit === "1").length;
		return ones % 2 === 1;
	}
	const target = [31, 39];
	const path = aStar({
		start: [1, 1],
		isEnd: (node: [number, number]) => node[0] === target[0] && node[1] === target[1],
		neighbor: (node: [number, number]) => {
			const up = [node[0], node[1] - 1];
			const down = [node[0], node[1] + 1];
			const left = [node[0] - 1, node[1]];
			const right = [node[0] + 1, node[1]];
			return [up, down, left, right].filter(n => !isWall(n) && node[0] >= 0 && node[1] >= 0) as [number, number][];
		},
		heuristic: (node: [number, number]) => Math.abs(node[0] - target[0]) + Math.abs(node[1] - target[1]),
		distance: () => 1,
	});
	return path.path.length - 1;
}

async function p2016day13_part2(input: string) {
	const inNum = Number(input);
	function isWall(node: number[]) {
		const [x, y] = node;
		const first = x * x + 3 * x + 2 * x * y + y + y * y;
		const second = first + inNum;
		const bin = second.toString(2);
		const ones = bin.split("").filter(bit => bit === "1").length;
		return ones % 2 === 1;
	}
	const destinations: number[][] = [];
	for (let i = 0; i <= 51; ++i) {
		for (let j = 0; j <= i; ++j) {
			destinations.push([i - j, j])
		}
	}
	let canReach = 0;
	for (const destination of destinations) {
		if (isWall(destination)) {
			continue;
		}
		const path = aStar({
			start: [1, 1],
			isEnd: (node: [number, number]) => node[0] === destination[0] && node[1] === destination[1],
			neighbor: (node: [number, number]) => {
				const up = [node[0], node[1] - 1];
				const down = [node[0], node[1] + 1];
				const left = [node[0] - 1, node[1]];
				const right = [node[0] + 1, node[1]];
				return [up, down, left, right].filter(n => !isWall(n) && node[0] >= 0 && node[1] >= 0) as [number, number][];
			},
			heuristic: (node: [number, number]) => Math.abs(node[0] - destination[0]) + Math.abs(node[1] - destination[1]),
			distance: () => 1,
		});
		if (path.status !== "noPath" && path.path.length - 1 <= 50) {
			console.log(destination);
			canReach++;
		}
	}
	return canReach;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `10`,
			expected: `55`,
		},
	];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2016day13_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2016day13_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2016day13_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2016day13_part2(input));
	const part2After = performance.now();

	logSolution(13, 2016, part1Solution, part2Solution);

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
