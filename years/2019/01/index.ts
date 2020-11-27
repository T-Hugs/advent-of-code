import * as util from "../../../util/util";
import chalk from "chalk";
import * as LOGUTIL from "../../../util/log";
const { log, logSolution, trace } = LOGUTIL;

const YEAR = 2019;
const DAY = 1;
const DEBUG = false;
LOGUTIL.setDebug(DEBUG);

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2019/01/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2019/01/data.txt
// problem url  : https://adventofcode.com/2019/day/1

async function p2019day1_part1(input: string) {
	return String(input.split("\n").map(Number).reduce((p, c) => p + (Math.floor(c / 3) - 2), 0))
}

async function p2019day1_part2(input: string, part1Solution: string) {
	return "Not implemented";
}

async function run() {
	const input = await util.getInput(DAY, YEAR);

	const part1Solution = String(await p2019day1_part1(input));
	const part2Solution = String(await p2019day1_part2(input, part1Solution));

	logSolution(part1Solution, part2Solution);
}

run()
	.then(() => {
		process.exit();
	})
	.catch(error => {
		throw error;
	});
