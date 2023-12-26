import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2023;
const DAY = 19;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/19/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/19/data.txt
// problem url  : https://adventofcode.com/2023/day/19

type XMAS = "x" | "m" | "a" | "s";
type GatedRule = { param: XMAS; ineq: "<" | ">"; val: number; dest: string };
type Rule = GatedRule | string;
type NormalRule = GatedRule | { dest: string };

type Workflows = {
	[key: string]: Rule[];
};

type Part = {
	x: number;
	m: number;
	a: number;
	s: number;
};

async function p2023day19_part1(input: string, ...params: any[]) {
	const [workflowsStr, partsStr] = input.split("\n\n");
	const workflowLines = workflowsStr.split("\n");
	const partsLines = partsStr.split("\n");

	const workflows: Workflows = {};
	const parts: Part[] = [];
	for (const line of workflowLines) {
		const [workflowName, rest] = line.slice(0, -1).split("{");
		const ruleStrs = rest.split(",");
		const rules: Rule[] = [];
		for (const ruleStr of ruleStrs) {
			if (!ruleStr.includes(":")) {
				rules.push(ruleStr);
			} else {
				const [ineq, dest] = ruleStr.split(":");
				const symbol = ineq.match(/<|>/)![0] as "<" | ">";
				const [param, valStr] = ineq.split(symbol);
				const val = Number(valStr);
				rules.push({ dest, ineq: symbol, param: param as XMAS, val });
			}
		}
		workflows[workflowName] = rules;
	}

	for (const line of partsLines) {
		const [xStr, mStr, aStr, sStr] = line.slice(1, -1).split(",");
		parts.push({
			x: Number(xStr.split("=")[1]),
			m: Number(mStr.split("=")[1]),
			a: Number(aStr.split("=")[1]),
			s: Number(sStr.split("=")[1]),
		});
	}

	const acceptedParts: Part[] = [];
	for (const part of parts) {
		let workflow = workflows["in"];
		let accepted: boolean | undefined = undefined;
		while (accepted === undefined) {
			for (const rule of workflow) {
				let dest: string | undefined = undefined;
				if (typeof rule !== "string") {
					if (rule.ineq === "<") {
						if (part[rule.param] < rule.val) {
							dest = rule.dest;
						}
					} else {
						if (part[rule.param] > rule.val) {
							dest = rule.dest;
						}
					}
				} else {
					dest = rule;
				}
				if (dest) {
					if (dest === "R") {
						accepted = false;
					} else if (dest === "A") {
						accepted = true;
					} else {
						workflow = workflows[dest];
					}
					break;
				}
			}
		}
		if (accepted) {
			acceptedParts.push(part);
		}
	}
	return acceptedParts.reduce((p, c) => p + c.x + c.m + c.a + c.s, 0);
}

function workflowAccepted(
	rules: Rule[],
	workflows: Workflows,
	x: [number, number],
	m: [number, number],
	a: [number, number],
	s: [number, number]
): number {
	const totalParts = (x[1] - x[0] + 1) * (m[1] - m[0] + 1) * (a[1] - a[0] + 1) * (s[1] - s[0] + 1);
	if (totalParts <= 0) {
		return 0;
	}
	let totalAccepted = 0;
	const nextX: [number, number] = [...x];
	const nextM: [number, number] = [...m];
	const nextA: [number, number] = [...a];
	const nextS: [number, number] = [...s];
	for (const rule of rules) {
		const normalRule: NormalRule = typeof rule === "string" ? { dest: rule } : rule;
		const continueX: [number, number] = [...nextX];
		const continueM: [number, number] = [...nextM];
		const continueA: [number, number] = [...nextA];
		const continueS: [number, number] = [...nextS];
		if ("ineq" in normalRule) {
			if (normalRule.param === "x") {
				if (normalRule.ineq === ">") {
					continueX[0] = Math.max(continueX[0], normalRule.val + 1);
					nextX[1] = Math.min(nextX[1], normalRule.val);
				} else {
					continueX[1] = Math.min(continueX[1], normalRule.val - 1);
					nextX[0] = Math.max(nextX[0], normalRule.val);
				}
			}
			if (normalRule.param === "m") {
				if (normalRule.ineq === ">") {
					continueM[0] = Math.max(continueM[0], normalRule.val + 1);
					nextM[1] = Math.min(nextM[1], normalRule.val);
				} else {
					continueM[1] = Math.min(continueM[1], normalRule.val - 1);
					nextM[0] = Math.max(nextM[0], normalRule.val);
				}
			}
			if (normalRule.param === "a") {
				if (normalRule.ineq === ">") {
					continueA[0] = Math.max(continueA[0], normalRule.val + 1);
					nextA[1] = Math.min(nextA[1], normalRule.val);
				} else {
					continueA[1] = Math.min(continueA[1], normalRule.val - 1);
					nextA[0] = Math.max(nextA[0], normalRule.val);
				}
			}
			if (normalRule.param === "s") {
				if (normalRule.ineq === ">") {
					continueS[0] = Math.max(continueS[0], normalRule.val + 1);
					nextS[1] = Math.min(nextS[1], normalRule.val);
				} else {
					continueS[1] = Math.min(continueS[1], normalRule.val - 1);
					nextS[0] = Math.max(nextS[0], normalRule.val);
				}
			}
		}
		if (normalRule.dest === "R") {
			continue;
		} else if (normalRule.dest === "A") {
			totalAccepted +=
				(continueX[1] - continueX[0] + 1) *
				(continueM[1] - continueM[0] + 1) *
				(continueA[1] - continueA[0] + 1) *
				(continueS[1] - continueS[0] + 1);
		} else {
			totalAccepted += workflowAccepted(
				workflows[normalRule.dest],
				workflows,
				continueX,
				continueM,
				continueA,
				continueS
			);
		}
	}
	return totalAccepted;
}

async function p2023day19_part2(input: string, ...params: any[]) {
	const [workflowsStr, partsStr] = input.split("\n\n");
	const workflowLines = workflowsStr.split("\n");

	const workflows: Workflows = {};
	for (const line of workflowLines) {
		const [workflowName, rest] = line.slice(0, -1).split("{");
		const ruleStrs = rest.split(",");
		const rules: Rule[] = [];
		for (const ruleStr of ruleStrs) {
			if (!ruleStr.includes(":")) {
				rules.push(ruleStr);
			} else {
				const [ineq, dest] = ruleStr.split(":");
				const symbol = ineq.match(/<|>/)![0] as "<" | ">";
				const [param, valStr] = ineq.split(symbol);
				const val = Number(valStr);
				rules.push({ dest, ineq: symbol, param: param as XMAS, val });
			}
		}
		workflows[workflowName] = rules;
	}

	return workflowAccepted(workflows["in"], workflows, [1, 4000], [1, 4000], [1, 4000], [1, 4000]);
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `px{a<2006:qkq,m>2090:A,rfg}
pv{a>1716:R,A}
lnx{m>1548:A,A}
rfg{s<537:gd,x>2440:R,A}
qs{s>3448:A,lnx}
qkq{x<1416:A,crn}
crn{x>2662:A,R}
in{s<1351:px,qqz}
qqz{s>2770:qs,m<1801:hdj,R}
gd{a>3333:R,R}
hdj{m>838:A,pv}

{x=787,m=2655,a=1222,s=2876}
{x=1679,m=44,a=2067,s=496}
{x=2036,m=264,a=79,s=2244}
{x=2461,m=1339,a=466,s=291}
{x=2127,m=1623,a=2188,s=1013}`,
			extraArgs: [],
			expected: `19114`,
			expectedPart2: `167409079868000`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `in{a<5:A,R}

{x=787,m=2655,a=1222,s=2876}`,
			extraArgs: [],
			expected: `256000000000`,
			expectedPart2: ``,
		},
		{
			input: `in{a<5:two,R}
two{a<2:A,R}

{x=787,m=2655,a=1222,s=2876}`,
			extraArgs: [],
			expected: `64000000000`,
			expectedPart2: ``,
		},
		{
			input: `in{a<5:two,R}
two{a<2:thr,R}
thr{s<2:A,R}

{x=787,m=2655,a=1222,s=2876}`,
			extraArgs: [],
			expected: `16000000`,
			expectedPart2: ``,
		},
	];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2023day19_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2023day19_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2023day19_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2023day19_part2(input));
	const part2After = performance.now();

	logSolution(19, 2023, part1Solution, part2Solution);

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
