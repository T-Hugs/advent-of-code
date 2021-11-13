import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2020;
const DAY = 4;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2020/04/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2020/04/data.txt
// problem url  : https://adventofcode.com/2020/day/4

async function p2020day4_part1(input: string) {
	const passports = input.split("\n\n");
	const req = ["byr", "iyr", "eyr", "hgt", "hcl", "ecl", "pid"];
	let count = 0;
	for (const passport of passports) {
		const passportData = passport.split("\n").join(" ");
		const passportVals = passportData.split(" ");
		const needs = [...req];

		for (const val of passportVals) {
			const split = val.split(":");
			_.remove(needs, v => v === split[0]);
		}

		if (needs.length === 0) {
			count++;
		}
	}
	return count;
}

async function p2020day4_part2(input: string) {
	const passports = input.split("\n\n");
	const validations: { [key: string]: (test: string) => boolean } = {
		byr: function (test: string) {
			return /\d{4}/.test(test) && Number(test) >= 1920 && Number(test) <= 2002;
		},
		iyr: (test: string) => {
			return /\d{4}/.test(test) && Number(test) >= 2010 && Number(test) <= 2020;
		},
		eyr: (test: string) => {
			return /\d{4}/.test(test) && Number(test) >= 2020 && Number(test) <= 2030;
		},
		hgt: (test: string) => {
			if (test.endsWith("cm")) {
				const val = parseInt(test);
				return val >= 150 && val <= 193;
			} else if (test.endsWith("in")) {
				const val = parseInt(test);
				return val >= 59 && val <= 76;
			}
			return false;
		},
		hcl: (test: string) => /^#[0-9a-f]{6}$/.test(test),
		ecl: (test: string) => /^amb|blu|brn|gry|grn|hzl|oth$/.test(test),
		pid: (test: string) => /^\d{9}$/.test(test),
		cid: (test: string) => true,
	};
	let count = 0;
	for (const passport of passports) {
		const passportData = passport.split("\n").join(" ");
		const passportVals = passportData.split(" ");
		const parsedPassport: { [key: string]: string } = {};

		for (const val of passportVals) {
			const split = val.split(":");
			parsedPassport[split[0]] = split[1];
		}

		let good = true;
		for (const validation of Object.entries(validations)) {
			if (!validation[1](parsedPassport[validation[0]])) {
				good = false;
			}
		}

		if (good) {
			count++;
		}
	}
	return count;
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2020day4_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2020day4_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2020day4_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2020day4_part2(input));
	const part2After = performance.now();

	logSolution(4, 2020, part1Solution, part2Solution);

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
