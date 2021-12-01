import _, { first, startsWith } from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2016;
const DAY = 21;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2016/21/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2016/21/data.txt
// problem url  : https://adventofcode.com/2016/day/21

function swapIndex(word: string, firstIndex: number, secondIndex: number, undo: boolean = false): string {
	const wordA = word.split("");
	const [firstLetter, secondLetter] = [wordA[firstIndex], wordA[secondIndex]];
	wordA[firstIndex] = secondLetter;
	wordA[secondIndex] = firstLetter;
	return wordA.join("");
}

function swapLetter(word: string, firstLetter: string, secondLetter: string, undo: boolean = false): string {
	const newWord = new Array(word.length);
	for (let i = 0; i < word.length; i++) {
		if (word[i] === firstLetter) {
			newWord[i] = secondLetter;
		} else if (word[i] === secondLetter) {
			newWord[i] = firstLetter;
		} else {
			newWord[i] = word[i];
		}
	}
	return newWord.join("");
}

function reverse(word: string, start: number, end: number, undo: boolean = false): string {
	const startPart = word.substr(0, start);
	const endPart = word.substr(end + 1);
	const middlePart = word.substr(start, end - start + 1);

	return startPart + middlePart.split("").reverse().join("") + endPart;
}

function moveLetter(word: string, from: number, to: number, undo: boolean = false): string {
	if (undo) {
		[from, to] = [to, from];
	}
	const wordA = word.split("");
	const letter = wordA[from];
	wordA.splice(from, 1);
	wordA.splice(to, 0, letter);
	return wordA.join("");
}

function rotateRight(word: string, count: number, undo: boolean = false): string {
	if (undo) {
		count *= -1;
	}
	count = util.mod(count, word.length);
	const firstPart = word.slice(-count);
	const secondPart = word.slice(0, -count);
	return firstPart + secondPart;
}

function rotateLeft(word: string, count: number, undo: boolean = false): string {
	return rotateRight(word, -count, undo);
}

function rotateLetter(word: string, letter: string, undo: boolean = false): string {
	if (!undo) {
		const index = word.indexOf(letter);
		const count = 1 + index + (index >= 4 ? 1 : 0);
		return rotateRight(word, count, undo);
	} else {
		let count = 1;
		while (true) {
			const leftRotated = rotateLeft(word, count);
			if (rotateLetter(leftRotated, letter) === word) {
				return leftRotated;
			}
			count++;
		}
	}
}

function handleInstruction(word: string, instruction: string, undo: boolean = false): string {
	const instructionWords = instruction.split(" ");
	if (instructionWords[0] === "swap" && instructionWords[1] === "position") {
		return swapIndex(word, parseInt(instructionWords[2], 10), parseInt(instructionWords[5], 10), undo);
	}
	if (instructionWords[0] === "swap" && instructionWords[1] === "letter") {
		return swapLetter(word, instructionWords[2], instructionWords[5], undo);
	}
	if (instructionWords[0] === "rotate" && instructionWords[1] === "left") {
		return rotateLeft(word, parseInt(instructionWords[2], 10), undo);
	}
	if (instructionWords[0] === "rotate" && instructionWords[1] === "right") {
		return rotateRight(word, parseInt(instructionWords[2], 10), undo);
	}
	if (instructionWords[0] === "rotate" && instructionWords[1] === "based") {
		return rotateLetter(word, instructionWords[6], undo);
	}
	if (instructionWords[0] === "reverse") {
		return reverse(word, parseInt(instructionWords[2], 10), parseInt(instructionWords[4], 10), undo);
	}
	if (instructionWords[0] === "move") {
		return moveLetter(word, parseInt(instructionWords[2], 10), parseInt(instructionWords[5], 10), undo);
	}
	throw new Error("Unknown instruction: " + instruction);
}

async function p2016day21_part1(input: string, ...extraArgs: any[]) {
	const lines = input.split(/\r?\n/);

	let pw = extraArgs[0];
	for (const line of lines) {
		pw = handleInstruction(pw, line);
	}
	return pw;
}

async function p2016day21_part2(input: string, ...extraArgs: any[]) {
	const startStr = extraArgs[0] as string;
	const lines = input.split(/\r?\n/);
	const reversedLines = lines.slice().reverse();

	let pw = startStr;
	for (const line of reversedLines) {
		pw = handleInstruction(pw, line, true);
	}
	return pw;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `swap position 4 with position 0
swap letter d with letter b
reverse positions 0 through 4
rotate left 1 step
move position 1 to position 4
move position 3 to position 0
rotate based on position of letter b
rotate based on position of letter d`,
			extraArgs: ["abcde"],
			expected: `decab`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `swap position 4 with position 0
swap letter d with letter b
reverse positions 0 through 4
rotate left 1 step
move position 1 to position 4
move position 3 to position 0
rotate based on position of letter b
rotate based on position of letter d`,
			extraArgs: ["decab"],
			expected: `abcde`,
		},
		{
			input: `rotate right 1 step
swap position 2 with position 4
rotate based on position of letter g
rotate left 4 steps
swap position 6 with position 0
swap letter h with letter a
swap letter d with letter c
reverse positions 2 through 4
swap position 2 with position 4
swap letter d with letter e
reverse positions 1 through 5
swap letter b with letter a
rotate right 0 steps
swap position 7 with position 3
move position 2 to position 1
reverse positions 2 through 5
reverse positions 4 through 7
reverse positions 2 through 7
swap letter e with letter c
swap position 1 with position 7
swap position 5 with position 7
move position 3 to position 6
swap position 7 with position 2
move position 0 to position 7
swap position 3 with position 7
reverse positions 3 through 6
move position 0 to position 5
swap letter h with letter c
reverse positions 2 through 3
swap position 2 with position 3
move position 4 to position 0
rotate based on position of letter g
rotate based on position of letter g
reverse positions 0 through 2
swap letter e with letter d
reverse positions 2 through 5
swap position 6 with position 0
swap letter a with letter g
swap position 2 with position 5
reverse positions 2 through 3
swap letter b with letter d
reverse positions 3 through 7
swap position 2 with position 5
swap letter d with letter b
reverse positions 0 through 3
swap letter e with letter g
rotate based on position of letter h
move position 4 to position 3
reverse positions 0 through 6
swap position 4 with position 1
swap position 6 with position 4
move position 7 to position 5
swap position 6 with position 4
reverse positions 5 through 6
move position 0 to position 6
swap position 5 with position 0
reverse positions 2 through 5
rotate right 0 steps
swap position 7 with position 0
swap position 0 with position 2
swap position 2 with position 5
swap letter h with letter c
rotate left 1 step
reverse positions 6 through 7
swap letter g with letter a
reverse positions 3 through 7
move position 2 to position 4
reverse positions 0 through 6
rotate based on position of letter g
swap position 0 with position 6
move position 2 to position 0
rotate left 3 steps
reverse positions 2 through 5
rotate based on position of letter a
reverse positions 1 through 4
move position 2 to position 3
rotate right 2 steps
rotate based on position of letter f
rotate based on position of letter f
swap letter g with letter a
rotate right 0 steps
swap letter f with letter h
swap letter f with letter b
swap letter d with letter e
swap position 0 with position 7
move position 3 to position 0
swap position 3 with position 0
rotate right 4 steps
rotate based on position of letter a
reverse positions 0 through 7
rotate left 6 steps
swap letter d with letter h
reverse positions 0 through 4
rotate based on position of letter f
move position 5 to position 3
move position 1 to position 3
move position 6 to position 0
swap letter f with letter c
rotate based on position of letter h
reverse positions 6 through 7`,
			extraArgs: ["baecdfgh"],
			expected: `abcdefgh`,
		},
	];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2016day21_part1(testCase.input, ...(testCase.extraArgs ?? []))));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2016day21_part2(testCase.input, ...(testCase.extraArgs ?? []))));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2016day21_part1(input, "abcdefgh"));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2016day21_part2(input, "fbgdceah"));
	const part2After = performance.now();

	logSolution(21, 2016, part1Solution, part2Solution);

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
