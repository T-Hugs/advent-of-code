import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { CartesianProduct } from "js-combinatorics/commonjs/combinatorics";

const YEAR = 2020;
const DAY = 19;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2020/19/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2020/19/data.txt
// problem url  : https://adventofcode.com/2020/day/19

function getRuleMatch(message: string, rules: string[], ruleNo: number) {
	const origMessage = message;
	const rule = rules[ruleNo];
	const ruleMatch = /\"([a-z])\"/.exec(rule);
	if (ruleMatch) {
		const ruleStr = ruleMatch[1];
		if (message.startsWith(ruleStr)) {
			return ruleStr;
		} else {
			return null;
		}
	} else {
		const altrations = rule
			.split("|")
			.map(x => x.trim())
			.map(x => x.split(" ").map(Number));
		for (const seq of altrations) {
			message = origMessage;
			if (!seq) {
				return null;
			}
			let matches = true;
			let matched = "";
			for (let i = 0; i < seq.length; ++i) {
				const rule = seq[i];
				const match = getRuleMatch(message, rules, rule);
				if (match) {
					matched += match;
					message = message.substr(match.length);
				} else {
					matches = false;
					break;
				}
			}
			if (matches) {
				return matched;
			}
		}
		return null;
	}
}

async function p2020day19_part1(input: string) {
	const groups = input.split("\n\n");
	const messages: string[] = [];
	const rules: string[] = [];

	const lines = groups[0].split("\n");
	for (const line of lines) {
		const split = line.split(":").map(s => s.trim());
		rules[Number(split[0])] = split[1];
	}
	const lines2 = groups[1].split("\n");
	for (const line of lines2) {
		messages.push(line);
	}
	let count = 0;
	for (const message of messages) {
		if (getRuleMatch(message, rules, 0) === message) {
			count++;
		}
	}
	return count;
}

async function p2020day19_part2(input: string) {
	const groups = input.split("\n\n");
	const messages: string[] = [];
	const rules: string[] = [];

	const lines = groups[0].split("\n");
	for (const line of lines) {
		const split = line.split(":").map(s => s.trim());
		rules[Number(split[0])] = split[1];
	}
	const lines2 = groups[1].split("\n");
	for (const line of lines2) {
		messages.push(line);
	}
	const tries = 6;
	let count = 0;
	for (const message of messages) {
		for (let i = 1; i < tries; ++i) {
			for (let j = 1; j < tries; ++j) {
				rules[0] = _.repeat("42 ", i) + _.repeat("42 ", j) + _.repeat("31 ", j);
				if (getRuleMatch(message, rules, 0) === message) {
					count++;
				}
			}
		}
	}
	return count;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `0: 4 1 5
1: 2 3 | 3 2
2: 4 4 | 5 5
3: 4 5 | 5 4
4: "a"
5: "b"

ababbb
bababa
abbbab
aaabbb
aaaabbb`,
			expected: `2`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `42: 9 14 | 10 1
9: 14 27 | 1 26
10: 23 14 | 28 1
1: "a"
11: 42 31
5: 1 14 | 15 1
19: 14 1 | 14 14
12: 24 14 | 19 1
16: 15 1 | 14 14
31: 14 17 | 1 13
6: 14 14 | 1 14
2: 1 24 | 14 4
0: 8 11
13: 14 3 | 1 12
15: 1 | 14
17: 14 2 | 1 7
23: 25 1 | 22 14
28: 16 1
4: 1 1
20: 14 14 | 1 15
3: 5 14 | 16 1
27: 1 6 | 14 18
14: "b"
21: 14 1 | 1 14
25: 1 1 | 1 14
22: 14 14
8: 42
26: 14 22 | 1 20
18: 15 15
7: 14 5 | 1 21
24: 14 1
43: 15 1

abbbbbabbbaaaababbaabbbbabababbbabbbbbbabaaaa
bbabbbbaabaabba
babbbbaabbbbbabbbbbbaabaaabaaa
aaabbbbbbaaaabaababaabababbabaaabbababababaaa
bbbbbbbaaaabbbbaaabbabaaa
bbbababbbbaaaaaaaabbababaaababaabab
ababaaaaaabaaab
ababaaaaabbbaba
baabbaaaabbaaaababbaababb
abbbbabbbbaaaababbbbbbaaaababb
aaaaabbaabaaaaababaa
aaaabbaaaabbaaa
aaaabbaabbaaaaaaabbbabbbaaabbaabaaa
babaaabbbaaabaababbaabababaaab
aabbbbbaabbbaaaaaabbbbbababaaaaabbaaabba`,
			expected: `12`,
		},
	];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2020day19_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2020day19_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2020day19_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2020day19_part2(input));
	const part2After = performance.now();

	logSolution(19, 2020, part1Solution, part2Solution);

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
