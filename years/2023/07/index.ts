import _, { max } from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2023;
const DAY = 7;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/07/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/07/data.txt
// problem url  : https://adventofcode.com/2023/day/7

const cardRanks = Object.fromEntries("AKQJT98765432".split("").map((c, i) => [c, i]));
const cardRanksJoker = Object.fromEntries("AKQT98765432J".split("").map((c, i) => [c, i]));
function getCardRank(card: string, useJoker = false) {
	if (useJoker) {
		return cardRanksJoker[card];
	} else {
		return cardRanks[card];
	}
}
function getHandRank(hand: string, useJoker = false) {
	if (useJoker) {
		// ignore jacks when getting unique elements
		const uniqueElements = util.countUniqueElements(
			hand
				.split("")
				.filter(c => c !== "J")
				.join("")
		);
		let qtys = [...Object.values(uniqueElements)];
		let cards = [...Object.keys(uniqueElements)];
		const maxQty = util.max(qtys, undefined, true);

		return getHandRank(
			hand
				.split("")
				.map(c => (c === "J" ? cards[maxQty.index] : c))
				.join("") || "AAAAA", // in the event we had all jacks
			false
		);
	}
	const uniqueElements = util.countUniqueElements(hand);
	let qtys = [...Object.values(uniqueElements)];
	let cards = [...Object.keys(uniqueElements)];

	if (qtys.length === 1) {
		if (qtys[0] !== 5) {
			throw new Error("Should be 5");
		}
		return 0;
	}
	if (qtys.includes(4)) {
		if (qtys.length !== 2) {
			throw new Error("Should be of length 2");
		}
		return 1;
	}
	if (qtys.length === 2) {
		if (!(qtys.includes(2) && qtys.includes(3))) {
			throw new Error("Not a full house?");
		}
		return 2;
	}
	if (qtys.includes(3)) {
		return 3;
	}
	const twoCount = qtys.filter(x => x === 2);
	if (twoCount.length === 2) {
		return 4;
	}
	if (twoCount.length === 1) {
		return 5;
	}
	if (qtys.filter(x => x === 1).length === 5) {
		return 6;
	}
	throw new Error("What?");
}

async function p2023day7_part1(input: string, ...params: any[]) {
	const lines = input.split("\n");
	const hands: [string, number][] = [];
	for (const line of lines) {
		const [hand, bid] = line.split(" ");
		hands.push([hand, Number(bid)]);
	}

	hands.sort((a, b) => {
		const aRank = getHandRank(a[0]);
		const bRank = getHandRank(b[0]);
		if (aRank !== bRank) {
			return aRank - bRank;
		}
		for (let i = 0; i < a[0].length; ++i) {
			if (a[0][i] !== b[0][i]) {
				return getCardRank(a[0][i]) - getCardRank(b[0][i]);
			}
		}
		return 0;
	});
	hands.reverse();
	let total = 0;
	for (let i = 0; i < hands.length; ++i) {
		const points = hands[i][1] * (i + 1);
		total += points;
	}
	return total;
}

async function p2023day7_part2(input: string, ...params: any[]) {
	const lines = input.split("\n");
	const hands: [string, number][] = [];
	for (const line of lines) {
		const [hand, bid] = line.split(" ");
		hands.push([hand, Number(bid)]);
	}

	hands.sort((a, b) => {
		const aRank = getHandRank(a[0], true);
		const bRank = getHandRank(b[0], true);
		if (aRank !== bRank) {
			return aRank - bRank;
		}
		for (let i = 0; i < a[0].length; ++i) {
			if (a[0][i] !== b[0][i]) {
				return getCardRank(a[0][i], true) - getCardRank(b[0][i], true);
			}
		}
		return 0;
	});
	hands.reverse();
	let total = 0;
	for (let i = 0; i < hands.length; ++i) {
		const points = hands[i][1] * (i + 1);
		total += points;
	}
	return total;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `32T3K 765
T55J5 684
KK677 28
KTJJT 220
QQQJA 483`,
			extraArgs: [],
			expected: `6440`,
			expectedPart2: `5905`,
		},
	];
	const part2tests: TestCase[] = [];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2023day7_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2023day7_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2023day7_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2023day7_part2(input));
	const part2After = performance.now();

	logSolution(7, 2023, part1Solution, part2Solution);

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
