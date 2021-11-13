import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { runProgram, compute } from "../intcode";

const YEAR = 2019;
const DAY = 23;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2019/23/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2019/23/data.txt
// problem url  : https://adventofcode.com/2019/day/23

async function p2019day23_part1(input: string) {
	const inputQueues: { [id: number]: number[][] } = { 255: [] };
	const numComputers = 50;
	for (let i = 0; i < numComputers; ++i) {
		inputQueues[i] = [[i]];
	}
	const outputBuffers: { [id: number]: number[] } = {};
	for (let i = 0; i < numComputers; ++i) {
		outputBuffers[i] = [];
	}

	const getInputFunc = (id: number) => {
		return () => {
			if (inputQueues[id].length > 0) {
				const next = inputQueues[id][0].shift();
				if (inputQueues[id][0].length === 0) {
					inputQueues[id].shift();
				}
				return next!;
			} else {
				return -1;
			}
		};
	};

	const getOutputFunc = (id: number) => {
		return (val: number) => {
			outputBuffers[id].push(val);
			if (outputBuffers[id].length === 3) {
				const [dest, x, y] = outputBuffers[id];
				inputQueues[dest].push([x, y]);
				outputBuffers[id].splice(0, outputBuffers[id].length);
			}
		};
	};

	const computers: any[] = [];
	const intcodeProgram = input.split(",").map(Number);
	for (let i = 0; i < numComputers; ++i) {
		computers.push([intcodeProgram.slice(), getInputFunc(i), getOutputFunc(i), { id: i }, 1]);
	}

	for (let i = 0; ; i++) {
		const computer: [any, any, any, any] = computers[i % numComputers];
		const result = compute(...computer);
		computer[0] = result;
		if (inputQueues[255][0] != undefined) {
			return inputQueues[255][0][1];
		}
	}
}

async function p2019day23_part2(input: string) {
	const inputQueues: { [id: number]: number[][] } = {};
	const natMemory: { senderId?: number; packet?: number[]; inputHistory: { [id: number]: number[] } } = {
		inputHistory: {},
	};
	const numComputers = 50;
	for (let i = 0; i < numComputers; ++i) {
		inputQueues[i] = [[i]];
		natMemory.inputHistory[i] = [];
	}
	const outputBuffers: { [id: number]: number[] } = {};
	for (let i = 0; i < numComputers; ++i) {
		outputBuffers[i] = [];
	}

	const getInputFunc = (id: number) => {
		return () => {
			let result;
			if (inputQueues[id].length > 0) {
				const next = inputQueues[id][0].shift();
				if (inputQueues[id][0].length === 0) {
					inputQueues[id].shift();
				}
				result = next!;
			} else {
				result = -1;
			}
			natMemory.inputHistory[id].push(result);
			while (natMemory.inputHistory[id].length > 5) {
				natMemory.inputHistory[id].shift();
			}
			return result;
		};
	};

	const getOutputFunc = (id: number) => {
		return (val: number) => {
			outputBuffers[id].push(val);
			if (outputBuffers[id].length === 3) {
				const [dest, x, y] = outputBuffers[id];
				if (dest === 255) {
					natMemory.senderId = id;
					natMemory.packet = [x, y];
				} else {
					inputQueues[dest].push([x, y]);
				}
				outputBuffers[id].splice(0, outputBuffers[id].length);
			}
		};
	};

	let lastYDelivered: number;
	const checkNat = () => {
		let allNeg1 = true;
		for (const id of Object.keys(natMemory.inputHistory)) {
			if (natMemory.inputHistory[Number(id)].some(v => v !== -1)) {
				allNeg1 = false;
			}
		}
		if (allNeg1 && natMemory.packet) {
			inputQueues[0].push(natMemory.packet);
			if (natMemory.packet[1] === lastYDelivered) {
				return lastYDelivered;
			} else {
				lastYDelivered = natMemory.packet[1];
			}
			natMemory.packet = undefined;
		}
		return undefined;
	};

	const computers: any[] = [];
	const intcodeProgram = input.split(",").map(Number);
	for (let i = 0; i < numComputers; ++i) {
		computers.push([intcodeProgram.slice(), getInputFunc(i), getOutputFunc(i), { id: i }, 1]);
	}

	for (let i = 0; ; i++) {
		const computer: [any, any, any, any] = computers[i % numComputers];
		const result = compute(...computer);
		computer[0] = result;
		const dupY = checkNat();
		if (dupY != undefined) {
			return dupY;
		}
	}
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2019day23_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2019day23_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2019day23_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2019day23_part2(input));
	const part2After = performance.now();

	logSolution(23, 2019, part1Solution, part2Solution);

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
