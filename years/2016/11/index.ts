import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import aStar from "a-star";
import { Combination } from "js-combinatorics/commonjs/combinatorics";
import { getHashes } from "crypto";

const YEAR = 2016;
const DAY = 11;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2016/11/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2016/11/data.txt
// problem url  : https://adventofcode.com/2016/day/11

function setsOfOneOrTwo(arr: string[]) {
	const result: string[][] = [];
	for (let i = 0; i < arr.length; ++i) {
		for (let j = i + 1; j < arr.length; ++j) {
			result.push([arr[i], arr[j]]);
		}
		result.push([arr[i]]);
	}
	return result;
}
function getHash(state: Obj<number>) {
	return Object.entries(state)
		.sort((a, b) => {
			if (a[1] !== b[1]) {
				return a[1] - b[1];
			} else {
				return a[0].localeCompare(b[0]);
			}
		})
		.map(e => `${e[0]}>${e[1]}`)
		.join("|");
}
function getNeighbors(state: Obj<number>, floors: number) {
	const nextStates: Obj<number>[] = [];
	const localObjects = Object.keys(state).filter(o => o !== "elevator" && state[o] === state.elevator);
	const waysToCarry = setsOfOneOrTwo(localObjects);

	if (state.elevator !== 3) {
		for (const i of waysToCarry) {
			const newState = { ...state };
			newState.elevator++;
			for (const item of i) {
				newState[item]++;
			}
			nextStates.push(newState);
		}
	}
	if (state.elevator !== 0) {
		for (const i of waysToCarry) {
			const newState = { ...state };
			newState.elevator--;
			for (const item of i) {
				newState[item]--;
			}
			nextStates.push(newState);
		}
	}

	// Remove any illegal states
	const badStates: Obj<number>[] = [];
	for (const nextState of nextStates) {
		for (let i = Math.max(0, state.elevator - 1); i < Math.min(floors, state.elevator + 2); ++i) {
			const itemsOnFloor = Object.keys(nextState).filter(item => nextState[item] === i);
			let br = false;
			for (const itemOnFloor of itemsOnFloor) {
				const [element, type] = itemOnFloor.split(" ");
				if (type === "microchip" && !itemsOnFloor.includes(`${element} generator`)) {
					if (itemsOnFloor.find(iof => iof.endsWith("generator"))) {
						badStates.push(nextState);
						br = true;
						break;
					}
				}
			}
			if (br) {
				break;
			}
		}
	}
	_.remove(nextStates, s => badStates.includes(s));
	return nextStates;
}
async function p2016day11_part1(input: string) {
	const lines = input.split("\n");
	const state: Obj<number> = { elevator: 0 };
	const re = /The (first|second|third|fourth) floor contains a (.*)/;
	const floors = ["first", "second", "third", "fourth"];
	for (const line of lines) {
		if (line.includes("nothing relevant")) {
			continue;
		}
		const match = re.exec(line)!;
		const floor = floors.indexOf(match[1]);
		const thingsStr = match[2];
		const things = thingsStr
			.split(/(?:,\sand\s)|(?:,\s)|(?:\sand\s)/g)
			.map(t => _.trimEnd(_.trimStart(t, "a "), "."));
		for (const thing of things) {
			state[thing.replace("-compatible", "")] = floor;
		}
	}
	const objCount = Object.keys(state).length;
	const options = {
		start: state,
		isEnd: (state: Obj<number>) => {
			return Object.values(state).every(floor => floor === 3);
		},
		neighbor: (state: Obj<number>) => getNeighbors(state, floors.length),
		heuristic: (state: Obj<number>) => objCount * 4 - Object.values(state).reduce((p, c) => p + c, 0),
		hash: getHash,
		distance: () => 1,
	};
	const path = aStar(options);
	return path.path.length - 1;
}

async function p2016day11_part2(input: string, part1Answer: string) {
	const part1Steps = Number(part1Answer);
	const lines = input.split("\n");
	const state: Obj<number> = { elevator: 0 };
	const re = /The (first|second|third|fourth) floor contains a (.*)/;
	const floors = ["first", "second", "third", "fourth"];
	for (const line of lines) {
		if (line.includes("nothing relevant")) {
			continue;
		}
		const match = re.exec(line)!;
		const floor = floors.indexOf(match[1]);
		const thingsStr = match[2];
		const things = thingsStr
			.split(/(?:,\sand\s)|(?:,\s)|(?:\sand\s)/g)
			.map(t => _.trimEnd(_.trimStart(t, "a "), "."));
		for (const thing of things) {
			state[thing.replace("-compatible", "")] = floor;
		}
	}
	// Delete a pair on the first floor
	const entry = Object.entries(state).find(e => e[1] === 0 && e[0] !== "elevator")!;
	const elem = entry[0].split(" ")[0];
	delete state[`${elem} microchip`];
	delete state[`${elem} generator`];

	const objCount = Object.keys(state).length;
	const options = {
		start: state,
		isEnd: (state: Obj<number>) => {
			return Object.values(state).every(floor => floor === 3);
		},
		neighbor: (state: Obj<number>) => getNeighbors(state, floors.length),
		heuristic: (state: Obj<number>) => objCount * 4 - Object.values(state).reduce((p, c) => p + c, 0),
		hash: getHash,
		distance: () => 1,
	};
	const path = aStar(options);
	const easierLength = path.path.length - 1;
	const delta = part1Steps - easierLength;
	return part1Steps + delta * 2;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `The first floor contains a hydrogen-compatible microchip and a lithium-compatible microchip.
The second floor contains a hydrogen generator.
The third floor contains a lithium generator.
The fourth floor contains nothing relevant.`,
			expected: `11`,
		},
	];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2016day11_part1(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2016day11_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2016day11_part2(input, part1Solution));
	const part2After = performance.now();

	logSolution(11, 2016, part1Solution, part2Solution);

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
