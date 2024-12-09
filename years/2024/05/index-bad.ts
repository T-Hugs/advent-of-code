import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2024;
const DAY = 5;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2024/05/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2024/05/data.txt
// problem url  : https://adventofcode.com/2024/day/5
type Comparator<T> = (a: T, b: T) => number | null;

function customSort<T>(arr: T[], comparer: Comparator<T>): T[] {
    let i = 0;
    while (i < arr.length - 1) {
        let j = i + 1;
        const result = comparer(arr[i], arr[j]);
        if (result === null) {
            // Skip the comparison if indeterminate
            i += 1;
        } else if (result < 0) {
            // a < b, so move to the next pair
            i += 1;
        } else if (result > 0) {
            // a > b, so swap the elements
            [arr[i], arr[j]] = [arr[j], arr[i]];
            i = 0;  // Restart sorting from the beginning after a swap
        } else {
            // a == b, no swap needed
            i += 1;
        }
    }
    return arr;
}

async function p2024day5_part1(input: string, ...params: any[]) {
	const lines = input.split("\n");
	const pairs: [number, number][] = [];
	const runs: number[][] = [];
	for (const line of lines) {
		if (line.trim() === "") {
			continue;
		}
		if (line.indexOf("|") > 0) {
			pairs.push(line.split("|").map(Number) as [number, number]);
		} else {
			runs.push(line.split(",").map(Number));
		}
	}

	const pageNums: Set<number> = new Set();
	const pageMap: Map<number, [number, number][]> = new Map();
	for (const pair of pairs) {
		pageNums.add(pair[0]);
		pageNums.add(pair[1]);

		if (!pageMap.has(pair[0])) {
			pageMap.set(pair[0], []);
		}
		if (!pageMap.has(pair[1])) {
			pageMap.set(pair[1], []);
		}

		pageMap.get(pair[0])!.push(pair);
		pageMap.get(pair[1])!.push(pair);
	}
	const orderedPages = customSort([...pageNums], (a, b) => {
		const aOrderings = pageMap.get(a)!;
		for (const o of aOrderings) {
			if (o[0] === a && o[1] === b) {
				return -1;
			} else if (o[0] === b && o[1] === a) {
				return 1;
			}
		}
		return null;
	});
	console.log(orderedPages);

	const orderedMap: Map<number, number> = new Map();
	for (let i = 0; i < orderedPages.length; ++i) {
		const page = orderedPages[i];
		orderedMap.set(page, i);
	}

	let sum = 0;
	for (const run of runs) {
		const sorted = [...run].sort((a, b) => {
			const aPos = orderedMap.get(a);
			const bPos = orderedMap.get(b);

			if (!a || !b) {
				console.log("foo");
			}
			return (aPos ?? 99999999999) - (bPos ?? 9999999999999);
		});
		if (sorted.join(",") === run.join(",")) {
			sum += run[Math.floor(run.length / 2)];
		}
	}
	return sum;
}

async function p2024day5_part2(input: string, ...params: any[]) {
	return "Not implemented";
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `47|53
97|13
97|61
97|47
75|29
61|13
75|53
29|13
97|29
53|29
61|53
97|53
61|29
47|13
75|47
97|75
47|61
75|61
47|29
75|13
53|13

75,47,61,53,29
97,61,53,29,13
75,29,13
75,97,47,61,53
61,13,29
97,13,75,29,47`,
			extraArgs: [],
			expected: `143`,
			expectedPart2: ``,
		},
	];
	const part2tests: TestCase[] = [];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day5_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day5_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day5_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2024day5_part2(input));
	const part2After = performance.now();

	logSolution(5, 2024, part1Solution, part2Solution);

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
