import _, { first, startsWith } from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import * as LOGUTIL from "../../../util/log";
import { performance } from "perf_hooks";
const { log, logSolution, trace } = LOGUTIL;

const YEAR = 2016;
const DAY = 21;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2016/21/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2016/21/data.txt
// problem url  : https://adventofcode.com/2016/day/21

async function p2016day21_part1(input: string) {
	const lines = input.split("\n");
	let list = "abcdefgh".split("");
	for (const line of lines) {
		const words = line.split(" ");
		const op = words[0];
		if (op === "rotate") {
			const second = words[1];
			let numSteps = -1;
			let dir = 1;
			if (second === "based") {
				const letter = words[6];
				numSteps = list.indexOf(letter) + 1;
				if (numSteps >= 5) {
					numSteps += 1;
				}
			} else {
				numSteps = Number(words[2]);
				dir = second === "left" ? -1 : 1;
			}
			// abcdefg ==> 3 => efgabcd
			// abcdefg <== 3 => defgabc
			const breakpoint = util.mod(numSteps, list.length) * dir;
			const firstPart = list.slice(-breakpoint);
			const secondPart = list.slice(0, -breakpoint);
			list = [...firstPart, ...secondPart];
		} else if (op === "swap") {
			if (words[1] === "position") {
				const firstPos = Number(words[2]);
				const secondPos = Number(words[5]);
				[list[firstPos], list[secondPos]] = [list[secondPos], list[firstPos]];
			} else {
				const firstLetter = words[2];
				const secondLetter = words[5];
				const firstLetterIndex = list.indexOf(firstLetter);
				const secondLetterIndex = list.indexOf(secondLetter);
				[list[firstLetterIndex], list[secondLetterIndex]] = [list[secondLetterIndex], list[firstLetterIndex]];
			}
		} else if (op === "reverse") {
			const firstPos = Number(words[2]);
			const secondPos = Number(words[4]);
			const sublist = list.slice(firstPos, secondPos + 1);
			list.splice(firstPos, sublist.length, ...sublist.reverse());
		} else if (op === "move") {
			const firstPos = Number(words[2]);
			const secondPos = Number(words[5]);
			const removed = list[firstPos];
			list.splice(firstPos, 1);
			list.splice(secondPos, 0, removed);
		} else {
			throw new Error("Unknown operation.");
		}
	}

	return list.join("");
}

function getReverseMap(count: number): { [key: number]: number } {
	if (count === 5) {
		return { 1: 0, 3: 1, 0: 4, 2: 3, 4: 2 };
	} else if (count === 8) {
		return { 1: 0, 3: 1, 5: 2, 7: 3, 2: 4, 4: 5, 6: 6, 0: 7 };
	} else {
		throw new Error("Don't know the reverse map.");
	}
}
// 01234 => 0:1, 1:3, 2:0, 3:2, 4:0
// 01234567 => 0:1, 1:3, 2:5, 3:7, 4:2, 5:4, 6:6, 7:0 (less than 4)
// 01234567 => 0:2, 1:4, 2:6, 3:0, 4:1, 5:3, 6:5, 7:7
async function p2016day21_part2(input: string, ...extraArgs: any[]) {
	const startStr: string = extraArgs[0] ?? "fbgdceah";
	const reverseMap = getReverseMap(startStr.length);
	const lines = input.split("\n").reverse();
	let list = startStr.split("");
	for (const line of lines) {
		const words = line.split(" ");
		const op = words[0];
		if (op === "rotate") {
			const second = words[1];
			let numSteps = -1;
			let dir = 1;
			let letter = undefined;
			if (second === "based") {
				letter = words[6];
				numSteps = reverseMap[list.indexOf(letter)];
			} else {
				numSteps = Number(words[2]);
				dir = second === "left" ? -1 : 1;
			}
			dir *= -1;
			// abcdefg ==> 3 => efgabcd
			// abcdefg <== 3 => defgabc

			const breakpoint = util.mod(numSteps, list.length) * dir;
			const firstPart = list.slice(-breakpoint);
			const secondPart = list.slice(0, -breakpoint);
			list = [...firstPart, ...secondPart];
		} else if (op === "swap") {
			if (words[1] === "position") {
				const firstPos = Number(words[2]);
				const secondPos = Number(words[5]);
				[list[firstPos], list[secondPos]] = [list[secondPos], list[firstPos]];
			} else {
				const firstLetter = words[2];
				const secondLetter = words[5];
				const firstLetterIndex = list.indexOf(firstLetter);
				const secondLetterIndex = list.indexOf(secondLetter);
				[list[firstLetterIndex], list[secondLetterIndex]] = [list[secondLetterIndex], list[firstLetterIndex]];
			}
		} else if (op === "reverse") {
			const firstPos = Number(words[2]);
			const secondPos = Number(words[4]);
			const sublist = list.slice(firstPos, secondPos + 1);
			list.splice(firstPos, sublist.length, ...sublist.reverse());
		} else if (op === "move") {
			const firstPos = Number(words[5]);
			const secondPos = Number(words[2]);
			const removed = list[firstPos];
			list.splice(firstPos, 1);
			list.splice(secondPos, 0, removed);
		} else {
			throw new Error("Unknown operation.");
		}
	}

	return list.join("");
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
		test.logTestResult(testCase, String(await p2016day21_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2016day21_part2(testCase.input, ...(testCase.extraArgs ?? []))));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2016day21_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2016day21_part2(input));
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
