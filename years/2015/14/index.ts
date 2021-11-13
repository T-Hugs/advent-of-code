import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2015;
const DAY = 14;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2015/14/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2015/14/data.txt
// problem url  : https://adventofcode.com/2015/day/14

function getDistanceTraveled(time: number, speed: number, duration: number, rest: number) {
	const period = duration + rest;
	const fullPeriods = Math.floor(time / period);
	const remaining = time % period;
	const distanceFromFull = speed * duration * fullPeriods;
	const distanceFromRemaining = speed * Math.min(remaining, duration);
	return distanceFromFull + distanceFromRemaining;
}

async function p2015day14_part1(input: string) {
	const lines = input.split("\n");
	const deer: { [name: string]: [number, number, number] } = {};
	for (const line of lines) {
		const name = line.split(" ")[0];
		const [speed, duration, rest] = /(\d+).*?(\d+).*?(\d+)/.exec(line)!.slice(1, 4).map(Number);
		deer[name] = [speed, duration, rest];
	}
	const time = 2503;
	const distances: { [name: string]: number } = {};
	for (const name of Object.keys(deer)) {
		distances[name] = getDistanceTraveled(time, ...deer[name]);
	}
	return Math.max(...Object.values(distances));
}

async function p2015day14_part2(input: string) {
	const lines = input.split("\n");
	const deer: { [name: string]: [number, number, number] } = {};
	for (const line of lines) {
		const name = line.split(" ")[0];
		const [speed, duration, rest] = /(\d+).*?(\d+).*?(\d+)/.exec(line)!.slice(1, 4).map(Number);
		deer[name] = [speed, duration, rest];
	}
	const time = 2503;
	const points: { [name: string]: number } = {};
	for (let i = 1; i < time; ++i) {
		const resultsForSecond = Object.fromEntries(
			Object.keys(deer).map(n => [n, getDistanceTraveled(i, ...deer[n])])
		);
		const leadDistance = Math.max(...Object.values(resultsForSecond));
		const winner = Object.keys(deer).find(d => resultsForSecond[d] === leadDistance)!;
		if (!points[winner]) {
			points[winner] = 0;
		}
		points[winner]++
	}
	return Math.max(...Object.values(points));
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2015day14_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2015day14_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2015day14_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2015day14_part2(input));
	const part2After = performance.now();

	logSolution(14, 2015, part1Solution, part2Solution);

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
