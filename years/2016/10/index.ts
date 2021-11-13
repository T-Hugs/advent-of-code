import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2016;
const DAY = 10;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2016/10/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2016/10/data.txt
// problem url  : https://adventofcode.com/2016/day/10

async function p2016day10_part1(input: string) {
	const lines = input.split("\n");
	const locations: Obj<number[]> = {};
	while (true) {
		let brk = true;
		for (const line of lines) {
			if (line.startsWith("value")) {
				const [val, dest] = /(\d+) goes to (.*)/.exec(line)!.slice(1);
				if (!locations[dest]) {
					locations[dest] = [];
				}
				locations[dest].push(Number(val));
				_.remove(lines, l => l === line);
				brk = false;
				break;
			} else {
				const [source, lowDest, hiDest] = /(bot \d+) gives low to (.*?) and high to (.*)/.exec(line)!.slice(1);
				if (locations[source] && locations[source].length === 2) {
					const low = Math.min(...locations[source]);
					const high = Math.max(...locations[source]);
					if (!locations[lowDest]) {
						locations[lowDest] = [];
					}
					if (!locations[hiDest]) {
						locations[hiDest] = [];
					}
					if (low === 17 && high === 61) {
						return source.substr(4);
					}
					locations[lowDest].push(low);
					locations[hiDest].push(high);
					_.remove(lines, l => l === line);
					brk = false;
					break;
				}
			}
		}
		if (brk) {
			break;
		}
	}
	console.log("done?");
}

async function p2016day10_part2(input: string) {
	const lines = input.split("\n");
	const locations: Obj<number[]> = {};
	while (true) {
		let brk = true;
		for (const line of lines) {
			if (line.startsWith("value")) {
				const [val, dest] = /(\d+) goes to (.*)/.exec(line)!.slice(1);
				if (!locations[dest]) {
					locations[dest] = [];
				}
				locations[dest].push(Number(val));
				_.remove(lines, l => l === line);
				brk = false;
				break;
			} else {
				const [source, lowDest, hiDest] = /(bot \d+) gives low to (.*?) and high to (.*)/.exec(line)!.slice(1);
				if (locations[source] && locations[source].length === 2) {
					const low = Math.min(...locations[source]);
					const high = Math.max(...locations[source]);
					if (!locations[lowDest]) {
						locations[lowDest] = [];
					}
					if (!locations[hiDest]) {
						locations[hiDest] = [];
					}
					locations[lowDest].push(low);
					locations[hiDest].push(high);
					_.remove(lines, l => l === line);
					brk = false;
					break;
				}
			}
		}
		if (brk) {
			break;
		}
	}
	
	return locations["output 0"][0] * locations["output 1"][0] * locations["output 2"][0];
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2016day10_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2016day10_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2016day10_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2016day10_part2(input));
	const part2After = performance.now();

	logSolution(10, 2016, part1Solution, part2Solution);

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
