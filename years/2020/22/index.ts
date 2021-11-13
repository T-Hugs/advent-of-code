import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2020;
const DAY = 22;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2020/22/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2020/22/data.txt
// problem url  : https://adventofcode.com/2020/day/22

async function p2020day22_part1(input: string) {
	const lines = input.split("\n");
	const p1Cards: number[] = [];
	const p2Cards: number[] = [];
	let onP2 = false;
	for (const line of lines) {
		if (line.trim() === "") {
			continue;
		}
		if (line.startsWith("Player 1")) {
			continue;
		}
		if (line.startsWith("Player 2")) {
			onP2 = true;
			continue;
		}
		const card = Number(line);
		if (onP2) {
			p2Cards.push(card);
		} else {
			p1Cards.push(card);
		}
	}

	while (true) {
		const p1Card = p1Cards.shift();
		const p2Card = p2Cards.shift();
		if (p1Card == undefined || p2Card == undefined) {
			if (p1Card == undefined) {
				p2Cards.unshift(p2Card!);
				let score = 0;
				for (let i = 0; i < p2Cards.length; ++i) {
					const card = p2Cards[p2Cards.length - i - 1];
					score += (i + 1) * card;
				}
				return score;
			}
			if (p2Card == undefined) {
				p1Cards.unshift(p1Card!);
				let score = 0;
				for (let i = 0; i < p1Cards.length; ++i) {
					const card = p1Cards[p1Cards.length - i - 1];
					score += (i + 1) * card;
				}
				return score;
			}
		}
		if (p1Card > p2Card) {
			p1Cards.push(p1Card, p2Card);
		} else {
			p2Cards.push(p2Card, p1Card);
		}
	}
}

async function p2020day22_part2(input: string) {
	const lines = input.split("\n");
	const p1Cards: number[] = [];
	const p2Cards: number[] = [];
	let onP2 = false;
	for (const line of lines) {
		if (line.trim() === "") {
			continue;
		}
		if (line.startsWith("Player 1")) {
			continue;
		}
		if (line.startsWith("Player 2")) {
			onP2 = true;
			continue;
		}
		const card = Number(line);
		if (onP2) {
			p2Cards.push(card);
		} else {
			p1Cards.push(card);
		}
	}
	const result = playGame(p1Cards, p2Cards);
	const winnerCards = result.p1cards.length > 0 ? result.p1cards : result.p2cards;

	let score = 0;
	for (let i = 0; i < winnerCards.length; ++i) {
		const card = winnerCards[winnerCards.length - i - 1];
		score += (i + 1) * card;
	}
	return score;
}

function hash(p1cards: number[], p2cards: number[]) {
	return p1cards.join(",") + "|" + p2cards.join(",");
}

const gameMemo: Map<string, { p1cards: number[]; p2cards: number[] }> = new Map();
function playGame(p1cards: number[], p2cards: number[], depth = 0) {
	const gameHash = hash(p1cards, p2cards);
	if (gameMemo.has(gameHash)) {
		return gameMemo.get(gameHash)!;
	}
	const memo: Set<string> = new Set();
	while (true) {
		const roundHash = hash(p1cards, p2cards);
		let p1win = false;
		if (memo.has(roundHash)) {
			p1win = true;
		}
		memo.add(roundHash);
		const p1 = p1cards.shift();
		const p2 = p2cards.shift();
		if (p1 == undefined || p2 == undefined) {
			if (p1 == undefined) {
				p2cards.unshift(p2!);
			} else {
				p1cards.unshift(p1!);
			}
			gameMemo.set(gameHash, { p1cards, p2cards });
			return { p1cards, p2cards };
		}
		const p1remain = p1cards.length;
		const p2remain = p2cards.length;
		let winnerCard: number;
		let loserCard: number;
		let winnerDeck: number[] = [];
		if (p1win) {
			winnerCard = p1;
			loserCard = p2;
			winnerDeck = p1cards;
		} else if (p1 <= p1remain && p2 <= p2remain) {
			// recurse
			const p1new = p1cards.slice(0, p1);
			const p2new = p2cards.slice(0, p2);
			const result = playGame(p1new, p2new, depth + 1);
			if (result.p1cards.length > 0) {
				winnerCard = p1;
				loserCard = p2;
				winnerDeck = p1cards;
			} else {
				winnerCard = p2;
				loserCard = p1;
				winnerDeck = p2cards;
			}
		} else {
			if (p1 > p2) {
				winnerCard = p1;
				loserCard = p2;
				winnerDeck = p1cards;
			} else {
				winnerCard = p2;
				loserCard = p1;
				winnerDeck = p2cards;
			}
		}
		winnerDeck.push(winnerCard, loserCard);
	}
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `Player 1:
9
2
6
3
1

Player 2:
5
8
4
7
10`,
			expected: `306`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `Player 1:
9
2
6
3
1

Player 2:
5
8
4
7
10`,
			expected: `291`,
		},
	];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2020day22_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2020day22_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2020day22_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2020day22_part2(input));
	const part2After = performance.now();

	logSolution(22, 2020, part1Solution, part2Solution);

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
