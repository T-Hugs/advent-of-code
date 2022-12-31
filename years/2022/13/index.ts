import _, { first } from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2022;
const DAY = 13;

type Packet = Packet[] | number;

// solution path: C:\Users\trgau\dev\t-hugs\advent-of-code\years\2022\13\index.ts
// data path    : C:\Users\trgau\dev\t-hugs\advent-of-code\years\2022\13\data.txt
// problem url  : https://adventofcode.com/2022/day/13

function compare(a: Packet, b: Packet) {
	if (typeof a === "number" && typeof b === "number") {
		return a - b;
	}
	const aCompare: Packet[] = typeof a === "number" ? [a] : a;
	const bCompare: Packet[] = typeof b === "number" ? [b] : b;

	for (let i = 0; i < aCompare.length; ++i) {
		const aVal = aCompare[i];
		const bVal = bCompare[i];
		if (bVal == undefined) {
			return 1;
		}
		const result = compare(aVal, bVal) as number;
		if (result !== 0) {
			return result;
		}
	}

	if (aCompare.length === bCompare.length) {
		return 0;
	}

	// left ran out of items
	return -1;
}

async function p2022day13_part1(input: string, ...params: any[]) {
	const groups = input.split("\n\n").map(g => g.trim());
	let index = 1;
	let sum = 0;
	for (const group of groups) {
		if (group.trim()) {
			const [left, right] = group.split("\n").map(s => JSON.parse(s) as Packet);
			if (compare(left, right) < 0) {
				sum += index;
			}
			index++;
		}
	}
	return sum;
}

async function p2022day13_part2(input: string, ...params: any[]) {
	const lines = input.split("\n").filter(n => n.trim());
	lines.push("[[2]]", "[[6]]");
	const sorted = lines.map(l => JSON.parse(l) as Packet).sort(compare);
	const firstIndex = sorted.findIndex(x => JSON.stringify(x) === "[[2]]") + 1;
	const secondIndex = sorted.findIndex(x => JSON.stringify(x) === "[[6]]") + 1;
	return firstIndex * secondIndex;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `[1,1,3,1,1]
[1,1,5,1,1]

[[1],[2,3,4]]
[[1],4]

[9]
[[8,7,6]]

[[4,4],4,4]
[[4,4],4,4,4]

[7,7,7,7]
[7,7,7]

[]
[3]

[[[]]]
[[]]

[1,[2,[3,[4,[5,6,7]]]],8,9]
[1,[2,[3,[4,[5,6,0]]]],8,9]`,
			extraArgs: [],
			expected: `13`,
		},
	];
	const part2tests: TestCase[] = [{
		input: `[1,1,3,1,1]
[1,1,5,1,1]

[[1],[2,3,4]]
[[1],4]

[9]
[[8,7,6]]

[[4,4],4,4]
[[4,4],4,4,4]

[7,7,7,7]
[7,7,7]

[]
[3]

[[[]]]
[[]]

[1,[2,[3,[4,[5,6,7]]]],8,9]
[1,[2,[3,[4,[5,6,0]]]],8,9]`,
		extraArgs: [],
		expected: `140`,
	}];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2022day13_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2022day13_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2022day13_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2022day13_part2(input));
	const part2After = performance.now();

	logSolution(13, 2022, part1Solution, part2Solution);

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
