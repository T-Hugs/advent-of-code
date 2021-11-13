import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2020;
const DAY = 14;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2020/14/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2020/14/data.txt
// problem url  : https://adventofcode.com/2020/day/14

async function p2020day14_part1(input: string) {
	const lines = input.split("\n");
	const data: { mask: string; nums: [bigint, bigint][] }[] = [];
	let current: any;
	let memory: Obj<bigint> = {};
	for (const line of lines) {
		if (line.startsWith("mask =")) {
			current = { nums: [] };
			data.push(current);
			current.mask = line.substr(6);
		} else {
			const [l, r] = /mem\[(\d+)\] = (\d+)/.exec(line)!.slice(1).map(BigInt);
			current.nums.push([l, r]);
		}
	}

	for (const i of data) {
		const mask = i.mask;
		const xones = BigInt(parseInt(mask.replace(/X/g, "1"), 2));
		const xzero = BigInt(parseInt(mask.replace(/X/g, "0"), 2));
		for (const mem of i.nums) {
			const [l, r] = mem;
			const val = (r | xzero) & xones;
			memory[Number(l)] = val;
		}
	}
	return Object.values(memory).reduce((p, c) => p + c, 0n);
}
function getAllMasks(mask: string) {
	let masks: Obj<string>[] = [];
	let xIndexes = [];
	for (let i = 0; i < mask.length; ++i) {
		if (mask[i] === "X") {
			xIndexes.push(i);
		}
	}
	for (let i = 0; i < 2 ** xIndexes.length; ++i) {
		let bin = _.padStart(i.toString(2), xIndexes.length, "0");
		let newMask: Obj<string> = {};
		let j = 0;
		for (const index of xIndexes) {
			newMask[index] = bin[j++];
		}
		masks.push(newMask);
	}
	return masks;

	// for (let i = 0; i < mask.length; ++i) {
	// 	const index = mask.length - i - 1;
	// 	if (mask[index] === "X") {
	// 		masks.push([
	// 			BigInt(parseInt("0" + _.repeat("1", mask.length - i - 1) + "0" + _.repeat("1", i), 2)),
	// 			BigInt(parseInt(_.repeat("0", mask.length - i - 1) + "1" + _.repeat("0", i), 2)),
	// 		]);
	// 	}
	// }

	// let xCount = util.countUniqueElements(mask)["X"];
	// let maskCount = 2 ** xCount;
	// for (let i = 0; i < maskCount; ++i) {
	// 	const repl = _.padStart(i.toString(2), xCount, "0").split("");
	// 	let x = 0;
	// 	masks.push(
	// 		mask
	// 			.replace(/X/g, r => {
	// 				return repl[x++];
	// 			})
	// 			.trim()
	// 	);
	// }
	return masks;
}
async function p2020day14_part2(input: string) {
	const lines = input.split("\n");
	const data: { mask: string; nums: [bigint, bigint][] }[] = [];
	let current: any;
	let memory: Obj<bigint> = {};
	for (const line of lines) {
		if (line.startsWith("mask =")) {
			current = { nums: [] };
			data.push(current);
			current.mask = line.substr(6);
		} else {
			const [l, r] = /mem\[(\d+)\] = (\d+)/.exec(line)!.slice(1).map(BigInt);
			current.nums.push([l, r]);
		}
	}

	for (const i of data) {
		const mask = i.mask;
		const realMask = BigInt(parseInt(mask.replace(/X/g, "0"), 2));
		const allMasks = getAllMasks(mask);
		for (const mem of i.nums) {
			const [l, r] = mem;
			const maskedVal = l | realMask;
			for (const m of allMasks) {
				let strAgain = _.padStart(maskedVal.toString(2), 36, "0");
				for (const n of Object.keys(m)) {
					const split = strAgain.split("");
					split[Number(n) - 1] = m[n];
					strAgain = split.join("");
				}
				const address = parseInt(strAgain, 2);
				memory[Number(address)] = r;
			}
		}
	}
	return Object.values(memory).reduce((p, c) => p + c, 0n);
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `mask = XXXXXXXXXXXXXXXXXXXXXXXXXXXXX1XXXX0X
mem[8] = 11
mem[7] = 101
mem[8] = 0`,
			expected: `165`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `mask = 000000000000000000000000000000X1001X
mem[42] = 100
mask = 00000000000000000000000000000000X0XX
mem[26] = 1`,
			expected: `208`,
		},
	];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2020day14_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2020day14_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2020day14_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2020day14_part2(input));
	const part2After = performance.now();

	logSolution(14, 2020, part1Solution, part2Solution);

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
