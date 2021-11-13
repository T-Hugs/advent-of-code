import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2016;
const DAY = 4;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2016/04/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2016/04/data.txt
// problem url  : https://adventofcode.com/2016/day/4

async function p2016day4_part1(input: string) {
	const lines = input.split("\n");
	let sum = 0;
	for (const line of lines) {
		const [name, _, sector, checksum] = /(([a-z]+-)*[a-z]+)-(\d+)\[([a-z]+)\]+/.exec(line)!.slice(1);
		const chars: { [char: string]: number } = {};
		for (const char of name) {
			if (char === "-") {
				continue;
			}
			if (!chars[char]) {
				chars[char] = 0;
			}
			chars[char]++;
		}
		const entries = Object.entries(chars);
		entries.sort((a, b) => {
			const diff = b[1] - a[1];
			if (diff !== 0) {
				return diff;
			} else {
				return a[0].localeCompare(b[0]);
			}
		});
		let good = true;
		for (let i = 0; i < checksum.length; ++i) {
			if (checksum[i] !== entries[i][0]) {
				good = false;
			}
		}
		if (good) {
			sum += Number(sector);
		}
	}
	return sum;
}

async function p2016day4_part2(input: string) {
	const lines = input.split("\n");
	let sum = 0;
	for (const line of lines) {
		const [name, _, sector] = /(([a-z]+-)*[a-z]+)-(\d+)\[([a-z]+)\]+/.exec(line)!.slice(1);
		
		let newName = "";
		for (const char of name) {
			if (char === "-") {
				newName += " ";
			} else {
				const alphaIndex = char.charCodeAt(0) - 97;
				const rotated = (alphaIndex + Number(sector)) % 26 + 97;
				newName += String.fromCharCode(rotated);
			}
		}
		if (newName === "northpole object storage") {
			return sector;
		}
	}
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `aaaaa-bbb-z-y-x-123[abxyz]
a-b-c-d-e-f-g-h-987[abcde]
not-a-real-room-404[oarel]
totally-real-room-200[decoy]`,
			expected: String(123 + 987 + 404),
		},
	];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2016day4_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2016day4_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2016day4_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2016day4_part2(input));
	const part2After = performance.now();

	logSolution(4, 2016, part1Solution, part2Solution);

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
