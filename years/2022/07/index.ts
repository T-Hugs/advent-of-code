import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2022;
const DAY = 7;

// solution path: C:\Users\trgau\dev\t-hugs\advent-of-code\years\2022\07\index.ts
// data path    : C:\Users\trgau\dev\t-hugs\advent-of-code\years\2022\07\data.txt
// problem url  : https://adventofcode.com/2022/day/7

interface Directory {
	__parent__?: number | Directory;
	__size__?: number | Directory;
	[filename: string]: number | Directory | undefined;
}

interface FS {
	"/": Directory;
}

function dirSize(dir: Directory, op?: (size: number) => void): number {
	let size = 0;
	for (const filename in dir) {
		if (filename === "__parent__") {
			continue;
		}
		if (filename === "__size__") {
			continue;
		}
		const file = dir[filename];
		if (typeof file === "number") {
			size += file;
		} else if (file) {
			size += dirSize(file, op);
		}
	}
	dir.__size__ = size;

	if (op) {
		op(size);
	}
	return size;
}

async function p2022day7_part1(input: string, ...params: any[]) {
	const maxSizeToConsider = 100000;
	const lines = input.split("\n");
	const fs: FS = { "/": {} };
	let linePointer = 0;
	const rootDir = fs["/"];
	let currentDir = rootDir;
	while (linePointer < lines.length) {
		const line = lines[linePointer++];
		const pieces = line.split(" ");
		if (pieces[0] === "$") {
			const command = pieces[1];
			switch (command) {
				case "ls":
					while (linePointer < lines.length) {
						const nextLine = lines[linePointer++];
						const nextPieces = nextLine.split(" ");
						if (nextPieces[0] === "$") {
							linePointer--;
							break;
						}
						if (nextPieces[0] === "dir") {
							if (!currentDir[nextPieces[1]]) {
								currentDir[nextPieces[1]] = { __parent__: currentDir };
							}
						} else {
							const size = Number(nextPieces[0]);
							currentDir[nextPieces[1]] = size;
						}
					}
					break;
				case "cd":
					if (pieces[2] === "..") {
						if (typeof currentDir.__parent__ === "object") {
							currentDir = currentDir.__parent__;
						}
					} else if (pieces[2] === "/") {
						currentDir = rootDir;
					} else {
						const dirName = pieces[2];
						if (!currentDir[dirName]) {
							currentDir[dirName] = { __parent__: currentDir };
						}
						const nextDir = currentDir[dirName];
						if (typeof nextDir === "object") {
							currentDir = nextDir;
						}
					}
					break;
			}
		} else {
			throw new Error("Expected $ command");
		}
	}
	let total = 0;
	dirSize(rootDir, size => {
		if (size <= maxSizeToConsider) {
			total += size;
		}
	});
	return total;
}

async function p2022day7_part2(input: string, ...params: any[]) {
	const diskSize = 70000000;
	const neededSpace = 30000000;
	const lines = input.split("\n");
	const fs: FS = { "/": {} };
	let linePointer = 0;
	const rootDir = fs["/"];
	let currentDir = rootDir;
	while (linePointer < lines.length) {
		const line = lines[linePointer++];
		const pieces = line.split(" ");
		if (pieces[0] === "$") {
			const command = pieces[1];
			switch (command) {
				case "ls":
					while (linePointer < lines.length) {
						const nextLine = lines[linePointer++];
						const nextPieces = nextLine.split(" ");
						if (nextPieces[0] === "$") {
							linePointer--;
							break;
						}
						if (nextPieces[0] === "dir") {
							if (!currentDir[nextPieces[1]]) {
								currentDir[nextPieces[1]] = { __parent__: currentDir };
							}
						} else {
							const size = Number(nextPieces[0]);
							currentDir[nextPieces[1]] = size;
						}
					}
					break;
				case "cd":
					if (pieces[2] === "..") {
						if (typeof currentDir.__parent__ === "object") {
							currentDir = currentDir.__parent__;
						}
					} else if (pieces[2] === "/") {
						currentDir = rootDir;
					} else {
						const dirName = pieces[2];
						if (!currentDir[dirName]) {
							currentDir[dirName] = { __parent__: currentDir };
						}
						const nextDir = currentDir[dirName];
						if (typeof nextDir === "object") {
							currentDir = nextDir;
						}
					}
					break;
			}
		} else {
			throw new Error("Expected $ command");
		}
	}
	let total = 0;
	const totalUsed = dirSize(rootDir);
	const unusedSpace = diskSize - totalUsed;
	const needToFreeUp = neededSpace - unusedSpace;
	let bestCandidate = Number.MAX_SAFE_INTEGER;
	dirSize(rootDir, size => {
		if (size < bestCandidate && size >= needToFreeUp) {
			bestCandidate = size;
		}
	});
	return bestCandidate;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `$ cd /
$ ls
dir a
14848514 b.txt
8504156 c.dat
dir d
$ cd a
$ ls
dir e
29116 f
2557 g
62596 h.lst
$ cd e
$ ls
584 i
$ cd ..
$ cd ..
$ cd d
$ ls
4060174 j
8033020 d.log
5626152 d.ext
7214296 k`,
			extraArgs: [],
			expected: `95437`,
		},
	];
	const part2tests: TestCase[] = [{
		input: `$ cd /
$ ls
dir a
14848514 b.txt
8504156 c.dat
dir d
$ cd a
$ ls
dir e
29116 f
2557 g
62596 h.lst
$ cd e
$ ls
584 i
$ cd ..
$ cd ..
$ cd d
$ ls
4060174 j
8033020 d.log
5626152 d.ext
7214296 k`,
		extraArgs: [],
		expected: `24933642`,
	}];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2022day7_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2022day7_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2022day7_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2022day7_part2(input));
	const part2After = performance.now();

	logSolution(7, 2022, part1Solution, part2Solution);

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
