import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2023;
const DAY = 6;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/06/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/06/data.txt
// problem url  : https://adventofcode.com/2023/day/6

async function p2023day6_part1(input: string, ...params: any[]) {
	const [timesStr, distanceStr] = input.split("\n");
	const times = timesStr
		.split(":")[1]
		.trim()
		.split(" ")
		.filter(Boolean)
		.map(x => Number(x.trim()));
	const distances = distanceStr
		.split(":")[1]
		.trim()
		.split(" ")
		.filter(Boolean)
		.map(x => Number(x.trim()));

	let product = 1;
	for (let i = 0; i < times.length; ++i) {
		const time = times[i];
		const distance = distances[i];

		let wins = 0;
		for (let j = 0; j <= time; ++j) {
			const buttonTime = j;
			const moveTime = time - j;
			const trialDistance = moveTime * buttonTime;
			if (trialDistance > distance) {
				wins++;
			}
		}
		product *= wins;
	}
	return product;
}

async function p2023day6_part2(input: string, ...params: any[]) {
	const [timeStr, distanceStr] = input.split("\n");
	const time = Number(timeStr.split(":")[1].trim().split(" ").filter(Boolean).join(""));
	const distance = Number(distanceStr.split(":")[1].trim().split(" ").filter(Boolean).join(""));

	// d = (t-b) * b
	// d = -b^2 + bt
	// 234102711571236 = -b^2 + 38677673b
	// -b^2 + 38677673b - 234102711571236 = 0
	// -x^2 + 38677673x - 234102711571236 = 0
	// x = -b + sqrt(b^2 - 4ac) / 2a

	// ex: 0 = -x^2 + 71530x - 940200

	const root1 = (-time + Math.sqrt(Math.pow(time, 2) - 4 * -1 * -distance)) / (2 * -1);
	const root2 = (-time - Math.sqrt(Math.pow(time, 2) - 4 * -1 * -distance)) / (2 * -1);

	const firstWin = Math.ceil(root1);
	const lastWin = Math.floor(root2);
	return lastWin - firstWin + 1;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `Time:      7  15   30
Distance:  9  40  200`,
			extraArgs: [],
			expected: `288`,
			expectedPart2: `71503`,
		},
	];
	const part2tests: TestCase[] = [];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2023day6_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2023day6_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2023day6_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2023day6_part2(input));
	const part2After = performance.now();

	logSolution(6, 2023, part1Solution, part2Solution);

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
