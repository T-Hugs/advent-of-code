import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2021;
const DAY = 18;

// solution path: C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\18\index.ts
// data path    : C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\18\data.txt
// problem url  : https://adventofcode.com/2021/day/18

class SFN {
	public parent?: SFN;
	// public lhs: SFN | number;
	// public rhs: SFN | number;
	constructor(public lhs: SFN | number, public rhs: SFN | number) {
		// if (typeof lhs === "number") {
		// 	this.lhs = lhs;
		// } else {
		// 	this.lhs = lhs.deepCopy();
		// }
		// if (typeof rhs === "number") {
		// 	this.rhs = rhs;
		// } else {
		// 	this.rhs = rhs.deepCopy();
		// }
	}

	public toString(): string {
		return `[${this.lhs.toString()},${this.rhs.toString()}]`;
	}

	public deepCopy(): SFN {
		return parseSFN(this.toString());
	}

	public magnitude(): number {
		const lhs = typeof this.lhs === "number" ? this.lhs : this.lhs.magnitude();
		const rhs = typeof this.rhs === "number" ? this.rhs : this.rhs.magnitude();
		return 3 * lhs + 2 * rhs;
	}

	public add(...addins: (SFN | number)[]): SFN {
		let current: SFN = this;
		for (const addin of addins) {
			const newSFN = new SFN(current, addin);
			current.parent = newSFN;
			if (typeof addin !== "number") {
				addin.parent = newSFN;
			}
			while (true) {
				const exploded = newSFN.explode();
				if (!exploded) {
					const split = newSFN.split();
					if (!split) {
						break;
					}
				}
			}
			current = newSFN;
		}
		return current;
	}

	public nextLeafParent(from: "left" | "right"): SFN | undefined {
		return this.adjacentLeafParent(true, from);
	}

	public prevLeafParent(from: "left" | "right"): SFN | undefined {
		return this.adjacentLeafParent(false, from);
	}

	private adjacentLeafParent(next: boolean, from: "left" | "right"): SFN | undefined {
		if (from === (next ? "left" : "right")) {
			let current: SFN = this;
			while (true) {
				let proximate = next ? current.lhs : current.rhs;
				if (typeof proximate === "number") {
					return current;
				} else {
					current = proximate;
				}
			}
		} else {
			let current: SFN = this;
			while (true) {
				if (!current.parent) {
					return undefined;
				}
				if (current === (next ? current.parent.lhs : current.parent.rhs)) {
					break;
				}
				current = current.parent;
			}
			let searchNode: SFN = current.parent;
			let first = true;
			while (true) {
				let proximate = next === first ? searchNode.rhs : searchNode.lhs;
				if (typeof proximate === "number") {
					return searchNode;
				} else {
					searchNode = proximate;
				}
				first = false;
			}
		}
	}

	public explode(currentDepth = 0): boolean {
		if (currentDepth >= 4 && typeof this.lhs === "number" && typeof this.rhs === "number") {
			const prev = this.prevLeafParent("left");
			const next = this.nextLeafParent("right");
			if (prev) {
				if (typeof prev.rhs === "number") {
					prev.rhs = prev.rhs + this.lhs;
				} else if (typeof prev.lhs === "number") {
					prev.lhs = prev.lhs + this.lhs;
				}
			}
			if (next) {
				if (typeof next.lhs === "number") {
					next.lhs = next.lhs + this.rhs;
				} else if (typeof next.rhs === "number") {
					next.rhs = next.rhs + this.rhs;
				}
			}
			const isLhs = this.parent && this.parent.lhs === this;
			if (isLhs) {
				this.parent!.lhs = 0;
			} else {
				this.parent!.rhs = 0;
			}
			return true;
		} else {
			if (typeof this.lhs !== "number" && this.lhs.explode(currentDepth + 1)) {
				return true;
			}
			if (typeof this.rhs !== "number" && this.rhs.explode(currentDepth + 1)) {
				return true;
			}
		}
		return false;
	}

	public split(): boolean {
		if (typeof this.lhs === "number") {
			if (this.lhs >= 10) {
				this.lhs = new SFN(Math.floor(this.lhs / 2), Math.ceil(this.lhs / 2));
				this.lhs.parent = this;
				return true;
			}
		} else {
			if (this.lhs.split()) {
				return true;
			}
		}
		if (typeof this.rhs === "number") {
			if (this.rhs >= 10) {
				this.rhs = new SFN(Math.floor(this.rhs / 2), Math.ceil(this.rhs / 2));
				this.rhs.parent = this;
				return true;
			}
		} else {
			if (this.rhs.split()) {
				return true;
			}
		}
		return false;
	}
}

function parseSFN(str: string, rDepth = 0): SFN {
	let pointer = 0;

	// consume left bracket
	pointer++;

	let depth = 0;
	let lhsStart = pointer;
	let lhsEnd = -1;
	let rhsStart = -1;
	let rhsEnd = str.length - 1;
	while (true) {
		const char = str[pointer];
		if (char === "[") {
			depth++;
		} else if (char === "]") {
			depth--;
		} else if (char === "," && depth === 0) {
			lhsEnd = pointer;
			rhsStart = pointer + 1;
			break;
		}
		pointer++;
	}
	const lhs = str.slice(lhsStart, lhsEnd);
	const rhs = str.slice(rhsStart, rhsEnd);

	const lhsNode = /^\d+$/.test(lhs) ? Number(lhs) : parseSFN(lhs, rDepth + 1);
	const rhsNode = /^\d+$/.test(rhs) ? Number(rhs) : parseSFN(rhs, rDepth + 1);

	const result = new SFN(lhsNode, rhsNode);
	if (typeof lhsNode !== "number") {
		lhsNode.parent = result;
	}
	if (typeof rhsNode !== "number") {
		rhsNode.parent = result;
	}
	return result;
}

async function p2021day18_part1(input: string, ...params: any[]) {
	const lines = input.split("\n");
	const allSFNs = lines.map(l => parseSFN(l));
	let sum = allSFNs[0];
	const result = sum.add(...allSFNs.slice(1));
	return result.magnitude();
}

async function p2021day18_part2(input: string, ...params: any[]) {
	const lines = input.split("\n");
	const allSFNs = lines.map(l => parseSFN(l));
	
	let largestMagnitude = Number.MIN_SAFE_INTEGER;
	for (let i = 0; i < allSFNs.length; ++i) {
		for (let j = 0; j < allSFNs.length; ++j) {
			if (i === j) {
				continue;
			}
			const sum = allSFNs[i].deepCopy().add(allSFNs[j].deepCopy());
			const magnitude = sum.magnitude();
			if (magnitude > largestMagnitude) {
				largestMagnitude = magnitude;
			}
		}
	}
	return largestMagnitude;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `[[[0,[5,8]],[[1,7],[9,6]]],[[4,[1,2]],[[1,4],2]]]
[[[5,[2,8]],4],[5,[[9,9],0]]]
[6,[[[6,2],[5,6]],[[7,6],[4,7]]]]
[[[6,[0,7]],[0,9]],[4,[9,[9,0]]]]
[[[7,[6,4]],[3,[1,3]]],[[[5,5],1],9]]
[[6,[[7,3],[3,2]]],[[[3,8],[5,7]],4]]
[[[[5,4],[7,7]],8],[[8,3],8]]
[[9,3],[[9,9],[6,[4,9]]]]
[[2,[[7,7],7]],[[5,8],[[9,3],[0,2]]]]
[[[[5,2],5],[8,[3,7]]],[[5,[7,5]],[4,4]]]`,
			extraArgs: [],
			expected: `4140`,
		},
	];
	const part2tests: TestCase[] = [{
		input: `[[[0,[5,8]],[[1,7],[9,6]]],[[4,[1,2]],[[1,4],2]]]
[[[5,[2,8]],4],[5,[[9,9],0]]]
[6,[[[6,2],[5,6]],[[7,6],[4,7]]]]
[[[6,[0,7]],[0,9]],[4,[9,[9,0]]]]
[[[7,[6,4]],[3,[1,3]]],[[[5,5],1],9]]
[[6,[[7,3],[3,2]]],[[[3,8],[5,7]],4]]
[[[[5,4],[7,7]],8],[[8,3],8]]
[[9,3],[[9,9],[6,[4,9]]]]
[[2,[[7,7],7]],[[5,8],[[9,3],[0,2]]]]
[[[[5,2],5],[8,[3,7]]],[[5,[7,5]],[4,4]]]`,
		extraArgs: [],
		expected: `3993`,
	},];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2021day18_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2021day18_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2021day18_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2021day18_part2(input));
	const part2After = performance.now();

	logSolution(18, 2021, part1Solution, part2Solution);

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
