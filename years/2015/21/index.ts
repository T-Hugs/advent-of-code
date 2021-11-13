import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2015;
const DAY = 21;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2015/21/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2015/21/data.txt
// problem url  : https://adventofcode.com/2015/day/21

export function getArrangements(inputArr: Item[]) {
	const weapons = inputArr.filter(i => i.type === "weapon");
	const armors = inputArr.filter(i => i.type === "armor");
	const rings = inputArr.filter(i => i.type === "ring");

	const result: Item[][] = [];
	for (const weapon of weapons) {
		const arrangement = [weapon];
		result.push(arrangement);
		for (const armor of armors) {
			const withArmor = [...arrangement, armor];
			result.push(withArmor);
		}
	}
	for (const arrangement of result.slice()) {
		for (const ring of rings) {
			result.push([...arrangement, ring]);
		}
	}
	// Yeah I know this is bad code.
	for (const arrangement of result.slice()) {
		const ring = arrangement.find(a => a.type === "ring");
		if (ring) {
			for (const ring2 of rings) {
				if (ring === ring2) {
					continue;
				}
				result.push([...arrangement, ring2]);
			}
		}
	}

	return result;
}

interface Item {
	name: string;
	cost: number;
	damage: number;
	armor: number;
	type: string;
}
const store = [
	{ name: "Dagger", cost: 8, damage: 4, armor: 0, type: "weapon" },
	{ name: "Shortsword", cost: 10, damage: 5, armor: 0, type: "weapon" },
	{ name: "Warhammer", cost: 25, damage: 6, armor: 0, type: "weapon" },
	{ name: "Longsword", cost: 40, damage: 7, armor: 0, type: "weapon" },
	{ name: "Greataxe", cost: 74, damage: 8, armor: 0, type: "weapon" },
	{ name: "Leather", cost: 13, damage: 0, armor: 1, type: "armor" },
	{ name: "Chainmail", cost: 31, damage: 0, armor: 2, type: "armor" },
	{ name: "Splintmail", cost: 53, damage: 0, armor: 3, type: "armor" },
	{ name: "Bandedmail", cost: 75, damage: 0, armor: 4, type: "armor" },
	{ name: "Platemail", cost: 102, damage: 0, armor: 5, type: "armor" },
	{ name: "Damage +1", cost: 25, damage: 1, armor: 0, type: "ring" },
	{ name: "Damage +2", cost: 50, damage: 2, armor: 0, type: "ring" },
	{ name: "Damage +3", cost: 100, damage: 3, armor: 0, type: "ring" },
	{ name: "Defense +1", cost: 20, damage: 0, armor: 1, type: "ring" },
	{ name: "Defense +2", cost: 40, damage: 0, armor: 2, type: "ring" },
	{ name: "Defense +3", cost: 80, damage: 0, armor: 3, type: "ring" },
];

async function p2015day21_part1(input: string) {
	const lines = input.split("\n");
	const starting_boss_hp = Number(/\d+/.exec(lines[0])![0]);
	const starting_boss_damage = Number(/\d+/.exec(lines[1])![0]);
	const starting_boss_armor = Number(/\d+/.exec(lines[2])![0]);
	const starting_player_hp = 100;

	const arrangements = getArrangements(store);
	const winningArrangements: Item[][] = [];
	for (const arrangement of arrangements) {
		const player_damage = arrangement.reduce((p, c) => p + c.damage, 0);
		const player_armor = arrangement.reduce((p, c) => p + c.armor, 0);
		let player_hp = starting_player_hp;
		let boss_hp = starting_boss_hp;
		let turn = "player";
		while (player_hp > 0 && boss_hp > 0) {
			if (turn === "player") {
				boss_hp -= Math.max(1, player_damage - starting_boss_armor);
				turn = "boss";
			} else {
				player_hp -= Math.max(1, starting_boss_damage - player_armor);
				turn = "player";
			}
		}
		if (player_hp > 0) {
			winningArrangements.push(arrangement);
		}
	}
	return Math.min(...winningArrangements.map(a => a.reduce((p, c) => p + c.cost, 0)));
}

async function p2015day21_part2(input: string) {
	const lines = input.split("\n");
	const starting_boss_hp = Number(/\d+/.exec(lines[0])![0]);
	const starting_boss_damage = Number(/\d+/.exec(lines[1])![0]);
	const starting_boss_armor = Number(/\d+/.exec(lines[2])![0]);
	const starting_player_hp = 100;

	const arrangements = getArrangements(store);
	const losingArrangements: Item[][] = [];
	for (const arrangement of arrangements) {
		const player_damage = arrangement.reduce((p, c) => p + c.damage, 0);
		const player_armor = arrangement.reduce((p, c) => p + c.armor, 0);
		let player_hp = starting_player_hp;
		let boss_hp = starting_boss_hp;
		let turn = "player";
		while (player_hp > 0 && boss_hp > 0) {
			if (turn === "player") {
				boss_hp -= Math.max(1, player_damage - starting_boss_armor);
				turn = "boss";
			} else {
				player_hp -= Math.max(1, starting_boss_damage - player_armor);
				turn = "player";
			}
		}
		if (boss_hp > 0) {
			losingArrangements.push(arrangement);
		}
	}
	return Math.max(...losingArrangements.map(a => a.reduce((p, c) => p + c.cost, 0)));
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2015day21_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2015day21_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2015day21_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2015day21_part2(input));
	const part2After = performance.now();

	logSolution(21, 2015, part1Solution, part2Solution);

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
