import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2021;
const DAY = 3;

// solution path: C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\03\index.ts
// data path    : C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\03\data.txt
// problem url  : https://adventofcode.com/2021/day/3

async function p2021day3_part1(input: string, ...params: any[]) {
	const lines = input.split("\n");
	// let lineCount = 0;
	// let oneCounts: number[] = [];
	// for (const line of lines) {
	// 	lineCount++;
	// 	let charNum = 0;
	// 	for (const char of line) {
	// 		if (char === "1") {
	// 			oneCounts[charNum] = (oneCounts[charNum] ?? 0) + 1;
	// 		}
	// 		charNum++;
	// 	}
	// }
	// let gamma = "";
	// let epsilon = "";
	// for (let i = 0; i < oneCounts.length; i++) {
	// 	if (oneCounts[i] > lineCount - oneCounts[i]) {
	// 		gamma += "1";
	// 		epsilon += "0";
	// 	} else {
	// 		epsilon += "1";
	// 		gamma += "0";
	// 	}
	// }
	const [gamma, epsilon] = getGammaEpsilon(lines);
	const gammaInt = parseInt(gamma, 2);
	const epsilonInt = parseInt(epsilon, 2);
	return gammaInt * epsilonInt;
}

function getGammaEpsilon(lines: string[]): [string, string] {
	let gamma = "";
	let epsilon = "";
	for (let i = 0; i < lines[0]. length; i++) {
		let oneCount = 0;
		let zeroCount = 0;
		for (const line of lines) {
			if (line[i] === "1") {
				oneCount++;
			} else {
				zeroCount++;
			}
		}
		if (oneCount >= lines.length - oneCount) {
			gamma += "1";
			epsilon += "0";
		} else {
			epsilon += "1";
			gamma += "0";
		}
	}
	return [gamma, epsilon];
}

async function p2021day3_part2(input: string, ...params: any[]) {
	const lines = input.split("\n");
	
	let potentialOGR = lines.slice();
	let potentialCSR = lines.slice();

	for (let i = 0; i < lines[0].length; ++i) {
		if (potentialOGR.length > 1) {
			const [gamma, _e] = getGammaEpsilon(potentialOGR);
			potentialOGR = potentialOGR.filter(line => line[i] === gamma[i]);
		}
		if (potentialCSR.length > 1) {
			const [_g, epsilon] = getGammaEpsilon(potentialCSR);
			potentialCSR = potentialCSR.filter(line => line[i] === epsilon[i]);
		}
	}

	return parseInt(potentialOGR[0], 2) * parseInt(potentialCSR[0], 2);
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `00100
11110
10110
10111
10101
01111
00111
11100
10000
11001
00010
01010`,
		extraArgs: [],
		expected: `198`
	}];
	const part2tests: TestCase[] = [{
		input: `00100
11110
10110
10111
10101
01111
00111
11100
10000
11001
00010
01010`,
		extraArgs: [],
		expected: `230`
	}];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2021day3_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2021day3_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2021day3_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2021day3_part2(input));
	const part2After = performance.now();

	logSolution(3, 2021, part1Solution, part2Solution);

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
