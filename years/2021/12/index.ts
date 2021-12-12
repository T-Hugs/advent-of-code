import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { undirectedAllPaths } from "../../../util/graph";

const YEAR = 2021;
const DAY = 12;

// solution path: C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\12\index.ts
// data path    : C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\12\data.txt
// problem url  : https://adventofcode.com/2021/day/12

class Cave {
	public connectedTo: Set<Cave> = new Set();
	public primeCaves: Set<Cave> = new Set();
	constructor(public name: string, public large: boolean) {}
	public toString() {
		return `${this.name}`;
	}
}

async function p2021day12_part1(input: string, ...params: any[]) {
	const lines = input.split("\n");
	const caves: { [key: string]: Cave } = {};
	for (const line of lines) {
		const [from, to] = line.split("-");
		if (!caves[from]) {
			if (from.toUpperCase() === from) {
				const cave = new Cave(from, true);
				caves[from] = cave;
			} else {
				const cave = new Cave(from, false);
				caves[from] = cave;
			}
		}
		if (!caves[to]) {
			if (to.toUpperCase() === to) {
				const cave = new Cave(to, true);
				caves[to] = cave;
			} else {
				const cave = new Cave(to, false);
				caves[to] = cave;
			}
		}
		caves[from].connectedTo.add(caves[to]);
		caves[to].connectedTo.add(caves[from]);
	}

	const paths = undirectedAllPaths<Cave>({
		start: caves["start"],
		isEnd: (cave: Cave) => cave.name === "end",
		neighbors: (cave: Cave) => [...cave.connectedTo],
		canRevisit: (cave: Cave) => cave.large,
	});
	return paths.length;
}

async function p2021day12_part2(input: string, ...params: any[]) {
	const lines = input.split("\n");
	const caves: { [key: string]: Cave } = {};
	for (const line of lines) {
		const [from, to] = line.split("-");
		if (!caves[from]) {
			if (from.toUpperCase() === from) {
				const cave = new Cave(from, true);
				caves[from] = cave;
			} else {
				const cave = new Cave(from, false);
				caves[from] = cave;
			}
		}
		if (!caves[to]) {
			if (to.toUpperCase() === to) {
				const cave = new Cave(to, true);
				caves[to] = cave;
			} else {
				const cave = new Cave(to, false);
				caves[to] = cave;
			}
		}
		caves[from].connectedTo.add(caves[to]);
		caves[to].connectedTo.add(caves[from]);
	}

	const smallCaves = Object.values(caves).filter(cave => !cave.large && cave.name !== "end" && cave.name !== "start");

	const allPaths = new Set<string>();
	for (const smallCave of smallCaves) {
		const paths = undirectedAllPaths<Cave>({
			start: caves["start"],
			isEnd: (cave: Cave) => cave.name === "end",
			neighbors: (cave: Cave) => [...cave.connectedTo],
			canRevisit: (cave: Cave, path: Cave[]) =>
				cave.large || (cave.name === smallCave.name && path.filter(c => c.name === smallCave.name).length <= 1),
		});

		for (const path of paths) {
			allPaths.add(path.map(c => c.name).join(","));
		}
	}

	return allPaths.size;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `start-A
start-b
A-c
A-b
b-d
A-end
b-end`,
			extraArgs: [],
			expected: `10`,
		},
		{
			input: `dc-end
HN-start
start-kj
dc-start
dc-HN
LN-dc
HN-end
kj-sa
kj-HN
kj-dc`,
			extraArgs: [],
			expected: `19`,
		},
		{
			input: `fs-end
he-DX
fs-he
start-DX
pj-DX
end-zg
zg-sl
zg-pj
pj-he
RW-he
fs-DX
pj-RW
zg-RW
start-pj
he-WI
zg-he
pj-fs
start-RW`,
			extraArgs: [],
			expected: `226`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `start-A
start-b
A-c
A-b
b-d
A-end
b-end`,
			extraArgs: [],
			expected: `36`,
		},
		{
			input: `dc-end
HN-start
start-kj
dc-start
dc-HN
LN-dc
HN-end
kj-sa
kj-HN
kj-dc`,
			extraArgs: [],
			expected: `103`,
		},
		{
			input: `fs-end
he-DX
fs-he
start-DX
pj-DX
end-zg
zg-sl
zg-pj
pj-he
RW-he
fs-DX
pj-RW
zg-RW
start-pj
he-WI
zg-he
pj-fs
start-RW`,
			extraArgs: [],
			expected: `3509`,
		},
	];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2021day12_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2021day12_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2021day12_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2021day12_part2(input));
	const part2After = performance.now();

	logSolution(12, 2021, part1Solution, part2Solution);

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
