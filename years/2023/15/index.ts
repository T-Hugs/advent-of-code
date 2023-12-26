import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2023;
const DAY = 15;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/15/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/15/data.txt
// problem url  : https://adventofcode.com/2023/day/15

function hash(str: string) {
	let currentValue = 0;

	for (let i = 0; i < str.length; ++i) {
		const char = str[i];
		const ascii = char.charCodeAt(0);
		currentValue += ascii;
		currentValue *= 17;
		currentValue %= 256;
	}
	return currentValue;
}

async function p2023day15_part1(input: string, ...params: any[]) {
	const inputs = input.split(",").map(inp => inp.replaceAll("\n", ""));
	let sum = 0;
	for (const inp of inputs) {
		const code = hash(inp);
		sum += code;
	}
	return sum;
}

async function p2023day15_part2(input: string, ...params: any[]) {
	const inputs = input.split(",").map(inp => inp.replaceAll("\n", ""));
	const boxes: Map<number, [label: string, focal: number][]> = new Map();
	for (let i = 0; i < 256; ++i) {
		boxes.set(i, []);
	}
	for (const inp of inputs) {
		const op = inp.includes("=") ? "add" : "remove";
		if (op === "remove") {
			const label = inp.split("-")[0];
			const boxNum = hash(label);
			const box = boxes.get(boxNum);
			const lensToRemoveIndex = box?.findIndex(b => b[0] === label) ?? -1;
			if (lensToRemoveIndex >= 0) {
				box?.splice(lensToRemoveIndex, 1);
			}
		} else {
			const [label, focalSt] = inp.split("=");
			const focal = Number(focalSt);
			const boxNum = hash(label);
			const box = boxes.get(boxNum);
			if (box) {
				const lensIndex = box.findIndex(b => b[0] === label);
				if (lensIndex >= 0) {
					box[lensIndex] = [label, focal];
				} else {
					box.push([label, focal]);
				}
			}
		}
	}
	let sum = 0;
	for (const [boxNum, box] of boxes) {
		for (let i = 0; i < box.length; ++i) {
			sum += (1 + boxNum) * (1 + i) * box[i][1];
		}
	}
	return sum;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7`,
			extraArgs: [],
			expected: `1320`,
			expectedPart2: `145`,
		},
	];
	const part2tests: TestCase[] = [];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2023day15_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2023day15_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2023day15_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2023day15_part2(input));
	const part2After = performance.now();

	logSolution(15, 2023, part1Solution, part2Solution);

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
