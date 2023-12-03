import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { Cell, Grid } from "../../../util/grid";

const YEAR = 2023;
const DAY = 3;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/03/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/03/data.txt
// problem url  : https://adventofcode.com/2023/day/3

function isDigit(char: string) {
	return /\d/.test(char);
}

async function p2023day3_part1(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input });
	let currentNumber = "";
	let hasAdjacentSymbols = false;
	let sum = 0;
	for (const cell of grid) {
		if (isDigit(cell.value)) {
			currentNumber += cell.value;
			const adjacentCells = cell.neighbors(true, false);
			for (const adjacent of adjacentCells) {
				if (adjacent.value !== "." && !isDigit(adjacent.value)) {
					hasAdjacentSymbols = true;
				}
			}
		} 
		if (!isDigit(cell.value) || cell.isEastEdge()) {
			const number = Number(currentNumber);
			if (number && hasAdjacentSymbols) {
				sum += number;
			}
			hasAdjacentSymbols = false;
			currentNumber = "";
		}
		
	}
	return sum;
}

function getNumber(cell: Cell | undefined) {
	if (!cell || !isDigit(cell.value)) {
		return null;
	}
	let rightCells = [];
	let leftCells = [];
	let rightPointer = cell;
	let leftPointer = cell;
	while (true) {
		const nextRight = rightPointer.east();
		if (nextRight && isDigit(nextRight.value)) {
			rightCells.push(nextRight);
			rightPointer = nextRight;
		} else {
			break;
		}
	}
	while (true) {
		const nextLeft = leftPointer.west();
		if (nextLeft && isDigit(nextLeft.value)) {
			leftCells.push(nextLeft);
			leftPointer = nextLeft;
		} else {
			break;
		}
	}
	leftCells.reverse();
	let full = leftCells.map(c => c.value).join("") + cell.value + rightCells.map(c => c.value).join("");
	return Number(full);
}

async function p2023day3_part2(input: string, ...params: any[]) {
	const grid = new Grid({ serialized: input });

	const asterisks = grid.getCells(c => c.value === "*");
	let sum = 0;
	for (const asterisk of asterisks) {
		const topLeft = asterisk.north()?.west();
		const top = asterisk.north();
		const topRight = asterisk.north()?.east();
		const left = asterisk.west();
		const right = asterisk.east();
		const bottomLeft = asterisk.south()?.west();
		const bottom = asterisk.south();
		const bottomRight = asterisk.south()?.east();

		const topLeftNumber = getNumber(topLeft);
		const topNumber = getNumber(top);
		const topRightNumber = getNumber(topRight);
		const leftNumber = getNumber(left);
		const rightNumber = getNumber(right);
		const bottomLeftNumber = getNumber(bottomLeft);
		const bottomNumber = getNumber(bottom);
		const bottomRightNumber = getNumber(bottomRight);

		const arr = [topLeftNumber, topNumber, topRightNumber, leftNumber, rightNumber, bottomLeftNumber, bottomNumber, bottomRightNumber];

		if (topLeftNumber && topRightNumber && topNumber) {
			arr[1] = null;
			arr[2] = null;
		} else if (topLeftNumber && topNumber) {
			arr[1] = null;
		} else if (topRightNumber && topNumber) {
			arr[1] = null;
		}
		if (bottomLeftNumber && bottomRightNumber && bottomNumber) {
			arr[6] = null;
			arr[7] = null;
		} else if (bottomLeftNumber && bottomNumber) {
			arr[6] = null;
		} else if (bottomRightNumber && bottomNumber) {
			arr[6] = null;
		}
		const gears: number[] = arr.filter(x => x !== null) as any;
		if (gears.length === 2) {
			sum += gears.reduce((a, b) => a * b);
		}
	}
	return sum;
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `467..114..
...*......
..35..633.
......#...
617*......
.....+.58.
..592.....
......755.
...$.*....
.664.598..`,
		extraArgs: [],
		expected: `4361`
	}];
	const part2tests: TestCase[] = [{
		input: `467..114..
...*......
..35..633.
......#...
617*......
.....+.58.
..592.....
......755.
...$.*....
.664.598..`,
		extraArgs: [],
		expected: `467835`
	}];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2023day3_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2023day3_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2023day3_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2023day3_part2(input));
	const part2After = performance.now();

	logSolution(3, 2023, part1Solution, part2Solution);

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
