import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2023;
const DAY = 20;

// solution path: /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/20/index.ts
// data path    : /home/trevorsg/dev/t-hugs/advent-of-code/years/2023/20/data.txt
// problem url  : https://adventofcode.com/2023/day/20

interface BaseModule {
	type: "flipflop" | "conjunction" | "broadcaster";
	name: string;
	destinations: string[];
}

interface Broadcaster extends BaseModule {
	type: "broadcaster";
}

interface FlipFlop extends BaseModule {
	state: "on" | "off";
	type: "flipflop";
}

interface Conjunction extends BaseModule {
	memory: { [name: string]: "high" | "low" };
	type: "conjunction";
}

type Module = Broadcaster | FlipFlop | Conjunction;

async function p2023day20_part1(input: string, ...params: any[]) {
	const lines = input.split("\n");
	const modules: { [name: string]: Module } = {};
	const conjunctionModules: Conjunction[] = [];
	for (const line of lines) {
		const [lhs, rhs] = line.split(" -> ");
		const destinations = rhs.split(", ");
		let name = lhs.slice(1);
		if (lhs === "broadcaster") {
			modules["broadcaster"] = { type: "broadcaster", name: "broadcaster", destinations };
		} else if (lhs[0] === "&") {
			const cm: Conjunction = { type: "conjunction", name, destinations, memory: {} };
			modules[name] = cm;
			conjunctionModules.push(cm);
		} else if (lhs[0] === "%") {
			modules[name] = { type: "flipflop", name, destinations, state: "off" } as FlipFlop;
		}
	}
	for (const cm of conjunctionModules) {
		for (const module of Object.values(modules)) {
			if (module.destinations.includes(cm.name)) {
				cm.memory[module.name] = "low";
			}
		}
	}

	let highCount = 0;
	let lowCount = 0;
	const pulses: [string, string, "high" | "low"][] = [];

	for (let i = 0; i < 1000; ++i) {
		lowCount++;
		pulses.push(["button", "broadcaster", "low"]);

		while (pulses.length > 0) {
			const [source, destination, type] = pulses.shift()!;
			const destinationModule = modules[destination];
			if (!destinationModule) {
				continue;
			}
			if (destinationModule.type === "broadcaster") {
				for (const dest of destinationModule.destinations) {
					if (type === "high") {
						highCount++;
					} else {
						lowCount++;
					}
					pulses.push([destinationModule.name, dest, type]);
				}
			} else if (destinationModule.type === "flipflop") {
				const flipFlopModule = destinationModule as FlipFlop;
				if (type === "low") {
					flipFlopModule.state = flipFlopModule.state === "off" ? "on" : "off";
					for (const dest of flipFlopModule.destinations) {
						const sendType = flipFlopModule.state === "off" ? "low" : "high";
						if (sendType === "high") {
							highCount++;
						} else {
							lowCount++;
						}
						pulses.push([destinationModule.name, dest, sendType]);
					}
				}
			} else if (destinationModule.type === "conjunction") {
				const conjunctionModule = destinationModule as Conjunction;
				conjunctionModule.memory[source] = type;
				if (Object.values(conjunctionModule.memory).every(v => v === "high")) {
					for (const dest of conjunctionModule.destinations) {
						lowCount++;
						pulses.push([destinationModule.name, dest, "low"]);
					}
				} else {
					for (const dest of conjunctionModule.destinations) {
						highCount++;
						pulses.push([destinationModule.name, dest, "high"]);
					}
				}
			}
		}
	}

	return highCount * lowCount;
}

async function p2023day20_part2(input: string, ...params: any[]) {
	const lines = input.split("\n");
	const modules: { [name: string]: Module } = {};
	const conjunctionModules: Conjunction[] = [];
	for (const line of lines) {
		const [lhs, rhs] = line.split(" -> ");
		const destinations = rhs.split(", ");
		let name = lhs.slice(1);
		if (lhs === "broadcaster") {
			modules["broadcaster"] = { type: "broadcaster", name: "broadcaster", destinations };
		} else if (lhs[0] === "&") {
			const cm: Conjunction = { type: "conjunction", name, destinations, memory: {} };
			modules[name] = cm;
			conjunctionModules.push(cm);
		} else if (lhs[0] === "%") {
			modules[name] = { type: "flipflop", name, destinations, state: "off" } as FlipFlop;
		}
	}
	for (const cm of conjunctionModules) {
		for (const module of Object.values(modules)) {
			if (module.destinations.includes(cm.name)) {
				cm.memory[module.name] = "low";
			}
		}
	}

	let highCount = 0;
	let lowCount = 0;
	const pulses: [string, string, "high" | "low"][] = [];

	for (let i = 1; ; ++i) {
		if (i % 10000 === 0) {
			console.log(i);
		}
		lowCount++;
		pulses.push(["button", "broadcaster", "low"]);

		while (pulses.length > 0) {
			const [source, destination, type] = pulses.shift()!;
			if (type === "low" && destination === "rx") {
				return i;
			}
			const destinationModule = modules[destination];
			if (!destinationModule) {
				continue;
			}
			if (destinationModule.type === "broadcaster") {
				for (const dest of destinationModule.destinations) {
					if (type === "high") {
						highCount++;
					} else {
						lowCount++;
					}
					pulses.push([destinationModule.name, dest, type]);
				}
			} else if (destinationModule.type === "flipflop") {
				const flipFlopModule = destinationModule as FlipFlop;
				if (type === "low") {
					flipFlopModule.state = flipFlopModule.state === "off" ? "on" : "off";
					for (const dest of flipFlopModule.destinations) {
						const sendType = flipFlopModule.state === "off" ? "low" : "high";
						if (sendType === "high") {
							highCount++;
						} else {
							lowCount++;
						}
						pulses.push([destinationModule.name, dest, sendType]);
					}
				}
			} else if (destinationModule.type === "conjunction") {
				const conjunctionModule = destinationModule as Conjunction;
				conjunctionModule.memory[source] = type;
				if (Object.values(conjunctionModule.memory).every(v => v === "high")) {
					for (const dest of conjunctionModule.destinations) {
						lowCount++;
						pulses.push([destinationModule.name, dest, "low"]);
					}
				} else {
					for (const dest of conjunctionModule.destinations) {
						highCount++;
						pulses.push([destinationModule.name, dest, "high"]);
					}
				}
			}
		}
	}

	return highCount * lowCount;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `broadcaster -> a, b, c
%a -> b
%b -> c
%c -> inv
&inv -> a`,
			extraArgs: [],
			expected: `32000000`,
			expectedPart2: ``,
		},
		{
			input: `broadcaster -> a
%a -> inv, con
&inv -> b
%b -> con
&con -> output`,
			extraArgs: [],
			expected: `11687500`,
			expectedPart2: ``,
		},
	];
	const part2tests: TestCase[] = [];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2023day20_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2023day20_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2023day20_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2023day20_part2(input));
	const part2After = performance.now();

	logSolution(20, 2023, part1Solution, part2Solution);

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
