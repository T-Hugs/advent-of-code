import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import aStar, { AStarOptions } from "a-star";
import levenshtein from "fast-levenshtein";
import { performance } from "perf_hooks";

const YEAR = 2015;
const DAY = 19;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2015/19/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2015/19/data.txt
// problem url  : https://adventofcode.com/2015/day/19

let neighborMemo: { [molecule: string]: string[] } = {};
function getNeighbors(molecule: string, replacements: { [lhs: string]: string[] }) {
	if (neighborMemo[molecule]) {
		return neighborMemo[molecule];
	}
	const molecules: string[] = [];
	for (const search of Object.keys(replacements)) {
		let index = 0;
		while (index !== -1) {
			index = molecule.indexOf(search, index);
			if (index !== -1) {
				for (const repl of replacements[search]) {
					molecules.push(molecule.substr(0, index) + repl + molecule.substr(index + search.length));
				}
				index++;
			}
		}
	}
	const neighbors = _.uniq(molecules);
	neighborMemo[molecule] = neighbors;
	return neighbors;
}

async function p2015day19_part1(input: string) {
	neighborMemo = {};
	const replacements: { [lhs: string]: string[] } = {};
	let molecule = "";
	let onMolecule = false;
	for (const line of input.split("\n").map(l => l.trim())) {
		if (line === "") {
			onMolecule = true;
			continue;
		}
		if (!onMolecule) {
			const [lhs, rhs] = line.split(" => ");
			if (!replacements[lhs]) {
				replacements[lhs] = [rhs];
			} else {
				replacements[lhs].push(rhs);
			}
		} else {
			molecule = line;
		}
	}

	return getNeighbors(molecule, replacements).length;
}

async function p2015day19_part2(input: string) {
	neighborMemo = {};
	const replacements: { [lhs: string]: string[] } = {};
	let molecule = "";
	let onMolecule = false;
	for (const line of input.split("\n").map(l => l.trim())) {
		if (line === "") {
			onMolecule = true;
			continue;
		}
		if (!onMolecule) {
			// NOTICE: RHS and LHS have been switched in the line below!
			const [rhs, lhs] = line.split(" => ");
			if (!replacements[lhs]) {
				replacements[lhs] = [rhs];
			} else {
				replacements[lhs].push(rhs);
			}
		} else {
			molecule = line;
		}
	}
	const options: AStarOptions<string> = {
		start: molecule,
		isEnd: (node: string) => node === "e",
		neighbor: (node: string) => getNeighbors(node, replacements),
		heuristic: (node: string) => levenshtein.get(node, "e"),
		distance: () => 1,
	};
	return aStar(options).path.length - 1;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `H => HO
H => OH
O => HH

HOH`,
			expected: `4`,
		},
		{
			input: `H => HO
H => OH
O => HH

HOHOHO`,
			expected: `7`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `e => H
e => O
H => HO
H => OH
O => HH

HOH`,
			expected: `3`,
		},
		{
			input: `e => H
e => O
H => HO
H => OH
O => HH

HOHOHO`,
			expected: `6`,
		},
	];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2015day19_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2015day19_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2015day19_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2015day19_part2(input));
	const part2After = performance.now();

	logSolution(19, 2015, part1Solution, part2Solution);

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
