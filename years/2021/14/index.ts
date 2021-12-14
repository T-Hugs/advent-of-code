import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2021;
const DAY = 14;

// solution path: C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\14\index.ts
// data path    : C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\14\data.txt
// problem url  : https://adventofcode.com/2021/day/14

async function p2021day14_part1(input: string, ...params: any[]) {
	const lines = input.split("\n");
	let template = lines[0];
	const rulesS = lines.slice(2);

	const rules: {[key: string]: string} = {}
	for (const rule of rulesS) {
		const [from, to] = rule.split(" -> ");
		rules[from] = to;
	}

	for (let i = 0; i < 10; ++i) {
		let newStr = "";
		for (let i = 0; i < template.length - 1; ++i) {
			const pair = template[i] + template[i + 1];
			if (rules[pair]) {
				newStr += template[i] + rules[pair];// + template[i + 1];
			} else {
				newStr += pair;
			}
		}
		newStr += template[template.length - 1];
		template = newStr;
	}

	const elems = util.countUniqueElements(template);
	const max = util.max(Object.entries(elems), elem => elem[1]);
	const min = util.min(Object.entries(elems), elem => elem[1]);
	return max.value - min.value;
}

async function p2021day14_part2(input: string, ...params: any[]) {
	const lines = input.split("\n");
	let template = lines[0];
	const rulesS = lines.slice(2);

	const rules: {[key: string]: string} = {}
	for (const rule of rulesS) {
		const [from, to] = rule.split(" -> ");
		rules[from] = to;
	}

	const counts: Obj<number> = {};
	let pairCounts: Obj<number> = {};

	for (let i = 0; i < template.length - 1; ++i) {
		const pair = template[i] + template[i + 1];
		pairCounts[pair] = (pairCounts[pair] || 0) + 1;
	}

	for (let i = 0; i < 40; ++i) {
		const newPairs: Obj<number> = {};
		for (const pair of Object.entries(pairCounts)) {
			const middle = rules[pair[0]];
			const left = pair[0][0] + middle;
			const right = middle + pair[0][1];
			newPairs[left] = (newPairs[left] || 0) + pair[1];
			newPairs[right] = (newPairs[right] || 0) + pair[1];
		}
		pairCounts = newPairs;
	}
	
	for (const pair of Object.entries(pairCounts)) {
		counts[pair[0][1]] = (counts[pair[0][1]] || 0) + pair[1];
	}
	counts[template[0]]++;

	const max = util.max(Object.entries(counts), elem => elem[1]);
	const min = util.min(Object.entries(counts), elem => elem[1]);
	return (max.value - min.value);
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `NNCB

CH -> B
HH -> N
CB -> H
NH -> C
HB -> C
HC -> B
HN -> C
NN -> C
BH -> H
NC -> B
NB -> B
BN -> B
BB -> N
BC -> B
CC -> N
CN -> C`,
		extraArgs: [],
		expected: `1588`
	}];
	const part2tests: TestCase[] = [{
		input: `NNCB

CH -> B
HH -> N
CB -> H
NH -> C
HB -> C
HC -> B
HN -> C
NN -> C
BH -> H
NC -> B
NB -> B
BN -> B
BB -> N
BC -> B
CC -> N
CN -> C`,
		extraArgs: [],
		expected: `2188189693529`
	}];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2021day14_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2021day14_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2021day14_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2021day14_part2(input));
	const part2After = performance.now();

	logSolution(14, 2021, part1Solution, part2Solution);

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
