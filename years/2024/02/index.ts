import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2024;
const DAY = 2;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2024/02/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2024/02/data.txt
// problem url  : https://adventofcode.com/2024/day/2

async function p2024day2_part1(input: string, ...params: any[]) {
	const lines = input.split("\n");
	const reports: number[][] = [];
	for (const line of lines) {
		reports.push(line.split(" ").map(Number));
	}

	let safe = 0;
	for (const report of reports) {
		let isSafe = true;
		let isNeg: boolean | undefined = undefined;
		for (let i = 0; i < report.length - 1; i++) {
			const delta = report[i + 1] - report[i];
			if (isNeg === undefined) {
				isNeg = delta < 0;
			} else {
				if (isNeg && delta > 0 || !isNeg && delta < 0) {
					isSafe = false;
					break;
				}
			}
			if (Math.abs(delta) > 3 || Math.abs(delta) === 0) {
				isSafe = false;
				break;
			}
		}
		if (isSafe) {
			safe++;
		}
	}
	return safe;
}

async function p2024day2_part2(input: string, ...params: any[]) {
	const lines = input.split("\n");
	const reports: number[][] = [];
	for (const line of lines) {
		reports.push(line.split(" ").map(Number));
	}

	let safe = 0;
	for (const report of reports) {
		let currentReport = [...report];
		for (let j = 0; j < report.length + 1; j++) {
			let isSafe = true;
			let isNeg: boolean | undefined = undefined;
			for (let i = 0; i < currentReport.length - 1; i++) {
				const delta = currentReport[i + 1] - currentReport[i];
				if (isNeg === undefined) {
					isNeg = delta < 0;
				} else {
					if (isNeg && delta > 0 || !isNeg && delta < 0) {
						isSafe = false;
						break;
					}
				}
				if (Math.abs(delta) > 3 || Math.abs(delta) === 0) {
					isSafe = false;
					break;
				}
			}
			if (isSafe) {
				safe++;
				break;
			}
			currentReport = [...report];
			currentReport.splice(j, 1);
		}
	}
	return safe;
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `7 6 4 2 1
1 2 7 8 9
9 7 6 2 1
1 3 2 4 5
8 6 4 4 1
1 3 6 7 9`,
		extraArgs: [],
		expected: `2`,
		expectedPart2: `4`,
	}];
	const part2tests: TestCase[] = [];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day2_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day2_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day2_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2024day2_part2(input));
	const part2After = performance.now();

	logSolution(2, 2024, part1Solution, part2Solution);

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
