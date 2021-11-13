import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2020;
const DAY = 7;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2020/07/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2020/07/data.txt
// problem url  : https://adventofcode.com/2020/day/7

async function p2020day7_part1(input: string) {
	const lines = input.split("\n");
	const map: Obj<Obj<number>> = {};
	for (const line of lines) {
		if (line.includes("no other bags")) {
			continue;
		}
		const words = line.split(" ");
		const color1 = words[0] + " " + words[1];
		if (!map[color1]) {
			map[color1] = {};
		}
		const containIndex = line.indexOf("contain") + 8;
		const commaSplit = line.substr(containIndex).split(",");
		for (const internalBag of commaSplit) {
			const internalBagSplit = internalBag.trim().split(" ");
			const count = Number(internalBagSplit[0]);
			const color2 = internalBagSplit[1] + " " + internalBagSplit[2];
			map[color1][color2] = count;
		}
	}
	function canGetToGold(color: string): boolean {
		if (map[color]["shiny gold"]) {
			return true;
		} else {
			for (const col of Object.keys(map[color])) {
				if (canGetToGold(col)) {
					return true;
				}
			}
		}
		return false;
	}
	const toShinyGold = Object.keys(map).filter(c => canGetToGold(c));
	return toShinyGold.length;
}

async function p2020day7_part2(input: string) {
	const lines = input.split("\n");
	const map: Obj<Obj<number>> = {};
	for (const line of lines) {
		const words = line.split(" ");
		const containIndex = line.indexOf("contain") + 8;
		const color1 = words[0] + " " + words[1];
		if (!map[color1]) {
			map[color1] = {};
		}
		if (line.includes("no other bags")) {
			continue;
		}
		const commaSplit = line.substr(containIndex).split(",");
		for (const x of commaSplit) {
			const xx = x.trim().split(" ");
			const count = Number(xx[0]);
			const color2 = xx[1] + " " + xx[2];
			map[color1][color2] = count;
		}
	}
	const bagCache: Obj<number> = {};
	function bagsRequired(color: string): number {
		if (bagCache[color] != undefined) {
			return bagCache[color];
		}
		const containedBags = Object.keys(map[color]);
		if (containedBags.length === 0) {
			return 0;
		} else {
			let count = 0;
			for (const bag of containedBags) {
				count += bagsRequired(bag) * map[color][bag] + map[color][bag];
			}
			bagCache[color] = count;
			return count;
		}
	}
	const required = bagsRequired("shiny gold");
	return required;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `light red bags contain 1 bright white bag, 2 muted yellow bags.
dark orange bags contain 3 bright white bags, 4 muted yellow bags.
bright white bags contain 1 shiny gold bag.
muted yellow bags contain 2 shiny gold bags, 9 faded blue bags.
shiny gold bags contain 1 dark olive bag, 2 vibrant plum bags.
dark olive bags contain 3 faded blue bags, 4 dotted black bags.
vibrant plum bags contain 5 faded blue bags, 6 dotted black bags.
faded blue bags contain no other bags.
dotted black bags contain no other bags.`,
			expected: `4`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `shiny gold bags contain 2 dark red bags.
dark red bags contain 2 dark orange bags.
dark orange bags contain 2 dark yellow bags.
dark yellow bags contain 2 dark green bags.
dark green bags contain 2 dark blue bags.
dark blue bags contain 2 dark violet bags.
dark violet bags contain no other bags.`,
			expected: `126`,
		},
		{
			input: `light red bags contain 1 bright white bag, 2 muted yellow bags.
dark orange bags contain 3 bright white bags, 4 muted yellow bags.
bright white bags contain 1 shiny gold bag.
muted yellow bags contain 2 shiny gold bags, 9 faded blue bags.
shiny gold bags contain 1 dark olive bag, 2 vibrant plum bags.
dark olive bags contain 3 faded blue bags, 4 dotted black bags.
vibrant plum bags contain 5 faded blue bags, 6 dotted black bags.
faded blue bags contain no other bags.
dotted black bags contain no other bags.`,
			expected: `32`,
		},
	];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2020day7_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2020day7_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2020day7_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2020day7_part2(input));
	const part2After = performance.now();

	logSolution(7, 2020, part1Solution, part2Solution);

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
