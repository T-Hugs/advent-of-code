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

function subLists<T extends unknown>(array: T[]): T[][][] | undefined {
	if (!array.length) {
		return undefined;
	}

	const result: T[][][] = [];

	function generateSublists(start: number, path: T[][]): void {
		if (start === array.length) {
			result.push(path);
			return;
		}

		for (let i = start; i < array.length; i++) {
			generateSublists(i + 1, [...path, array.slice(start, i + 1)]);
		}
	}

	generateSublists(0, []);
	return result;
}

// const candidateRecordsMemo: { [key: string]: string[] } = {};
function getCandidateRecords(recs: string) {
	const candidates: string[] = [""];

	for (let i = 0; i < recs.length; ++i) {
		let len = candidates.length;
		for (let j = 0; j < len; ++j) {
			if (recs[i] !== "?") {
				candidates[j] += recs[i];
			} else {
				const new1 = candidates[j] + ".";
				const new2 = candidates[j] + "#";
				candidates[j] = new1;
				candidates.push(new2);
			}
		}
	}
	return candidates;
}

async function p2023day12_part1(input: string, ...params: any[]) {
	const lines = input.split("\n");
	const records: [string, number[]][] = [];
	for (const line of lines) {
		const [recs, runs] = line.split(" ");
		records.push([recs, runs.split(",").map(Number)]);
	}

	let variationCount = 0;
	for (const [recs, runs] of records) {
		const candidates = getCandidateRecords(recs);
		variationCount += candidates.filter(c => {
			const sections = c.split(/\.+/).filter(Boolean);
			if (sections.length !== runs.length) {
				return false;
			} else {
				const runCounts = sections.map(s => s.length);
				for (let i = 0; i < runCounts.length; ++i) {
					if (runs[i] !== runCounts[i]) {
						return false;
					}
				}
				return true;
			}
		}).length;
	}

	return variationCount;
}

function isValidCandidate(candidate: string, runs: number[]) {
	const sections = candidate.split(/\.+/).filter(Boolean);
	if (sections.length !== runs.length) {
		return false;
	} else {
		const runCounts = sections.map(s => s.length);
		for (let i = 0; i < runCounts.length; ++i) {
			if (runs[i] !== runCounts[i]) {
				return false;
			}
		}
		return true;
	}
}

function getCandidateCount(recs: string, runs: number[]) {
	const allCandidates = getCandidateRecords(recs);
	return allCandidates.filter(c => isValidCandidate(c, runs)).length;
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
		const filteredRecords = getCandidateRecords(recs).filter(c => isValidCandidate(c, runs));
		const countWithDamagedEndAndFront = filteredRecords.filter(r => r[0] === "#" && r[r.length - 1] === "#").length;
		const countWithDamagedEnd =
			filteredRecords.filter(r => r[r.length - 1] === "#").length - countWithDamagedEndAndFront;
		const countWithDamagedFront = filteredRecords.filter(r => r[0] === "#").length - countWithDamagedEndAndFront;
		const countWithNoDamagedEnds =
			filteredRecords.length - countWithDamagedEnd - countWithDamagedEndAndFront - countWithDamagedFront;

		const noDamagePercent = countWithNoDamagedEnds / filteredRecords.length;
		const endDamagePercent = countWithDamagedEnd / filteredRecords.length;
		const frontDamagePercent = countWithDamagedFront / filteredRecords.length;
		const bothDamagePercent = countWithDamagedEndAndFront / filteredRecords.length;

		const candidates = getCandidateCount(recs, runs);
		const extEndCandidates = getCandidateCount(recs + "?", runs);
		const extFrontCandidates = getCandidateCount("?" + recs, runs);
		const extBothCandidates = getCandidateCount("?" + recs + "?", runs);

		variationCount +=
			candidates *
			Math.pow(
				Math.round(extBothCandidates * noDamagePercent) +
					Math.round(extEndCandidates * endDamagePercent) +
					Math.round(extFrontCandidates * frontDamagePercent) +
					Math.round(candidates * bothDamagePercent),
				4
			);
	}

	return variationCount;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `???.### 1,1,3`,
			extraArgs: [],
			expected: `1`, // ext => 3
			expectedPart2: `1`,
		},
		{
			input: `.??..??...?##. 1,1,3`,
			extraArgs: [],
			expected: `4`, // ext => 8
			expectedPart2: `16384`,
		},
		{
			input: `?#?#?#?#?#?#?#? 1,3,1,6`,
			extraArgs: [],
			expected: `1`, // ext => 1
			expectedPart2: `1`,
		},
		{
			input: `????.#...#... 4,1,1`,
			extraArgs: [],
			expected: `1`, // ext => 2
			expectedPart2: `16`,
		},
		{
			input: `????.######..#####. 1,6,5`,
			extraArgs: [],
			expected: `4`, // ext => 5
			expectedPart2: `2500`,
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
			test.logTestResult(testCase, String(await p2023day12_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2023day12_part2(testCase.input, ...(testCase.extraArgs || []))));
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
