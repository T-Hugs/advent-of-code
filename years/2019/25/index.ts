import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { runProgram } from "../intcode";

const YEAR = 2019;
const DAY = 25;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2019/25/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2019/25/data.txt
// problem url  : https://adventofcode.com/2019/day/25

async function p2019day25_part1(input: string) {
	const inputQueue: number[] = [];
	function queueInput(str: string) {
		for (let i = 0; i < str.length; ++i) {
			inputQueue.push(str.charCodeAt(i));
		}
		inputQueue.push(10);
	}
	interface Adjacents {
		north?: RoomData;
		east?: RoomData;
		south?: RoomData;
		west?: RoomData;
	}
	interface RoomData {
		roomName: string;
		flavor: string;
		adjacents: Adjacents;
		items: string[];
	}
	const badItems = ["escape pod", "giant electromagnet", "photons", "infinite loop", "molten lava"];
	const roomStore: { [room: string]: RoomData } = {};
	type Weight = "too heavy" | "too light" | undefined;
	function parseRoom(lines: string[], roomData: RoomData): [RoomData, Weight] {
		const roomName = /== (.*) ==/.exec(lines[0])![1];
		const flavor = lines[1];
		const adjacents: Adjacents = {};
		let lineIndex: number = 0;
		for (lineIndex = 3; ; ++lineIndex) {
			if (lines[lineIndex][0] !== "-") {
				break;
			}
			adjacents[lines[lineIndex].substr(2) as keyof Adjacents] = {} as RoomData;
		}
		const items: string[] = [];
		if (lines[lineIndex] === "Items here:") {
			lineIndex++;
			for (; ; ++lineIndex) {
				if (lines[lineIndex][0] !== "-") {
					break;
				}
				const item = lines[lineIndex].substr(2);
				items.push(item);
			}
		}
		let weight: Weight = undefined;
		if (lines[lineIndex].startsWith("A loud, robotic voice")) {
			if (lines[lineIndex].includes("lighter than")) {
				weight = "too heavy";
			}
			if (lines[lineIndex].includes("heavier than")) {
				weight = "too light";
			}
		}
		if (roomStore[roomName]) {
			return [roomStore[roomName], weight];
		}
		roomData.roomName = roomName;
		roomData.flavor = flavor;
		roomData.adjacents = adjacents;
		roomData.items = items;
		roomStore[roomName] = roomData;
		return [roomData, weight];
	}
	let tourPointer = 0;
	const tour = "wensswsnnnwweeswsewswenneseesss".split("").map(char => {
		if (char === "n") {
			return "north";
		}
		if (char === "e") {
			return "east";
		}
		if (char === "s") {
			return "south";
		}
		if (char === "w") {
			return "west";
		}
		throw new Error("Nope!");
	});
	const currentCommandBuffer: number[] = [];
	let currentRoom: RoomData = {} as RoomData;
	let atEntry = false;
	const inventory: string[] = [];
	let itemCombinations: string[][] | undefined = undefined;
	let combinationPointer = [172, 0];
	let currentlyDropping = false;
	const combinationIndexOutcomeMap: { [index: number]: "too heavy" | "too light" } = {};
	const badCombinationIndexes: Set<number> = new Set();
	function getNextCommand() {
		let lines = outBuffer
			.map(c => String.fromCharCode(c))
			.join("")
			.split("\n")
			.map(l => l.trim())
			.filter(l => l !== "");
		outBuffer.splice(0, outBuffer.length);
		if (lines) {
			trace(lines.join("\n"));
		}

		if (lines.length > 0) {
			if (lines[0].startsWith("==")) {
				const [parsedRoom, weight] = parseRoom(lines, currentRoom);
				if (weight === "too heavy") {
					combinationIndexOutcomeMap[combinationPointer[0] - 1] = "too heavy";
					for (let i = 0; i < itemCombinations!.length; ++i) {
						if (inventory.every(item => itemCombinations![i].indexOf(item) >= 0)) {
							badCombinationIndexes.add(i);
						}
					}
				} else if (weight === "too light") {
					combinationIndexOutcomeMap[combinationPointer[0] - 1] = "too light";
					for (let i = 0; i < itemCombinations!.length; ++i) {
						if (itemCombinations![i].every(item => inventory.indexOf(item) >= 0)) {
							badCombinationIndexes.add(i);
						}
					}
				}
				if (weight !== undefined) {
					_.noop();
				}
				currentRoom = parsedRoom;
			}
			if (lines[0].startsWith("You take the ")) {
				inventory.push(/You take the (.*)\./.exec(lines[0])![1]);
			}
			if (lines[0].startsWith("You drop the ")) {
				const droppedItem = /You drop the (.*)\./.exec(lines[0])![1];
				inventory.splice(inventory.indexOf(droppedItem), 1);
			}
		}
		const goodRoomItems = currentRoom.items.filter(i => badItems.indexOf(i) === -1);
		if (!atEntry && goodRoomItems.length > 0) {
			const takeItem = goodRoomItems.shift()!;
			currentRoom.items.splice(currentRoom.items.indexOf(takeItem), 1);
			return `take ${takeItem}`;
		}
		const dir = tour[tourPointer];
		if (dir != undefined) {
			const nextRoom = currentRoom.adjacents[dir];
			if (!nextRoom) {
				throw new Error("Bad direction.");
			}
			currentRoom = nextRoom;
			tourPointer++;
			return dir;
		}
		if (!atEntry) {
			itemCombinations = util.powerSet(inventory);
			atEntry = true;
			currentlyDropping = true;
		}
		if (currentlyDropping && inventory.length > 0) {
			return `drop ${inventory[0]}`;
		} else {
			currentlyDropping = false;
			const nextItemToTake = itemCombinations![combinationPointer[0]][combinationPointer[1]];
			if (nextItemToTake) {
				combinationPointer[1]++;
				return `take ${nextItemToTake}`;
			} else {
				currentlyDropping = true;
				combinationPointer[0]++;
				while (badCombinationIndexes.has(combinationPointer[0])) {
					trace("Skipping combination index " + combinationPointer[0]);
					combinationPointer[0]++;
				}
				combinationPointer[1] = 0;
				return "east"; // go east or something
			}
		}
	}
	function getInput() {
		if (currentCommandBuffer.length === 0) {
			// Ready for the next command. Read the screen.
			let nextCommand = getNextCommand();

			for (let i = 0; i < nextCommand.length; ++i) {
				currentCommandBuffer.push(nextCommand.charCodeAt(i));
			}
			currentCommandBuffer.push(10);
		}
		return currentCommandBuffer.shift()!;
	}

	const outBuffer: number[] = [];
	function handleOutput(val: number) {
		outBuffer.push(Number(val));
	}
	runProgram(input, getInput, handleOutput, {});
	const finalMessage = outBuffer.map(c => String.fromCharCode(c)).join("");
	trace(finalMessage);
	return /\d+/.exec(finalMessage)![0];
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2019day25_part1(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2019day25_part1(input));
	const part1After = performance.now();

	logSolution(25, 2019, part1Solution);

	log(chalk.gray("--- Performance ---"));
	log(chalk.gray(`Part 1: ${util.formatTime(part1After - part1Before)}`));
	log();
}

run()
	.then(() => {
		process.exit();
	})
	.catch(error => {
		throw error;
	});
