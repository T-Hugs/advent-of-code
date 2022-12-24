import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2022;
const DAY = 11;

// solution path: C:\Users\trgau\dev\t-hugs\advent-of-code\years\2022\11\index.ts
// data path    : C:\Users\trgau\dev\t-hugs\advent-of-code\years\2022\11\data.txt
// problem url  : https://adventofcode.com/2022/day/11

interface Monkey {
	items: number[];
	operator: string;
	operand: string;
	divisorTest: number;
	ifTrue: number;
	ifFalse: number;
	inspections: 0;
}

async function p2022day11_part1(input: string, ...params: any[]) {
	const NUM_ROUNDS = 20;
	const monkeys: Monkey[] = [];
	const groups = input.split("\n\n");
	for (const group of groups) {
		const lines = group.split("\n").map(l => l.trim());
		const startingItems = lines[1].substring("Starting items: ".length).split(", ").map(Number);
		const [operator, operand] = lines[2].substring("Operation: new = old ".length).split(" ");
		const divisorTest = Number(lines[3].substring("Test: divisible by ".length));
		const ifTrue = Number(lines[4].substring("If true: throw to monkey ".length));
		const ifFalse = Number(lines[5].substring("If false: throw to monkey ".length));
		monkeys.push({
			items: startingItems,
			operator,
			operand,
			divisorTest,
			ifTrue,
			ifFalse,
			inspections: 0,
		});
	}

	for (let i = 0; i < NUM_ROUNDS; ++i) {
		for (const monkey of monkeys) {
			while (true) {
				const item = monkey.items.shift();
				if (item) {
					monkey.inspections++;
					const operand = monkey.operand === "old" ? item : Number(monkey.operand);
					const newWorry = Math.floor((monkey.operator === "*" ? item * operand : item + operand) / 3);
					if (newWorry % monkey.divisorTest === 0) {
						// log(`Monkey ${monkeys.indexOf(monkey)} threw ${newWorry} to monkey ${monkey.ifTrue}`);
						monkeys[monkey.ifTrue].items.push(newWorry);
					} else {
						// log(`Monkey ${monkeys.indexOf(monkey)} threw ${newWorry} to monkey ${monkey.ifFalse}`);
						monkeys[monkey.ifFalse].items.push(newWorry);
					}
				} else {
					break;
				}
			}
		}
	}
	const inspections = monkeys.map(m => m.inspections).sort((a, b) => b - a);
	return inspections[0] * inspections[1];
}

async function p2022day11_part2(input: string, ...params: any[]) {
	const NUM_ROUNDS = 10000;
	const monkeys: Monkey[] = [];
	const groups = input.split("\n\n");
	for (const group of groups) {
		const lines = group.split("\n").map(l => l.trim());
		const startingItems = lines[1].substring("Starting items: ".length).split(", ").map(Number);
		const [operator, operand] = lines[2].substring("Operation: new = old ".length).split(" ");
		const divisorTest = Number(lines[3].substring("Test: divisible by ".length));
		const ifTrue = Number(lines[4].substring("If true: throw to monkey ".length));
		const ifFalse = Number(lines[5].substring("If false: throw to monkey ".length));
		monkeys.push({
			items: startingItems,
			operator,
			operand,
			divisorTest,
			ifTrue,
			ifFalse,
			inspections: 0,
		});
	}

	const lcm = Number(util.lcm(monkeys.map(m => BigInt(m.divisorTest))));

	for (let i = 0; i < NUM_ROUNDS; ++i) {
		for (const monkey of monkeys) {
			while (true) {
				const item = monkey.items.shift();
				if (item) {
					monkey.inspections++;
					const operand = monkey.operand === "old" ? item : Number(monkey.operand);
					const newWorry = Math.floor(monkey.operator === "*" ? item * operand : item + operand) % lcm;
					if (newWorry % monkey.divisorTest === 0) {
						// log(`Monkey ${monkeys.indexOf(monkey)} threw ${newWorry} to monkey ${monkey.ifTrue}`);
						monkeys[monkey.ifTrue].items.push(newWorry);
					} else {
						// log(`Monkey ${monkeys.indexOf(monkey)} threw ${newWorry} to monkey ${monkey.ifFalse}`);
						monkeys[monkey.ifFalse].items.push(newWorry);
					}
				} else {
					break;
				}
			}
		}
	}
	const inspections = monkeys.map(m => m.inspections).sort((a, b) => b - a);
	return inspections[0] * inspections[1];
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `Monkey 0:
Starting items: 79, 98
Operation: new = old * 19
Test: divisible by 23
	If true: throw to monkey 2
	If false: throw to monkey 3

Monkey 1:
Starting items: 54, 65, 75, 74
Operation: new = old + 6
Test: divisible by 19
	If true: throw to monkey 2
	If false: throw to monkey 0

Monkey 2:
Starting items: 79, 60, 97
Operation: new = old * old
Test: divisible by 13
	If true: throw to monkey 1
	If false: throw to monkey 3

Monkey 3:
Starting items: 74
Operation: new = old + 3
Test: divisible by 17
	If true: throw to monkey 0
	If false: throw to monkey 1
`,
			extraArgs: [],
			expected: `10605`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `Monkey 0:
Starting items: 79, 98
Operation: new = old * 19
Test: divisible by 23
If true: throw to monkey 2
If false: throw to monkey 3

Monkey 1:
Starting items: 54, 65, 75, 74
Operation: new = old + 6
Test: divisible by 19
If true: throw to monkey 2
If false: throw to monkey 0

Monkey 2:
Starting items: 79, 60, 97
Operation: new = old * old
Test: divisible by 13
If true: throw to monkey 1
If false: throw to monkey 3

Monkey 3:
Starting items: 74
Operation: new = old + 3
Test: divisible by 17
If true: throw to monkey 0
If false: throw to monkey 1
`,
			extraArgs: [],
			expected: `2713310158`,
		},
	];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2022day11_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2022day11_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2022day11_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2022day11_part2(input));
	const part2After = performance.now();

	logSolution(11, 2022, part1Solution, part2Solution);

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
