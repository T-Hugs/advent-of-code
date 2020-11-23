import * as util from "../../../util/util.js";
import chalk from "chalk";
import * as LOGUTIL from "../../../util/log.js";
const { log, logGrid, logSolution, trace } = LOGUTIL;

const YEAR = 2016;
const DAY = 11;
const DEBUG = false;
LOGUTIL.setDebug(DEBUG);

// solution path: /Users/trevorsg/t-hugs/aoc-2020/years/2016/11/index.ts
// data path    : /Users/trevorsg/t-hugs/aoc-2020/years/2016/11/data.txt
// problem url  : https://adventofcode.com/2016/day/11

async function p2016day11_part1(input: string) {
	return "Not implemented";
}

async function p2016day11_part2(input: string, part1Solution: string) {
	return "Not implemented";
}

async function run() {
	const input = await util.getInput(DAY, YEAR);

	const part1Solution = String(await p2016day11_part1(input));
	const part2Solution = String(await p2016day11_part2(input, part1Solution));

	logSolution(part1Solution, part2Solution);
}

run()
	.then(() => {
		process.exit();
	})
	.catch(error => {
		throw error;
	});
