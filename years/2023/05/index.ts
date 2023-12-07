import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2023;
const DAY = 5;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/05/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/05/data.txt
// problem url  : https://adventofcode.com/2023/day/5

function getLocation(seed: number, maps: any, order: string[], log = false) {
	let lookup = seed;
	for (const thing of order) {
		const map = maps[thing];
		if (!maps[thing]) {
			break;
		}

		for (const [srcStr, [len, dest]] of Object.entries(map) as any) {
			const src = Number(srcStr);
			if (lookup >= src && lookup <= src + len - 1) {
				lookup = dest + (lookup - src);
				break;
			}
		}
		if (log) {
			console.log(thing, lookup);
		}
	}
	return lookup;
}

async function p2023day5_part1(input: string, ...params: any[]) {
	const groups = input.split("\n\n");
	const seeds = groups[0].split(": ")[1].split(" ").map(Number);

	const maps: any = {};
	const order: string[] = [];

	for (let i = 1; i < groups.length; i++) {
		const group = groups[i];
		const groupLines = group.split("\n");
		const [typewords] = groupLines[0].split(" ");
		const [a, , b] = groupLines[0].split("-");
		if (!maps[a]) {
			maps[a] = {};
		}
		if (!maps[b]) {
			maps[b] = {};
		}

		for (let j = 1; j < groupLines.length; j++) {
			const [dest, src, len] = groupLines[j].split(" ").map(Number);
			maps[a][src] = [len, dest];
		}
		order.push(a);

		if (i === groups.length - 1) {
			order.push(b);
		}
	}

	let lowestLoc = Number.MAX_SAFE_INTEGER;
	for (const seed of seeds) {
		const loc = getLocation(seed, maps, order);
		lowestLoc = Math.min(lowestLoc, loc);
	}

	return lowestLoc;
}

interface SeedMap {
	[key: string]: [number, number, number, number][];
}

function getDestInfo(src: number, ranges: [number, number, number, number][]) {
	let next = null;
	for (let i = 0; i < ranges.length; ++i) {
		const [srcStart, srcEnd, destStart, destEnd] = ranges[i];

		// Not in the map
		if (srcStart > src) {
			next = srcStart;
			break;
		}

		if (srcEnd < src) {
			continue;
		}

		return { dest: destStart + (src - srcStart), remaining: srcEnd - src };
	}

	// Not mapped. When is the next mapped seed?
	if (next) {
		return { dest: src, remaining: next - src };
	} else {
		return { dest: src, remaining: Number.MAX_SAFE_INTEGER };
	}
}

// [dest] [src] [len]
async function p2023day5_part2(input: string, ...params: any[]) {
	const groups = input.split("\n\n");
	const seeds = groups[0].split(": ")[1].split(" ").map(Number);
	let seedRanges: [number, number][] = [];
	for (let i = 0; i < seeds.length; i += 2) {
		seedRanges.push([seeds[i], seeds[i] + seeds[i + 1] - 1]);
	}
	const map: SeedMap = {};
	const order: string[] = [];

	let ranges = seedRanges;
	ranges.sort((a, b) => a[0] - b[0]);
	for (let i = 1; i < groups.length; ++i) {
		const groupStr = groups[i];
		const groupLines = groupStr.split("\n");
		const [srcName] = groupLines[0].split(" ")[0].split("-to-");
		order.push(srcName);
		map[srcName] = [];
		for (let j = 1; j < groupLines.length; ++j) {
			const [dest, src, len] = groupLines[j].split(" ").map(Number);
			map[srcName].push([src, src + len - 1, dest, dest + len - 1]);
			map[srcName].sort((a, b) => a[0] - b[0]);
		}
	}
	const keys = Object.keys(map);

	// fill in missing ranges
	for (const key of keys) {
		const rangesInKey = map[key];
		let currentSrc = 0;
		const rangesToAdd: [number, number, number, number][] = [];
		for (let i = 0; i < rangesInKey.length; ++i) {
			const [srcStart, srcEnd, destStart, destEnd] = rangesInKey[i];
			if (currentSrc < srcStart) {
				rangesToAdd.push([currentSrc, srcStart - 1, currentSrc, srcStart - 1]);
				currentSrc = srcStart;
				i--;
			} else {
				currentSrc = srcEnd + 1;
			}
		}
		rangesToAdd.push([currentSrc, Number.MAX_SAFE_INTEGER, currentSrc, Number.MAX_SAFE_INTEGER]);
		map[key].push(...rangesToAdd);
		map[key].sort((a, b) => a[0] - b[0]);
	}

	// collapse mappings
	let collapsed: [number, number, number, number][] = map["seed"];
	for (let i = 1; i < order.length - 1; ++i) {
		const key = order[i];
		let currentSrc = 0;
		const map1 = collapsed;
		const map2 = map[key];
		let map1Ptr = 0;
		let map2Ptr = 0;
		const nextCollapsed: [number, number, number, number][] = [];
		while (true) {
			if (map1Ptr === map1.length && map2Ptr === map2.length) {
				break;
			}
			const srcStart = currentSrc;
			const isMap1 = map2Ptr === map2.length || map1[map1Ptr][1] < map2[map2Ptr][1] ? true : false;
			const appropriateMapForEnding = isMap1 ? map1 : map2;
			const firstDestStartInfo = getDestInfo(srcStart, map1);
			const secondDestStartInfo = getDestInfo(firstDestStartInfo.dest, map2);
			const srcEnd = srcStart + Math.min(secondDestStartInfo.remaining, firstDestStartInfo.remaining);
			// const srcEnd = appropriateMapForEnding[isMap1 ? map1Ptr : map2Ptr][1];
			const firstDestEndInfo = getDestInfo(srcEnd, map1);
			const secondDestEndInfo = getDestInfo(firstDestEndInfo.dest, map2);
			nextCollapsed.push([srcStart, srcEnd, secondDestStartInfo.dest, secondDestEndInfo.dest]);
			currentSrc = srcEnd + 1;
			if (isMap1) {
				map1Ptr++;
			} else {
				map2Ptr++;
			}
			if (srcEnd === Number.MAX_SAFE_INTEGER) {
				break;
			}
		}
		nextCollapsed.sort((a, b) => a[0] - b[0]);
		collapsed = nextCollapsed;
	}

	let minVal = Number.MAX_SAFE_INTEGER;
	for (const range of collapsed) {
		const candidate = range[0];
		const found = ranges.find(r => r[0] <= candidate && candidate <= r[1]);
		if (found) {
			if (range[2] < minVal) {
				minVal = range[2];
			}
		}
	}
	return minVal;

	// let currentRanges = ranges;
	// for (let i = 0; i < keys.length; ++i) {
	// 	const key = keys[i];
	// 	// const destRanges: [number, number][] = currentRanges;
	// 	for (let j = 0; j < i + 1; ++j) {
	// 		if (j === i) {
	// 			const newRanges: [number, number][] = [];
	// 			for (const range of currentRanges) {
	// 				let currentSrc = range[0];

	// 				while (currentSrc <= range[1]) {
	// 					const destInfo = getDestInfo(currentSrc, map[key]);
	// 					newRanges.push([currentSrc, Math.min(currentSrc + destInfo.remaining - 1, range[1])]);
	// 					currentSrc += destInfo.remaining + 1;
	// 				}
	// 			}
	// 			currentRanges = newRanges;
	// 		} else {
	// 		}

			// currentRanges.sort((a, b) => a[0] - b[0]);
			// const nextRanges: [number, number][] = [];
			// const nextDestRanges: [number, number][] = [];
			// for (const range of destRanges) {
			// 	let currentSeed = range[0];
			// 	while (currentSeed <= range[1]) {
			// 		const destInfo = getDestInfo(currentSeed, map, key);
			// 		nextRanges.push([currentSeed, Math.min(currentSeed + destInfo.remaining - 1, range[1])]);
			// 		nextDestRanges.push([destInfo.dest, destInfo.dest + destInfo.remaining - 1]);
			// 		currentSeed += destInfo.remaining + 1;
			// 	}
			// }
			// currentRanges = nextRanges;
	// 	}
	// }

	// const maps: any = {};
	// const order: string[] = [];

	// for (let i = 1; i < groups.length; i++) {
	// 	const group = groups[i];
	// 	const groupLines = group.split("\n");
	// 	const [typewords] = groupLines[0].split(" ");
	// 	const [a, , b] = groupLines[0].split("-");
	// 	if (!maps[a]) {
	// 		maps[a] = {};
	// 	}
	// 	if (!maps[b]) {
	// 		maps[b] = {};
	// 	}

	// 	for (let j = 1; j < groupLines.length; j++) {
	// 		const [dest, src, len] = groupLines[j].split(" ").map(Number);
	// 		maps[a][src] = [len, dest];
	// 	}
	// 	order.push(a);

	// 	if (i === groups.length - 1) {
	// 		order.push(b);
	// 	}
	// }

	// const orderCopy = [...order];
	// order.pop();
	// order.pop();
	// order.reverse();

	// // @ts-ignore
	// const lowestDestination = Math.min(...Object.values(maps[order[0]]).map(([, dest]) => dest));

	// // @ts-ignore
	// let correspondingSrc = Number(Object.entries(maps[order[0]]).find(([, [,dest]]) => dest === lowestDestination)![0]);
	// let correspondingLen = maps[order[0]][correspondingSrc][0];

	// order.shift();
	// for (const thing of order) {
	// 	console.log(thing, correspondingSrc);
	// 	const map = maps[thing];

	// 	for (const [srcStr, [len, dest]] of Object.entries(map) as any) {
	// 		const src = Number(srcStr);
	// 		if (correspondingSrc >= dest && correspondingSrc <= dest + correspondingLen - 1) {

	// 			// @ts-ignore
	// 			correspondingSrc = Number(Object.entries(maps[order[0]]).find(([, [,_dest]]) => _dest === dest)![0]);
	// 			correspondingLen = maps[order[0]][correspondingSrc][0];
	// 			break;
	// 		}
	// 	}
	// }

	// console.log(correspondingSrc, correspondingLen);

	// console.log("---")

	// console.log(getLocation(331633133, maps, orderCopy, true));
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `seeds: 79 14 55 13

seed-to-soil map:
50 98 2
52 50 48

soil-to-fertilizer map:
0 15 37
37 52 2
39 0 15

fertilizer-to-water map:
49 53 8
0 11 42
42 0 7
57 7 4

water-to-light map:
88 18 7
18 25 70

light-to-temperature map:
45 77 23
81 45 19
68 64 13

temperature-to-humidity map:
0 69 1
1 0 69

humidity-to-location map:
60 56 37
56 93 4`,
			extraArgs: [],
			expected: `35`,
			expectedPart2: `46`,
		},
	];
	const part2tests: TestCase[] = [];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2023day5_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2023day5_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2023day5_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2023day5_part2(input));
	const part2After = performance.now();

	logSolution(5, 2023, part1Solution, part2Solution);

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
