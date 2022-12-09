import _, { sum } from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2021;
const DAY = 16;

// solution path: C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\16\index.ts
// data path    : C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\16\data.txt
// problem url  : https://adventofcode.com/2021/day/16

const binMap: Obj<string> = {
	"0": "0000",
	"1": "0001",
	"2": "0010",
	"3": "0011",
	"4": "0100",
	"5": "0101",
	"6": "0110",
	"7": "0111",
	"8": "1000",
	"9": "1001",
	A: "1010",
	B: "1011",
	C: "1100",
	D: "1101",
	E: "1110",
	F: "1111",
};

async function p2021day16_part1(input: string, ...params: any[]) {
	const binStr = input
		.split("")
		.map(h => binMap[h])
		.join("");

	return parsePacket(binStr).versionSum;
}

function parsePacket(packet: string) {
	const version = parseInt(packet.slice(0, 3), 2);
	const type = parseInt(packet.slice(3, 6), 2);

	let versionSum = version;

	if (type === 4) {
		const [value, length] = getNextLiteralValue(packet.slice(6));
		return { versionSum, length: length + 6, value };
	} else {
		const lengthType = packet[6];
		const subValues: number[] = [];
		let lengthAcc = 0;
		if (lengthType === "0") {
			const subPacketLength = parseInt(packet.slice(7, 7 + 15), 2);
			const subPackets = packet.slice(7 + 15, 7 + 15 + subPacketLength);
			while (lengthAcc < subPacketLength) {
				const { versionSum: versions, length, value } = parsePacket(subPackets.slice(lengthAcc));
				lengthAcc += length;
				versionSum += versions;
				subValues.push(value);
			}
			lengthAcc += 15;
		} else {
			const subPacketCount = parseInt(packet.slice(7, 7 + 11), 2);
			for (let i = 0; i < subPacketCount; ++i) {
				const { versionSum: versions, length, value } = parsePacket(packet.slice(7 + 11 + lengthAcc));
				lengthAcc += length;
				versionSum += versions;
				subValues.push(value);
			}
			lengthAcc += 11;
		}
		let value = 0;
		switch (type) {
			case 0:
				value = sum(subValues);
				break;
			case 1:
				value = subValues.reduce((p, c) => p * c, 1);
				break;
			case 2:
				value = Math.min(...subValues);
				break;
			case 3:
				value = Math.max(...subValues);
				break;
			case 5:
				value = subValues[0] > subValues[1] ? 1 : 0;
				break;
			case 6:
				value = subValues[0] < subValues[1] ? 1 : 0;
				break;
			case 7:
				value = subValues[0] === subValues[1] ? 1 : 0;
		}
		return { versionSum, length: lengthAcc + 7, value };
	}
}

function getNextLiteralValue(partialPacket: string) {
	const digits = [];
	for (let i = 0; ; i += 5) {
		const chunk = partialPacket.slice(i, i + 5);
		const isLast = chunk[0] === "0";
		const val = chunk.slice(1, 5);
		digits.push(val);
		if (isLast) {
			return [parseInt(digits.join(""), 2), i + 5];
		}
	}
}

async function p2021day16_part2(input: string, ...params: any[]) {
	const binStr = input
		.split("")
		.map(h => binMap[h])
		.join("");

	return parsePacket(binStr).value;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `8A004A801A8002F478`,
			extraArgs: [],
			expected: `16`,
		},
		{
			input: `620080001611562C8802118E34`,
			extraArgs: [],
			expected: `12`,
		},
		{
			input: `C0015000016115A2E0802F182340`,
			extraArgs: [],
			expected: `23`,
		},
		{
			input: `A0016C880162017C3686B18A3D4780`,
			extraArgs: [],
			expected: `31`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `C200B40A82`,
			extraArgs: [],
			expected: `3`,
		},
		{
			input: `04005AC33890`,
			extraArgs: [],
			expected: `54`,
		},
		{
			input: `880086C3E88112`,
			extraArgs: [],
			expected: `7`,
		},
		{
			input: `CE00C43D881120`,
			extraArgs: [],
			expected: `9`,
		},
		{
			input: `D8005AC2A8F0`,
			extraArgs: [],
			expected: `1`,
		},
		{
			input: `F600BC2D8F`,
			extraArgs: [],
			expected: `0`,
		},
		{
			input: `9C005AC2F8F0`,
			extraArgs: [],
			expected: `0`,
		},
		{
			input: `9C0141080250320F1802104A08`,
			extraArgs: [],
			expected: `1`,
		},
	];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2021day16_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2021day16_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2021day16_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2021day16_part2(input));
	const part2After = performance.now();

	logSolution(16, 2021, part1Solution, part2Solution);

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
