import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2015;
const DAY = 9;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2015/09/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2015/09/data.txt
// problem url  : https://adventofcode.com/2015/day/9

async function p2015day9_part1(input: string) {
	const lines = input.split("\n");
	const cities: {[city: string]: {[city: string]: number}} = {};
	for (const line of lines) {
		const [segment, _distance] = line.split(" = ");
		const distance = Number(_distance);
		const [start, end] = segment.split(" to ");
		if (!cities[start]) {
			cities[start] = {};
		}
		if (!cities[end]) {
			cities[end] = {}
		}
		cities[start][end] = distance;
		cities[end][start] = distance;
	}

	const cityOrders = util.getPermutations(Object.keys(cities));
	
	function routeLength(route: string[]) {
		let length = 0;
		for (let i = 1; i < route.length; ++i) {
			length += cities[route[i-1]][route[i]];
		}
		return length;
	}
	return Math.min(...cityOrders.map(routeLength));
}

async function p2015day9_part2(input: string) {
	const lines = input.split("\n");
	const cities: {[city: string]: {[city: string]: number}} = {};
	for (const line of lines) {
		const [segment, _distance] = line.split(" = ");
		const distance = Number(_distance);
		const [start, end] = segment.split(" to ");
		if (!cities[start]) {
			cities[start] = {};
		}
		if (!cities[end]) {
			cities[end] = {}
		}
		cities[start][end] = distance;
		cities[end][start] = distance;
	}

	const cityOrders = util.getPermutations(Object.keys(cities));
	
	function routeLength(route: string[]) {
		let length = 0;
		for (let i = 1; i < route.length; ++i) {
			length += cities[route[i-1]][route[i]];
		}
		return length;
	}
	return Math.max(...cityOrders.map(routeLength));
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `London to Dublin = 464
London to Belfast = 518
Dublin to Belfast = 141`,
		expected: `605`
	}];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2015day9_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2015day9_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2015day9_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2015day9_part2(input));
	const part2After = performance.now();
	
	logSolution(9, 2015, part1Solution, part2Solution);

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
