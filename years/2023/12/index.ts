import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2023;
const DAY = 12;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/12/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/12/data.txt
// problem url  : https://adventofcode.com/2023/day/12

async function p2023day12_part1(input: string, ...params: any[]) {
	return input
		.split("\n")
		.map(l => l.split(" "))
		.reduce((p, [rec, run]) => p + countVariations(rec, run.split(",").map(Number)), 0);
}

const cache: Map<string, number> = new Map();
function countVariations(rec: string, runs: number[]): number {
	const cacheKey = rec + ":" + runs.join(",");
	if (!cache.has(cacheKey)) {
		// so many base cases...
		if (runs.length === 0) {
			if (/^[.?]*$/.test(rec)) {
				cache.set(cacheKey, 1);
				return 1;
			} else {
				cache.set(cacheKey, 0);
				return 0;
			}
		}
		// number of substrings that contain only # and ? but at least one #.
		const hashGroupCount = [...rec.matchAll(/(?=\?*#)[?#]+/g)].length;
		if (hashGroupCount > runs.length) {
			cache.set(cacheKey, 0);
			return 0;
		}
		const runSum = runs.reduce((a, b) => a + b);
		if (rec.length < runSum + (runs.length - 1)) {
			cache.set(cacheKey, 0);
			return 0;
		}
		// There is a hash run longer than we have a record for
		const hashRuns = [...rec.matchAll(/#+/g)].sort((a, b) => b[0].length - a[0].length);
		const hashRunLengths = hashRuns.map(r => r[0].length);
		const longestHashRunLength = hashRunLengths[0];

		// Sorted runs, longest to shortest
		const sortedRuns = [...runs].sort((a, b) => b - a);
		if (longestHashRunLength > sortedRuns[0]) {
			cache.set(cacheKey, 0);
			return 0;
		}
		// If the total hash count is higher than the sum of all records
		const totalHashCount = [...rec.matchAll(/#/g)].length;
		if (totalHashCount > runSum) {
			cache.set(cacheKey, 0);
			return 0;
		}
		// If the longest possible run is shorter than the shortest record
		const hashQuestionRuns = [...rec.matchAll(/[#?]+/g)].sort((a, b) => b[0].length - a[0].length);
		const hashQuestionRunLengths = hashQuestionRuns.map(r => r[0].length);
		const longestHashQuestionRunLength = hashQuestionRunLengths[0];
		if (longestHashQuestionRunLength < sortedRuns[sortedRuns.length - 1]) {
			cache.set(cacheKey, 0);
			return 0;
		}

		// recursion
		if (rec[0] === ".") {
			const vars = countVariations(rec.slice(1), runs);
			cache.set(cacheKey, vars);
		}
		// next is a hash - consume all you can
		else if (rec[0] === "#") {
			// If we have enough hashquestions, but the next char is a hash, that will be too long a run.
			if (rec[runs[0]] === "#") {
				cache.set(cacheKey, 0);
				return 0;
			}
			// If this is a full run of hashquestions, it's the only possible variation.
			if (/^[#?]+$/.test(rec.slice(0, runs[0]))) {
				const vars = countVariations(rec.slice(runs[0] + 1), runs.slice(1));
				cache.set(cacheKey, vars);
			} else {
				cache.set(cacheKey, 0);
				return 0;
			}
		}
		// next is a question, count both variations
		else if (rec[0] === "?") {
			const rest = rec.slice(1);
			const hashVars = countVariations(`#${rest}`, runs);
			const dotVars = countVariations(`.${rest}`, runs);
			cache.set(cacheKey, hashVars + dotVars);
		}
	}
	const result = cache.get(cacheKey)!;
	return result;
}

async function p2023day12_part2(input: string, ...params: any[]) {
	const lines = input.split("\n");
	const records: [string, number[]][] = [];
	for (const line of lines) {
		const [recs, runs] = line.split(" ");
		records.push([recs, runs.split(",").map(Number)]);
	}

	let variationCount = 0;
	for (const [recs, runs] of records) {
		const unfoldedRec = [recs, ...Array(4).fill("?" + recs)].join("");
		const unfoldedRun = Array(5).fill(runs).flat();
		const vars = countVariations(unfoldedRec, unfoldedRun);
		// console.log(recs, runs.join(","), "-", vars);
		variationCount += vars;
	}

	return variationCount;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `# 1`,
			extraArgs: [],
			expected: `1`,
			expectedPart2: `1`,
		},
		{
			input: `? 1`,
			extraArgs: [],
			expected: `1`,
			expectedPart2: `1`,
		},
		{
			input: `?? 2`,
			extraArgs: [],
			expected: `1`,
			expectedPart2: `1`,
		},
		{
			input: `.???? 1,1`,
			extraArgs: [],
			expected: `3`,
			expectedPart2: ``,
		},
		{
			input: `????? 1,1`,
			extraArgs: [],
			expected: `6`,
			expectedPart2: ``,
		},
		{
			input: `???.### 1,1,3`,
			extraArgs: [],
			expected: `1`, // ext => 3
			expectedPart2: `1`,
			ignore: false,
		},
		{
			input: `.??..??...?##. 1,1,3`,
			extraArgs: [],
			expected: `4`, // ext => 8
			expectedPart2: `16384`,
			ignore: false,
		},
		{
			input: `?#?#?#?#?#?#?#? 1,3,1,6`,
			extraArgs: [],
			expected: `1`, // ext => 1
			expectedPart2: `1`,
			ignore: false,
		},
		{
			input: `????.#...#... 4,1,1`,
			extraArgs: [],
			expected: `1`, // ext => 2
			expectedPart2: `16`,
			ignore: false,
		},
		{
			input: `????.######..#####. 1,6,5`,
			extraArgs: [],
			expected: `4`, // ext => 5
			expectedPart2: `2500`,
			ignore: false,
		},
		{
			input: `#??? 2,1`,
			extraArgs: [],
			expected: `1`,
			expectedPart2: ``,
			ignore: false,
		},
		{
			input: `#???? 2,1`,
			extraArgs: [],
			expected: `2`,
			expectedPart2: ``,
		},
		{
			input: `#????? 2,1`,
			extraArgs: [],
			expected: `3`,
			expectedPart2: ``,
		},
		{
			input: `#?????? 2,1`,
			extraArgs: [],
			expected: `4`,
			expectedPart2: ``,
		},
		{
			input: `?###???????? 3,2,1`,
			extraArgs: [],
			expected: `10`, // ext => 10, need 15
			expectedPart2: `506250`,
		},
		{
			input: `???.### 1,1,3
.??..??...?##. 1,1,3
?#?#?#?#?#?#?#? 1,3,1,6
????.#...#... 4,1,1
????.######..#####. 1,6,5
?###???????? 3,2,1`,
			extraArgs: [],
			expected: `21`,
			expectedPart2: `525152`,
		},
	];
	const part2tests: TestCase[] = [];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			if (testCase.ignore !== true) {
				test.logTestResult(
					testCase,
					String(await p2023day12_part1(testCase.input, ...(testCase.extraArgs || [])))
				);
			}
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			if (testCase.ignore !== true) {
				test.logTestResult(
					testCase,
					String(await p2023day12_part2(testCase.input, ...(testCase.extraArgs || [])))
				);
			}
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2023day12_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2023day12_part2(input));
	const part2After = performance.now();

	logSolution(12, 2023, part1Solution, part2Solution);

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
