import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2020;
const DAY = 21;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2020/21/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2020/21/data.txt
// problem url  : https://adventofcode.com/2020/day/21
function intersect(...sets: Array<Set<any>>) {
	if (!sets.length) return new Set();
	const i = sets.reduce((m, s, i) => (s.size < sets[m].size ? i : m), 0);
	const [smallest] = sets.splice(i, 1);
	const res = new Set();
	for (let val of smallest) if (sets.every(s => s.has(val))) res.add(val);
	return res;
}
async function p2020day21_part1(input: string) {
	const lines = input.split("\n");
	const things: [string[], string[]][] = [];
	for (const line of lines) {
		const contains = /\(contains (.*?)\)/.exec(line)![1].split(", ");
		const words = line.split(" ");
		const ingredients: string[] = [];
		for (const word of words) {
			if (word.includes("(")) {
				break;
			}
			ingredients.push(word);
		}
		things.push([ingredients, contains]);
	}

	const allAllergens = _.uniq(things.map(thing => thing[1]).flat(1));
	const possibleIngredients: Obj<string[]> = {};
	let allergenIngredients: string[] = [];
	for (const a of allAllergens) {
		const sets = things.filter(t => t[1].includes(a)).map(t => new Set(t[0]));
		const possible = intersect(...sets);
		possibleIngredients[a] = Array.from(possible) as string[];
		// possibleIngredients[a] = _.uniq(things.filter(t => t[1].includes(a)).map(t => t[0]).flat());
		allergenIngredients.push(...possibleIngredients[a]);
	}
	allergenIngredients = _.uniq(allergenIngredients);
	const allIngredients = _.uniq(things.map(thing => thing[0]).flat());
	const notAllergen: string[] = [];
	for (const i of allIngredients) {
		if (!allergenIngredients.includes(i)) {
			notAllergen.push(i);
		}
	}

	let count = 0;
	for (const thing of things) {
		for (const i of thing[0]) {
			if (notAllergen.includes(i)) {
				count++;
			}
		}
	}
	return count;
}

async function p2020day21_part2(input: string) {
	const lines = input.split("\n");
	const things: [string[], string[]][] = [];
	for (const line of lines) {
		const contains = /\(contains (.*?)\)/.exec(line)![1].split(", ");
		const words = line.split(" ");
		const ingredients: string[] = [];
		for (const word of words) {
			if (word.includes("(")) {
				break;
			}
			ingredients.push(word);
		}
		things.push([ingredients, contains]);
	}

	const allAllergens = _.uniq(things.map(thing => thing[1]).flat(1));
	const possibleIngredients: Obj<string[]> = {};
	let allergenIngredients: string[] = [];
	for (const a of allAllergens) {
		const sets = things.filter(t => t[1].includes(a)).map(t => new Set(t[0]));
		const possible = intersect(...sets);
		possibleIngredients[a] = Array.from(possible) as string[];
		// possibleIngredients[a] = _.uniq(things.filter(t => t[1].includes(a)).map(t => t[0]).flat());
		allergenIngredients.push(...possibleIngredients[a]);
	}
	allergenIngredients = _.uniq(allergenIngredients);
	const allIngredients = _.uniq(things.map(thing => thing[0]).flat());
	const notAllergen: string[] = [];
	for (const i of allIngredients) {
		if (!allergenIngredients.includes(i)) {
			notAllergen.push(i);
		}
	}

	let count = 0;
	for (const thing of things) {
		for (const i of thing[0]) {
			if (notAllergen.includes(i)) {
				count++;
			}
		}
	}

	while (Object.values(possibleIngredients).some(a => a.length > 1)) {
		outer: for (const [allergen, ingredients] of Object.entries(possibleIngredients)) {
			if (ingredients.length === 1) {
				for (const [a2, i2] of Object.entries(possibleIngredients)) {
					if (a2 === allergen) {
						continue;
					}
					if (i2.includes(ingredients[0])) {
						_.remove(i2, x => x === ingredients[0]);
						continue outer;
					}
				}
			}
		}
	}

	const entries = Object.entries(possibleIngredients);
	entries.sort((a, b) => a[0].localeCompare(b[0]));
	return entries.map(e => e[1]).join(",");
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `mxmxvkd kfcds sqjhc nhms (contains dairy, fish)
trh fvjkl sbzzf mxmxvkd (contains dairy)
sqjhc fvjkl (contains soy)
sqjhc mxmxvkd sbzzf (contains fish)`,
			expected: `5`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `mxmxvkd kfcds sqjhc nhms (contains dairy, fish)
trh fvjkl sbzzf mxmxvkd (contains dairy)
sqjhc fvjkl (contains soy)
sqjhc mxmxvkd sbzzf (contains fish)`,
			expected: `mxmxvkd,sqjhc,fvjkl`,
		},
	];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2020day21_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2020day21_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2020day21_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2020day21_part2(input));
	const part2After = performance.now();

	logSolution(21, 2020, part1Solution, part2Solution);

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
