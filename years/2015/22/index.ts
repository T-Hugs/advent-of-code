import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2015;
const DAY = 22;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2015/22/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2015/22/data.txt
// problem url  : https://adventofcode.com/2015/day/22

interface Spell {
	name: string;
	mana: number;
	damage?: number;
	heal?: number;
	createEffect?: () => () => TurnEffect;
}
interface TurnEffect {
	armor?: number;
	damage?: number;
	mana?: number;
	done: boolean;
}
const spells: Spell[] = [
	{
		name: "Magic Missile",
		mana: 53,
		damage: 4,
	},
	{
		name: "Drain",
		mana: 73,
		damage: 2,
		heal: 2,
	},
	{
		name: "Shield",
		mana: 113,
		createEffect: () => {
			let turns = 6;
			return () => {
				turns--;
				return {
					armor: 7,
					done: turns === 0,
				} as TurnEffect;
			};
		},
	},
	{
		name: "Poison",
		mana: 173,
		createEffect: () => {
			let turns = 6;
			return () => {
				turns--;
				return {
					damage: 3,
					done: turns === 0,
				} as TurnEffect;
			};
		},
	},
	{
		name: "Recharge",
		mana: 229,
		createEffect: () => {
			let turns = 5;
			return () => {
				turns--;
				return {
					mana: 101,
					done: turns === 0,
				} as TurnEffect;
			};
		},
	},
];

// function lowestManaToWin(
// 	bossHp: number,
// 	bossDamage: number,
// 	playerHp: number,
// 	playerMana: number,
// 	activeEffects: { [name: string]: () => TurnEffect } = {}
// ) {
// 	const outcomes: number[] = [];
// 	let nextBossHp = bossHp;
// 	let nextPlayerHp = playerHp;
// 	let nextPlayerMana = playerMana;
// 	let playerArmor = 0;
// 	for (const name in activeEffects) {
// 		const result = activeEffects[name]();
// 		if (result.done) {
// 			delete activeEffects[name];
// 		}
// 		if (result.armor) {
// 			playerArmor = result.armor;
// 		}
// 		if (result.damage) {
// 			nextBossHp -= result.damage;
// 		}
// 		if (result.mana) {
// 			nextPlayerMana += result.mana;
// 		}
// 	}
// }

function playGame(moves: string[] = [], playerHp: number, playerMana: number, bossHp: number, bossDamage: number) {
	let activeEffects: { [name: string]: () => TurnEffect } = {};
	let playerArmor = 0;
	for (const move of moves) {
		console.log("\n==Next Turn==");
		playerArmor = 0;
		for (const effect in activeEffects) {
			const result = activeEffects[effect]();
			if (result.done) {
				delete activeEffects[effect];
			}
			if (result.armor) {
				console.log("Player has " + result.armor + " armor from shield spell.");
				playerArmor = result.armor;
			}
			if (result.damage) {
				console.log("Boss is dealt " + result.damage + " damage from poison spell.");
				bossHp -= result.damage;
			}
			if (result.mana) {
				console.log("Player gets " + result.mana + " mana from recharge spell.");
				playerMana += result.mana;
			}
		}
		console.log(`Player --  HP: ${playerHp}, Armor: ${playerArmor}, Mana: ${playerMana}`);
		const spell = spells.find(s => s.name === move)!;
		console.log("Casting " + spell.name + " spell!");
		if (spell.damage) {
			bossHp -= spell.damage;
		}
		if (spell.heal) {
			playerHp += spell.heal;
		}
		if (spell.createEffect) {
			activeEffects[spell.name] = spell.createEffect();
		}
		playerMana -= spell.mana;
		if (bossHp <= 0) {
			console.log("Player wins!");
			return;
		}

		playerArmor = 0;
		for (const effect in activeEffects) {
			const result = activeEffects[effect]();
			if (result.done) {
				delete activeEffects[effect];
			}
			if (result.armor) {
				console.log("Player has " + result.armor + " armor from shield spell.");
				playerArmor = result.armor;
			}
			if (result.damage) {
				console.log("Boss is dealt " + result.damage + " damage from poison spell.");
				bossHp -= result.damage;
			}
			if (result.mana) {
				console.log("Player gets " + result.mana + " mana from recharge spell.");
				playerMana += result.mana;
			}
		}
		if (bossHp <= 0) {
			console.log("Player wins!");
			return;
		}
		console.log(`Boss -- HP: ${bossHp}`);
		playerHp -= bossDamage - playerArmor;
		if (playerHp <= 0) {
			console.log("Boss wins :(");
			return;
		}
	}
}

async function p2015day22_part1(input: string) {
	const lines = input.split("\n");
	const starting_boss_hp = Number(/\d+/.exec(lines[0])![0]);
	const starting_boss_damage = Number(/\d+/.exec(lines[1])![0]);
	const starting_player_mana = 500;
	const starting_player_hp = 50;

	// Find *some* winning moveset using the code below:

	// Ok, so funny story: this actually gets the right answer if you run enough trials (~10-100). I guess it's so hard for the player to win
	// without making exactly the right moves.
	let winningMovesets: Spell[][] = [];
	while (true) {
		let activeEffects: { [name: string]: () => TurnEffect } = {};
		let bossHp = starting_boss_hp;
		let bossDamage = starting_boss_damage;
		let player_mana = starting_player_mana;
		let player_hp = starting_player_hp;
		let player_armor = 0;
		let spellOrder: Spell[] = [];
		let win = false;
		while (true) {
			player_armor = 0;
			// Run effects each turn.
			for (const effect in activeEffects) {
				const result = activeEffects[effect]();
				if (result.done) {
					delete activeEffects[effect];
				}
				if (result.armor) {
					player_armor = result.armor;
				}
				if (result.damage) {
					bossHp -= result.damage;
				}
				if (result.mana) {
					player_mana += result.mana;
				}
			}
			if (bossHp <= 0) {
				win = true;
				break;
			}

			// Find a legal spell to cast
			const legalSpells = spells.filter(s => !activeEffects[s.name] && s.mana <= player_mana);
			if (legalSpells.length === 0) {
				break;
			}
			let nextSpell = legalSpells[Math.floor(Math.random() * legalSpells.length)];

			// Cast the spell
			spellOrder.push(nextSpell);
			if (nextSpell.damage) {
				bossHp -= nextSpell.damage;
			}
			if (nextSpell.heal) {
				player_hp += nextSpell.heal;
			}
			if (nextSpell.createEffect) {
				activeEffects[nextSpell.name] = nextSpell.createEffect();
			}
			player_mana -= nextSpell.mana;
			if (bossHp <= 0) {
				win = true;
				break;
			}

			// Run the boss' turn, starting with spell effects.
			player_armor = 0;
			for (const effect in activeEffects) {
				const result = activeEffects[effect]();
				if (result.done) {
					delete activeEffects[effect];
				}
				if (result.armor) {
					player_armor = result.armor;
				}
				if (result.damage) {
					bossHp -= result.damage;
				}
				if (result.mana) {
					player_mana += result.mana;
				}
			}
			if (bossHp <= 0) {
				win = true;
				break;
			}
			player_hp -= bossDamage - player_armor;
			if (player_hp < 0) {
				break;
			}
		}
		if (win) {
			winningMovesets.push(spellOrder);
			if (winningMovesets.length === 100) {
				break;
			}
		}
	}

	let bestSet: Spell[] = [];
	let lowestMana = Number.MAX_VALUE;
	for (const set of winningMovesets) {
		const mana = set.map(s => s.mana).reduce((p, c) => p + c, 0);
		if (mana < lowestMana) {
			bestSet = set;
			lowestMana = mana;
		}
	}

	return lowestMana;
}

async function p2015day22_part2(input: string) {
	const lines = input.split("\n");
	const starting_boss_hp = Number(/\d+/.exec(lines[0])![0]);
	const starting_boss_damage = Number(/\d+/.exec(lines[1])![0]);
	const starting_player_mana = 500;
	const starting_player_hp = 50;

	// Find *some* winning moveset using the code below:

	// Ok, so funny story: this actually gets the right answer if you run enough trials (~10-100). I guess it's so hard for the player to win
	// without making exactly the right moves.
	let winningMovesets: Spell[][] = [];
	while (true) {
		let activeEffects: { [name: string]: () => TurnEffect } = {};
		let bossHp = starting_boss_hp;
		let bossDamage = starting_boss_damage;
		let player_mana = starting_player_mana;
		let player_hp = starting_player_hp;
		let player_armor = 0;
		let spellOrder: Spell[] = [];
		let win = false;
		while (true) {
			player_armor = 0;
			player_hp -= 1;
			if (player_hp <= 0) {
				break;
			}
			// Run effects each turn.
			for (const effect in activeEffects) {
				const result = activeEffects[effect]();
				if (result.done) {
					delete activeEffects[effect];
				}
				if (result.armor) {
					player_armor = result.armor;
				}
				if (result.damage) {
					bossHp -= result.damage;
				}
				if (result.mana) {
					player_mana += result.mana;
				}
			}
			if (bossHp <= 0) {
				win = true;
				break;
			}

			// Find a legal spell to cast
			const legalSpells = spells.filter(s => !activeEffects[s.name] && s.mana <= player_mana);
			if (legalSpells.length === 0) {
				break;
			}
			let nextSpell = legalSpells[Math.floor(Math.random() * legalSpells.length)];

			// Cast the spell
			spellOrder.push(nextSpell);
			if (nextSpell.damage) {
				bossHp -= nextSpell.damage;
			}
			if (nextSpell.heal) {
				player_hp += nextSpell.heal;
			}
			if (nextSpell.createEffect) {
				activeEffects[nextSpell.name] = nextSpell.createEffect();
			}
			player_mana -= nextSpell.mana;
			if (bossHp <= 0) {
				win = true;
				break;
			}

			// Run the boss' turn, starting with spell effects.
			player_armor = 0;
			for (const effect in activeEffects) {
				const result = activeEffects[effect]();
				if (result.done) {
					delete activeEffects[effect];
				}
				if (result.armor) {
					player_armor = result.armor;
				}
				if (result.damage) {
					bossHp -= result.damage;
				}
				if (result.mana) {
					player_mana += result.mana;
				}
			}
			if (bossHp <= 0) {
				win = true;
				break;
			}
			player_hp -= bossDamage - player_armor;
			if (player_hp < 0) {
				break;
			}
		}
		if (win) {
			winningMovesets.push(spellOrder);
			if (winningMovesets.length === 5) {
				break;
			}
		}
	}

	let bestSet: Spell[] = [];
	let lowestMana = Number.MAX_VALUE;
	for (const set of winningMovesets) {
		const mana = set.map(s => s.mana).reduce((p, c) => p + c, 0);
		if (mana < lowestMana) {
			bestSet = set;
			lowestMana = mana;
		}
	}

	return lowestMana;
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2015day22_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2015day22_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2015day22_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2015day22_part2(input));
	const part2After = performance.now();

	logSolution(22, 2015, part1Solution, part2Solution);

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
