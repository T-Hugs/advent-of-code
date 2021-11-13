import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2015;
const DAY = 13;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2015/13/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2015/13/data.txt
// problem url  : https://adventofcode.com/2015/day/13

async function p2015day13_part1(input: string) {
	const lines = input.split("\n");
	const names: { [name: string]: { [name: string]: number } } = {};
	for (const line of lines) {
		const split = line.split(" ");
		const firstName = split[0];
		const lastName = split[split.length - 1].slice(0, -1);
		const gainOrLose = /(gain)|(lose)/.exec(line)![0] === "gain" ? 1 : -1;
		const units = Number(/\d+/.exec(line)![0]);

		if (!names[firstName]) {
			names[firstName] = {};
		}
		names[firstName][lastName] = units * gainOrLose;
	}
	const arrangements = util.getPermutations(Object.keys(names));
	const happinessMap = new Map<string[], number>();
	let i = 0;
	for (const arrangement of arrangements) {
		if (i++ === 14) {
			_.noop();
		}
		let totalHappiness = 0;
		for (let i = 0; i < arrangement.length; ++i) {
			let next = (i + 1) % arrangement.length;
			let prev = Number(util.bigIntMod(i - 1, arrangement.length));
			const nextHappiness = names[arrangement[i]][arrangement[next]];
			const prevHappiness = names[arrangement[i]][arrangement[prev]];
			totalHappiness += nextHappiness + prevHappiness;
		}
		happinessMap.set(arrangement, totalHappiness);
	}
	let highest = 0;
	let bestArrangement: string[] = [];
	for (const [arrangement, val] of happinessMap.entries()) {
		if (val > highest) {
			highest = val;
			bestArrangement = arrangement;
		}
	}
	return highest;
}

async function p2015day13_part2(input: string) {
	const lines = input.split("\n");
	const names: { [name: string]: { [name: string]: number } } = {};
	for (const line of lines) {
		const split = line.split(" ");
		const firstName = split[0];
		const lastName = split[split.length - 1].slice(0, -1);
		const gainOrLose = /(gain)|(lose)/.exec(line)![0] === "gain" ? 1 : -1;
		const units = Number(/\d+/.exec(line)![0]);

		if (!names[firstName]) {
			names[firstName] = {};
		}
		names[firstName][lastName] = units * gainOrLose;
	}
	names["you"] = {};
	for (const [key, val] of Object.entries(names)) {
		if (key === "you") {
			continue;
		}
		names["you"][key] = 0;
		val["you"] = 0;
	}
	const arrangements = util.getPermutations(Object.keys(names));
	const happinessMap = new Map<string[], number>();
	let i = 0;
	for (const arrangement of arrangements) {
		if (i++ === 14) {
			_.noop();
		}
		let totalHappiness = 0;
		for (let i = 0; i < arrangement.length; ++i) {
			let next = (i + 1) % arrangement.length;
			let prev = Number(util.bigIntMod(i - 1, arrangement.length));
			const nextHappiness = names[arrangement[i]][arrangement[next]];
			const prevHappiness = names[arrangement[i]][arrangement[prev]];
			totalHappiness += nextHappiness + prevHappiness;
		}
		happinessMap.set(arrangement, totalHappiness);
	}
	let highest = 0;
	let bestArrangement: string[] = [];
	for (const [arrangement, val] of happinessMap.entries()) {
		if (val > highest) {
			highest = val;
			bestArrangement = arrangement;
		}
	}
	return highest;
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `Alice would gain 54 happiness units by sitting next to Bob.
Alice would lose 79 happiness units by sitting next to Carol.
Alice would lose 2 happiness units by sitting next to David.
Bob would gain 83 happiness units by sitting next to Alice.
Bob would lose 7 happiness units by sitting next to Carol.
Bob would lose 63 happiness units by sitting next to David.
Carol would lose 62 happiness units by sitting next to Alice.
Carol would gain 60 happiness units by sitting next to Bob.
Carol would gain 55 happiness units by sitting next to David.
David would gain 46 happiness units by sitting next to Alice.
David would lose 7 happiness units by sitting next to Bob.
David would gain 41 happiness units by sitting next to Carol.`,
		expected: `330`
	}];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2015day13_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2015day13_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2015day13_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2015day13_part2(input));
	const part2After = performance.now();

	logSolution(13, 2015, part1Solution, part2Solution);

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
