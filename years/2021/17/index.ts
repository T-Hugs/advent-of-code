import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2021;
const DAY = 17;

// solution path: C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\17\index.ts
// data path    : C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\17\data.txt
// problem url  : https://adventofcode.com/2021/day/17

async function p2021day17_part1(input: string, ...params: any[]) {
	const [xs, ys] = input.slice(13).split(", ");
	const [,xranges] = xs.split("=");
	const [,yranges] = ys.split("=");
	const [xlo, xhi] = xranges.split("..").map(Number);
	const [ylo, yhi] = yranges.split("..").map(Number);

	const maxSteps = 1000;
	const goodShots: [number, number][] = [];

	for (let i = 0; i < 1000; ++i) {
		for (let j = 0; j < 1000; ++j) {
			let [dx, dy] = [i, j];
			let [x, y] = [0, 0];
			for (let s = 0; s < maxSteps; ++s) {
				x += dx;
				y += dy;
				if (dx > 0) {
					dx--;
				}
				if (dx < 0) {
					dx++;
				}
				dy--;

				if (x >= xlo && x <= xhi && y >= ylo && y <= yhi) {
					goodShots.push([i, j]);
					break;
				}
				if (x > xhi) {
					break;
				}
			}
		}
	}
	const best = util.max(goodShots, g => g[1]);
	return (best.value / 2 + 0.5) * best.value;
}

async function p2021day17_part2(input: string, ...params: any[]) {
	const [xs, ys] = input.slice(13).split(", ");
	const [,xranges] = xs.split("=");
	const [,yranges] = ys.split("=");
	const [xlo, xhi] = xranges.split("..").map(Number);
	const [ylo, yhi] = yranges.split("..").map(Number);

	const maxSteps = 1000;
	const goodShots: [number, number][] = [];

	for (let i = 0; i < 1000; ++i) {
		for (let j = -1000; j < 1000; ++j) {
			let [dx, dy] = [i, j];
			let [x, y] = [0, 0];
			for (let s = 0; s < maxSteps; ++s) {
				x += dx;
				y += dy;
				if (dx > 0) {
					dx--;
				}
				if (dx < 0) {
					dx++;
				}
				dy--;

				if (x >= xlo && x <= xhi && y >= ylo && y <= yhi) {
					goodShots.push([i, j]);
					break;
				}
				if (x > xhi) {
					break;
				}
			}
		}
	}
	return goodShots.length;
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `target area: x=20..30, y=-10..-5`,
		extraArgs: [],
		expected: `45`
	}];
	const part2tests: TestCase[] = [{
		input: `target area: x=20..30, y=-10..-5`,
		extraArgs: [],
		expected: `112`
	}];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2021day17_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2021day17_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2021day17_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2021day17_part2(input));
	const part2After = performance.now();

	logSolution(17, 2021, part1Solution, part2Solution);

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
