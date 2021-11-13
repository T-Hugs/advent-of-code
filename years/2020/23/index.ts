import _, { pick } from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { decodedTextSpanIntersectsWith } from "typescript";

const YEAR = 2020;
const DAY = 23;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2020/23/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2020/23/data.txt
// problem url  : https://adventofcode.com/2020/day/23

async function p2020day23_part1(input: string) {
	const nodeMap: Node[] = new Array(9);
	let current: Node = new Node(Number(input[0]), null as any, null as any);
	nodeMap[Number(input[0])] = current;
	let prev = current;
	for (const char of input.slice(1)) {
		const node = new Node(Number(char), null as any, prev);
		nodeMap[node.val] = node;
		prev.next = node;
		prev = node;
	}
	prev.next = current;
	current.prev = prev;

	const cupLen = 9;
	for (let i = 0; i < 100; ++i) {
		const pickUp1 = current.next;
		const pickUp2 = pickUp1.next;
		const pickUp3 = pickUp2.next;

		pickUp1.prev.next = pickUp3.next;
		pickUp3.next.prev = pickUp1.prev;

		let destNum = util.mod(current.val - 1 - 1, cupLen) + 1;
		let x = 2;
		while (pickUp1.val === destNum || pickUp2.val === destNum || pickUp3.val === destNum) {
			destNum = util.mod(current.val - x++ - 1, cupLen) + 1;
		}
		const destNode = nodeMap[destNum];
		const afterDest = destNode.next;
		destNode.next = pickUp1;
		afterDest.prev = pickUp3;
		pickUp1.prev = destNode;
		pickUp3.next = afterDest;

		current = current.next;
	}
	let answer = "";
	let next = nodeMap[1].next;
	for (let i = 0; i < 8; ++i) {
		answer += next.val;
		next = next.next;
	}
	return answer;
}

class Node {
	val: number;
	next: Node;
	prev: Node;
	constructor(val: number, next: Node, prev: Node) {
		this.val = val;
		this.next = next;
		this.prev = prev;
	}
}
async function p2020day23_part2(input: string) {
	const nodeMap: Node[] = new Array(1000001);
	let current: Node = new Node(Number(input[0]), null as any, null as any);
	nodeMap[Number(input[0])] = current;
	let prev = current;
	for (const char of input.slice(1)) {
		const node = new Node(Number(char), null as any, prev);
		nodeMap[node.val] = node;
		prev.next = node;
		prev = node;
	}
	for (let i = input.length; i < 1000000; ++i) {
		const node = new Node(i + 1, null as any, prev);
		nodeMap[node.val] = node;
		prev.next = node;
		prev = node;
	}
	prev.next = current;
	current.prev = prev;

	const cupLen = 1000000;
	for (let i = 0; i < 10_000_000; ++i) {
		const pickUp1 = current.next;
		const pickUp2 = pickUp1.next;
		const pickUp3 = pickUp2.next;

		pickUp1.prev.next = pickUp3.next;
		pickUp3.next.prev = pickUp1.prev;

		let destNum = util.mod(current.val - 1 - 1, cupLen) + 1;
		let x = 2;
		while (pickUp1.val === destNum || pickUp2.val === destNum || pickUp3.val === destNum) {
			destNum = util.mod(current.val - x++ - 1, cupLen) + 1;
		}
		const destNode = nodeMap[destNum];
		const afterDest = destNode.next;
		destNode.next = pickUp1;
		afterDest.prev = pickUp3;
		pickUp1.prev = destNode;
		pickUp3.next = afterDest;

		current = current.next;
	}
	const oneNode = nodeMap[1];
	return oneNode.next.val * oneNode.next.next.val;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `389125467`,
			expected: `67384529`,
		},
	];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2020day23_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2020day23_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2020day23_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2020day23_part2(input));
	const part2After = performance.now();

	logSolution(23, 2020, part1Solution, part2Solution);

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
