import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2015;
const DAY = 15;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2015/15/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2015/15/data.txt
// problem url  : https://adventofcode.com/2015/day/15

interface Profile {
	capacity: number;
	durability: number;
	flavor: number;
	texture: number;
	calories: number;
}
async function p2015day15_part1(input: string) {
	const lines = input.split("\n");
	const ingredients: {
		[name: string]: Profile;
	} = {};
	for (const line of lines) {
		const ingredientName = line.split(":")[0];
		const [
			capacity,
			durability,
			flavor,
			texture,
			calories,
		] = /(-?\d+).*?(-?\d+).*?(-?\d+).*?(-?\d+).*?(-?\d+)/.exec(line)!.slice(1).map(Number);
		ingredients[ingredientName] = { capacity, durability, flavor, texture, calories };
	}
	let w: number = 1;
	let x: number = 1;
	let y: number = 1;
	let z: number;
	let i = 0;
	const ingredientNames = Object.keys(ingredients);
	let bestScore = 0;
	let bestVector = [0, 0, 0, 0];
	while (true) {
		z = 100 - y - x - w;
		// console.log(`(${w}, ${x}, ${y}, ${z})`);
		let totalScore = 1;
		for (const prop of ["capacity", "durability", "flavor", "texture"] as (keyof Profile)[]) {
			let score = Math.max(
				0,
				ingredients[ingredientNames[0]][prop] * w +
					ingredients[ingredientNames[1]][prop] * x +
					ingredients[ingredientNames[2]][prop] * y +
					ingredients[ingredientNames[3]][prop] * z
			);
			totalScore *= score;
			if (totalScore > bestScore) {
				bestScore = totalScore;
				bestVector = [w, x, y, z];
			}
		}

		i++;
		y += 1;
		if (y > 99 - x - w) {
			y = 1;
			x += 1;
			if (x > 98 - w) {
				x = 1;
				w += 1;
				if (w > 97) {
					break;
				}
			}
		}
	}
	console.log(`Best vector: ${bestVector}`);
	return bestScore;
}

async function p2015day15_part2(input: string) {
	const lines = input.split("\n");
	const ingredients: {
		[name: string]: Profile;
	} = {};
	for (const line of lines) {
		const ingredientName = line.split(":")[0];
		const [
			capacity,
			durability,
			flavor,
			texture,
			calories,
		] = /(-?\d+).*?(-?\d+).*?(-?\d+).*?(-?\d+).*?(-?\d+)/.exec(line)!.slice(1).map(Number);
		ingredients[ingredientName] = { capacity, durability, flavor, texture, calories };
	}
	let w: number = 1;
	let x: number = 1;
	let y: number = 1;
	let z: number;
	let i = 0;
	const ingredientNames = Object.keys(ingredients);
	let bestScore = 0;
	let bestVector = [0, 0, 0, 0];
	while (true) {
		z = 100 - y - x - w;
		// console.log(`(${w}, ${x}, ${y}, ${z})`);
		let totalScore = 1;
		const calories =
			ingredients[ingredientNames[0]]["calories"] * w +
			ingredients[ingredientNames[1]]["calories"] * x +
			ingredients[ingredientNames[2]]["calories"] * y +
			ingredients[ingredientNames[3]]["calories"] * z;
		if (calories === 500) {
			for (const prop of ["capacity", "durability", "flavor", "texture"] as (keyof Profile)[]) {
				let score = Math.max(
					0,
					ingredients[ingredientNames[0]][prop] * w +
						ingredients[ingredientNames[1]][prop] * x +
						ingredients[ingredientNames[2]][prop] * y +
						ingredients[ingredientNames[3]][prop] * z
				);
				totalScore *= score;
				if (totalScore > bestScore) {
					bestScore = totalScore;
					bestVector = [w, x, y, z];
				}
			}
		}

		i++;
		y += 1;
		if (y > 99 - x - w) {
			y = 1;
			x += 1;
			if (x > 98 - w) {
				x = 1;
				w += 1;
				if (w > 97) {
					break;
				}
			}
		}
	}
	console.log(`Best vector: ${bestVector}`);
	return bestScore;
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2015day15_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2015day15_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2015day15_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2015day15_part2(input));
	const part2After = performance.now();

	logSolution(15, 2015, part1Solution, part2Solution);

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
