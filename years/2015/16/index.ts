import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2015;
const DAY = 16;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2015/16/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2015/16/data.txt
// problem url  : https://adventofcode.com/2015/day/16

interface Sue {
	children?: number;
	cats?: number;
	samoyeds?: number;
	pomeranians?: number;
	akitas?: number;
	vizslas?: number;
	goldfish?: number;
	trees?: number;
	cars?: number;
	perfumes?: number;
}
type Reading = Required<Sue>;
async function p2015day16_part1(input: string) {
	const lines = input.split("\n");
	const sues: Sue[] = [];
	for (const line of lines) {
		const split = line.replace(/,/g, "").split(" ").slice(2);
		const sue: Sue = {};
		for (let i = 0; i < split.length; i += 2) {
			sue[split[i].slice(0, -1) as keyof Sue] = Number(split[i + 1]);
		}
		sues.push(sue);
	}
	const reading: Reading = {
		children: 3,
		cats: 7,
		samoyeds: 2,
		pomeranians: 3,
		akitas: 0,
		vizslas: 0,
		goldfish: 5,
		trees: 3,
		cars: 2,
		perfumes: 1,
	};

	for (let i = 0; i < sues.length; ++i) {
		if ((Object.keys(sues[i]) as (keyof Sue)[]).every(p => reading[p] === sues[i][p])) {
			return i + 1;
		}
	}
}

async function p2015day16_part2(input: string) {
	const lines = input.split("\n");
	const sues: Sue[] = [];
	for (const line of lines) {
		const split = line.replace(/,/g, "").split(" ").slice(2);
		const sue: Sue = {};
		for (let i = 0; i < split.length; i += 2) {
			sue[split[i].slice(0, -1) as keyof Sue] = Number(split[i + 1]);
		}
		sues.push(sue);
	}
	const reading: Reading = {
		children: 3,
		cats: 7,
		samoyeds: 2,
		pomeranians: 3,
		akitas: 0,
		vizslas: 0,
		goldfish: 5,
		trees: 3,
		cars: 2,
		perfumes: 1,
	};

	for (let i = 0; i < sues.length; ++i) {
		const sue = sues[i];
		let good = true;
		for (const prop of Object.keys(reading) as (keyof Sue)[]) {
			if (sue[prop] != undefined) {
				if (prop === "cats" || prop === "trees") {
					if (sue[prop]! <= reading[prop]) {
						good = false;
						break;
					}
				} else if (prop === "pomeranians" || prop === "goldfish") {
					if (sue[prop]! >= reading[prop]) {
						good = false;
						break;
					}
				} else {
					if (sue[prop] !== reading[prop]) {
						good = false;
						break;
					}
				}
			}
		}
		if (good) {
			return i + 1;
		}
	}
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2015day16_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2015day16_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2015day16_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2015day16_part2(input));
	const part2After = performance.now();

	logSolution(16, 2015, part1Solution, part2Solution);

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
