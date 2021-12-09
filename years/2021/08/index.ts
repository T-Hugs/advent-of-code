import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2021;
const DAY = 8;

// solution path: C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\08\index.ts
// data path    : C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\08\data.txt
// problem url  : https://adventofcode.com/2021/day/8

async function p2021day8_part1(input: string, ...params: any[]) {
	const lines = input.split("\n");
	let count = 0;
	for (const line of lines) {
		const [_, second] = line.split(" | ");
		const rightWords = second.split(" ");
		for (const word of rightWords) {
			if ([2, 4, 3, 7].includes(word.length)) {
				count++;
			}
		}
	}
	return count;
}

function setEquals(set1: Set<any>, set2: Set<any>) {
	if (set1.size !== set2.size) {
		return false;
	}
	for (const item of set1) {
		if (!set2.has(item)) {
			return false;
		}
	}
	return true;
}

function getMapping(digits: string[]) {
	const numberMap: { [key: string]: Set<string> } = {
		0: new Set(),
		1: new Set(),
		2: new Set(),
		3: new Set(),
		4: new Set(),
		5: new Set(),
		6: new Set(),
		7: new Set(),
		8: new Set(),
		9: new Set(),
	};
	const one = digits.find(d => d.length === 2);
	if (one) {
		numberMap[1].add(one[0]);
		numberMap[1].add(one[1]);
	}
	const seven = digits.find(d => d.length === 3);
	if (seven) {
		numberMap[7].add(seven[0]);
		numberMap[7].add(seven[1]);
		numberMap[7].add(seven[2]);
	}
	const four = digits.find(d => d.length === 4);
	if (four) {
		for (const s of four) {
			numberMap[4].add(s);
		}
	}
	const eight = digits.find(d => d.length === 7);
	if (eight) {
		for (const s of eight) {
			numberMap[8].add(s);
		}
	}

	const canBe235 = digits.filter(d => d.length === 5);
	const canBe069 = digits.filter(d => d.length === 6);

	for (const d of canBe235) {
		const intersect1 = _.intersection(d.split(""), Array.from(numberMap[1]));
		const intersect4 = _.intersection(d.split(""), Array.from(numberMap[4]));
		if (intersect1.length === 2) {
			for (const s of d) {
				numberMap[3].add(s);
			}
		} else if (intersect4.length === 3) {
			for (const s of d) {
				numberMap[5].add(s);
			}
		} else {
			for (const s of d) {
				numberMap[2].add(s);
			}
		}
	}

	for (const d of canBe069) {
		const intersect4 = _.intersection(d.split(""), Array.from(numberMap[4]));
		const intersect1 = _.intersection(d.split(""), Array.from(numberMap[1]));
		if (intersect4.length === 4) {
			for (const s of d) {
				numberMap[9].add(s);
			}
		} else if (intersect1.length === 2) {
			for (const s of d) {
				numberMap[0].add(s);
			}
		} else {
			for (const s of d) {
				numberMap[6].add(s);
			}
		}
	}
	return numberMap;
}

async function p2021day8_part2(input: string, ...params: any[]) {
	const lines = input.split("\n");
	let sum = 0;
	for (const line of lines) {
		const [first, second] = line.split(" | ");
		const leftWords = first.split(" ");
		const numberMap = getMapping(leftWords);
		const rightWords = second.split(" ");
		let fullNum = "";
		for (const word of rightWords) {
			for (const [num, segments] of Object.entries(numberMap)) {
				const wordSet = new Set(word.split(""));
				if (setEquals(wordSet, segments)) {
					fullNum += num;
					break;
				}
			}
		}
		sum += parseInt(fullNum, 10);
	}
	return sum;
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [
		{
			input: `acedgfb cdfbe gcdfa fbcad dab cefabd cdfgeb eafb cagedb ab | cdfeb fcadb cdfeb cdbaf`,
			extraArgs: [],
			expected: `5353`,
		},
		{
			input: `be cfbegad cbdgef fgaecd cgeb fdcge agebfd fecdb fabcd edb | fdgacbe cefdb cefbgd gcbe
edbfga begcd cbg gc gcadebf fbgde acbgfd abcde gfcbed gfec | fcgedb cgb dgebacf gc
fgaebd cg bdaec gdafb agbcfd gdcbef bgcad gfac gcb cdgabef | cg cg fdcagb cbg
fbegcd cbd adcefb dageb afcb bc aefdc ecdab fgdeca fcdbega | efabcd cedba gadfec cb
aecbfdg fbg gf bafeg dbefa fcge gcbea fcaegb dgceab fcbdga | gecf egdcabf bgf bfgea
fgeab ca afcebg bdacfeg cfaedg gcfdb baec bfadeg bafgc acf | gebdcfa ecba ca fadegcb
dbcfg fgd bdegcaf fgec aegbdf ecdfab fbedc dacgb gdcebf gf | cefg dcbef fcge gbcadfe
bdfegc cbegaf gecbf dfcage bdacg ed bedf ced adcbefg gebcd | ed bcgafe cdgba cbgef
egadfb cdbfeg cegd fecab cgb gbdefca cg fgcdab egfdb bfceg | gbdfcae bgc cg cgb
gcafb gcf dcaebfg ecagb gf abcdeg gaef cafbge fdbac fegbdc | fgae cfgab fg bagce`,
			extraArgs: [],
			expected: `61229`,
		},
	];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2021day8_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2021day8_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2021day8_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2021day8_part2(input));
	const part2After = performance.now();

	logSolution(8, 2021, part1Solution, part2Solution);

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
