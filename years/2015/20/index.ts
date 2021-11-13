import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2015;
const DAY = 20;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2015/20/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2015/20/data.txt
// problem url  : https://adventofcode.com/2015/day/20

function sumOfFactors(n: number) {
	let result = 1;
	for (let i = 2; i < Math.floor(Math.sqrt(n) + 1); ++i) {
		let currentSum = 1;
		let currentTerm = 1;
		while (n % i === 0) {
			n = n / i;
			currentTerm = currentTerm * i;
			currentSum += currentTerm;
		}
		result = result * currentSum;
	}
	if (n > 2) {
		result = result * (1 + n);
	}
	return result;
}

function sumOfBigFactors(n: number) {
	const factors: Set<number> = new Set();
	for (let i = 1; i < Math.floor(Math.sqrt(n) + 1); ++i) {
		if (n % i === 0) {
			const f2 = n / i;
			factors.add(i);
			factors.add(f2);
		}
	}
	const bigFactors = Array.from(factors).filter(f => f * 50 >= n);
	return bigFactors.reduce((p, c) => p + c, 0);
}

async function p2015day20_part1(input: string) {
	const threshold = Number(input);
	for (let i = 1; ; ++i) {
		const factorSum = sumOfFactors(i);
		const presents = factorSum * 10;
		if (presents >= threshold) {
			console.log("Done");
			return i;
		}
	}
}

async function p2015day20_part2(input: string) {
	const threshold = Number(input);
	for (let i = 665280; ; ++i) {
		const factorSum = sumOfBigFactors(i);
		const presents = factorSum * 11;
		if (presents >= threshold) {
			return i;
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
		test.logTestResult(testCase, String(await p2015day20_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2015day20_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2015day20_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2015day20_part2(input));
	const part2After = performance.now();

	logSolution(20, 2015, part1Solution, part2Solution);

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
