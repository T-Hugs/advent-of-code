import * as util from "../../../util/util";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";

const YEAR = 2016;
const DAY = 1;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2016/01/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2016/01/data.txt
// problem url  : https://adventofcode.com/2016/day/1

async function p2016day1_part1(input: string) {
	let x = 0;
	let y = 0;
	let dir = 0;
	const instructions = input.split(", ");
	for (const instruction of instructions) {
		dir = Number(util.bigIntMod(dir + (instruction[0] === "R" ? 1 : -1), 4));
		let dist = parseInt(instruction.slice(1), 10);
		if (dir === 0) {
			y -= dist;
		}
		if (dir === 1) {
			x += dist;
		}
		if (dir === 2) {
			y += dist;
		}
		if (dir === 3) {
			x -= dist;
		}
	}
	log(`x: ${x}, y: ${y}`);
	return Math.abs(x) + Math.abs(y);
}

async function p2016day1_part2(input: string, part1Solution: string) {
	let x = 0;
	let y = 0;
	let dir = 0;
	const instructions = input.split(", ");
	const visited = new Set();
	for (const instruction of instructions) {
		dir = Number(util.bigIntMod(dir + (instruction[0] === "R" ? 1 : -1), 4));
		let dist = parseInt(instruction.slice(1), 10);
		for (let i = 0; i < dist; ++i) {
			if (dir === 0) {
				y -= 1;
			}
			if (dir === 1) {
				x += 1;
			}
			if (dir === 2) {
				y += 1;
			}
			if (dir === 3) {
				x -= 1;
			}
			const newLoc = `${x},${y}`;
			if (visited.has(newLoc)) {
				return Math.abs(x) + Math.abs(y);
			}
			visited.add(newLoc);
		}
	}
}

async function run() {
	const input = await util.getInput(DAY, YEAR);

	const part1Solution = String(await p2016day1_part1(input));
	const part2Solution = String(await p2016day1_part2(input, part1Solution));

	logSolution(1, 2016, part1Solution, part2Solution);
}

run()
	.then(() => {
		process.exit();
	})
	.catch(error => {
		throw error;
	});
