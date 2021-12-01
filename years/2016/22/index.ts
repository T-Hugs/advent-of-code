import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2016;
const DAY = 22;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2016/22/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2016/22/data.txt
// problem url  : https://adventofcode.com/2016/day/22

type Node = {
	x: number;
	y: number;
	size: number;
	used: number;
	avail: number;
}

async function p2016day22_part1(input: string) {
	const lines = input.split(/\r?\n/);
	const nodes: Node[][] = [];
	for (const line of lines.slice(2)) {
		const words = line.split(/\s+/);
		const noJunk = words[0].substr(16);
		const [_x, _y] = noJunk.split("-");
		const x = parseInt(_x, 10);
		const y = parseInt(_y.substr(1), 10);
		const size = parseInt(words[1].slice(0, -1), 10);
		const used = parseInt(words[2].slice(0, -1), 10);
		const avail = parseInt(words[3].slice(0, -1), 10);
		const node: Node = {x, y, size, used, avail};
		if (!nodes[x]) {
			nodes[x] = [];
		}
		nodes[x][y] = node;
	}

	let viablePairs = 0;
	for (let i = 0; i < nodes.length; ++i) {
		for (let j = 0; j < nodes[i].length; ++j) {
			let k = i;
			let l = j + 1;
			if (j >= nodes[i].length) {
				k++;
				l = 0;
			}
			for (; k < nodes.length; ++k) {
				for (; l < nodes[k].length; ++l) {
					const nodeA = nodes[i][j];
					const nodeB = nodes[k][l];
					if (nodeA.used !== 0 && nodeA.used <= nodeB.avail || nodeB.used !== 0 && nodeB.used <= nodeA.avail) {
						viablePairs += 2;
					}
				}
			}
		}
	}
	return viablePairs;
}

async function p2016day22_part2(input: string) {
	return "Not implemented";
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2016day22_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2016day22_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2016day22_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2016day22_part2(input));
	const part2After = performance.now();

	logSolution(22, 2016, part1Solution, part2Solution);

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
