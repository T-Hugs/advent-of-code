import * as util from "../../../util/util";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";

const YEAR = 2019;
const DAY = 22;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2019/22/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2019/22/data.txt
// problem url  : https://adventofcode.com/2019/day/22

export function linearCut(pos: bigint, cutPos: bigint, deckSize: bigint) {
	return util.bigIntMod(pos - cutPos, deckSize);
}

export function linearDeal(pos: bigint, increment: bigint, deckSize: bigint) {
	return util.bigIntMod(pos * increment, deckSize);
}

export function linearStack(pos: bigint, deckSize: bigint) {
	return (pos - deckSize) * -1n - 1n;
}

export function reverseCut(pos: bigint, cutPos: bigint, deckSize: bigint) {
	return util.bigIntMod(pos + cutPos + deckSize, deckSize);
}

export function reverseDeal(pos: bigint, increment: bigint, deckSize: bigint) {
	return util.bigIntMod(util.modInverse(increment, deckSize) * pos, deckSize);
}

export function reverseStack(pos: bigint, deckSize: bigint) {
	return deckSize - pos - 1n;
}

async function p2019day22_part1(input: string) {
	// Linear solution
	const deckSize = 10007n;
	let cardToFollow = 2019n;

	const lines = input.split("\n");
	for (const line of lines) {
		if (line === "deal into new stack") {
			cardToFollow = linearStack(cardToFollow, deckSize);
		} else if (line.startsWith("deal")) {
			const increment = BigInt(line.split(" ").pop()!.trim());
			cardToFollow = linearDeal(cardToFollow, increment, deckSize);
		} else {
			const cutPos = BigInt(line.split(" ").pop()!.trim());
			cardToFollow = linearCut(cardToFollow, cutPos, deckSize);
		}
	}
	return cardToFollow;
}

// Solution adapted from:
// https://www.reddit.com/r/adventofcode/comments/ee0rqi/2019_day_22_solutions/fbnifwk/
async function p2019day22_part2(input: string, part1Solution: string) {
	const deckSize = 119315717514047n;
	const numShuffles = 101741582076661n;
	const lines = input.split("\n");
	lines.reverse();

	function reverseShuffle(i: bigint, lines: string[]) {
		for (const line of lines) {
			if (line === "deal into new stack") {
				i = reverseStack(i, deckSize);
			} else if (line.startsWith("deal")) {
				const increment = BigInt(line.split(" ").pop()!.trim());
				i = reverseDeal(i, increment, deckSize);
			} else {
				const cutPos = BigInt(line.split(" ").pop()!.trim());
				i = reverseCut(i, cutPos, deckSize);
			}
		}
		return i;
	}

	const targetPos = 2020n;
	const firstShuffle = reverseShuffle(targetPos, lines);
	const secondShuffle = reverseShuffle(firstShuffle, lines);
	const A = util.bigIntMod(
		(firstShuffle - secondShuffle) * util.modInverse(targetPos - firstShuffle + deckSize, deckSize),
		deckSize
	);
	const B = util.bigIntMod(firstShuffle - A * targetPos, deckSize);

	return util.bigIntMod(
		util.powerMod(A, numShuffles, deckSize) * targetPos +
			(util.powerMod(A, numShuffles, deckSize) - 1n) * util.modInverse(A - 1n, deckSize) * B,
		deckSize
	);
}

async function run() {
	const input = await util.getInput(DAY, YEAR);

	const part1Solution = String(await p2019day22_part1(input));
	const part2Solution = String(await p2019day22_part2(input, part1Solution));

	logSolution(22, 2019, part1Solution, part2Solution);
}

run()
	.then(() => {
		process.exit();
	})
	.catch(error => {
		throw error;
	});
