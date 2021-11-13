import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2020;
const DAY = 16;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2020/16/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2020/16/data.txt
// problem url  : https://adventofcode.com/2020/day/16

async function p2020day16_part1(input: string) {
	const groups = input.split("\n\n");
	const _rules = groups[0].split("\n");
	const nearby = groups[2]
		.split("\n")
		.slice(1)
		.map(t => t.split(",").map(Number));
	const rules: { name: string; r1low: number; r1high: number; r2low: number; r2high: number }[] = [];
	for (const rule of _rules) {
		const colonSplit = rule.split(":");
		const name = colonSplit[0];
		const ranges = colonSplit[1].trim();
		const [r1, r2] = ranges.split(" or ");
		const [r1low, r1high] = r1.split("-").map(Number);
		const [r2low, r2high] = r2.split("-").map(Number);
		const r = { name, r1low, r1high, r2low, r2high };
		rules.push(r);
	}
	const invalidValues: number[] = [];
	for (const tik of nearby) {
		for (const value of tik) {
			if (
				!rules.some(r => {
					return (r.r1low <= value && r.r1high >= value) || (r.r2low <= value && r.r2high >= value);
				})
			) {
				invalidValues.push(value);
			}
		}
	}
	return invalidValues.reduce((p, c) => p + c, 0);
}

async function p2020day16_part2(input: string) {
	const groups = input.split("\n\n");
	const _rules = groups[0].split("\n");
	const ticket = groups[1].split("\n")[1].split(",").map(Number);
	const nearby = groups[2]
		.split("\n")
		.slice(1)
		.map(t => t.split(",").map(Number));
	const rules: { name: string; r1low: number; r1high: number; r2low: number; r2high: number }[] = [];
	for (const rule of _rules) {
		const colonSplit = rule.split(":");
		const name = colonSplit[0];
		const ranges = colonSplit[1].trim();
		const [r1, r2] = ranges.split(" or ");
		const [r1low, r1high] = r1.split("-").map(Number);
		const [r2low, r2high] = r2.split("-").map(Number);
		const r = { name, r1low, r1high, r2low, r2high };
		rules.push(r);
	}
	let invalidIndexes: number[] = [];
	let i = 0;
	for (const tik of nearby) {
		for (const value of tik) {
			if (
				!rules.some(r => {
					return (r.r1low <= value && r.r1high >= value) || (r.r2low <= value && r.r2high >= value);
				})
			) {
				invalidIndexes.push(i);
			}
		}
		i++;
	}
	const filteredNearby = nearby.filter((t, index) => !invalidIndexes.includes(index));
	const data: { index: number; validNames: Set<string> }[] = [];
	const fieldCount = filteredNearby[0].length;

	for (let i = 0; i < fieldCount; ++i) {
		let validNames: Set<string> = data.find(d => d.index === i)?.validNames ?? new Set(rules.map(r => r.name));
		for (const ticket of filteredNearby) {
			const fieldValue = ticket[i];
			const localValidNames: Set<string> = new Set();
			for (const rule of rules) {
				if (
					(rule.r1low <= fieldValue && rule.r1high >= fieldValue) ||
					(rule.r2low <= fieldValue && rule.r2high >= fieldValue)
				) {
					localValidNames.add(rule.name);
				}
			}
			// set intersection
			validNames = new Set([...validNames].filter(x => localValidNames.has(x)));
		}
		data.push({ index: i, validNames });
	}

	while (data.some(d => d.validNames.size > 1)) {
		for (const d of data) {
			if (d.validNames.size === 1) {
				for (const e of data) {
					if (e === d) {
						continue;
					}
					e.validNames.delete(Array.from(d.validNames)[0]);
				}
			}
		}
	}
	let prod = 1;
	for (const rule of rules) {
		if (rule.name.startsWith("departure")) {
			const index = data.find(d => d.validNames.has(rule.name))!.index;
			prod *= ticket[index];
		}
	}
	return prod;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `class: 1-3 or 5-7
row: 6-11 or 33-44
seat: 13-40 or 45-50

your ticket:
7,1,14

nearby tickets:
7,3,47
40,4,50
55,2,20
38,6,12
`,
			expected: `71`,
		},
	];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2020day16_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2020day16_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2020day16_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2020day16_part2(input));
	const part2After = performance.now();

	logSolution(16, 2020, part1Solution, part2Solution);

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
