/*
 * 
 * ===================== NOTE =====================
 * 
 * This file is a huge jumbled mess and intended
 * to be useful for anything,except the most
 * fleeting of copy-and-paste and paste excursions.
 * 
 */


const NDijkstra = require("node-dijkstra");

let idSeed = 1;
let ENABLE_LOGGING = false;
function compute(von_neumann, inputBuffer = [], outputBuffer = [], reg = {}) {
	let inputIterator;
	if (isIterable(inputBuffer)) {
		inputIterator = inputBuffer[Symbol.iterator]();
	} else if (typeof inputBuffer === "function") {
		inputIterator = {
			next: () => {
				return {
					value: inputBuffer(),
					done: false,
				};
			},
		};
	}

	if (!reg.pc) {
		reg.pc = 0;
	}
	if (!reg.rb) {
		reg.rb = 0;
	}

	if (!reg.id) {
		reg.id = idSeed++;
	}
	log("SPIN UP COMPUTER ID=" + reg.id, 0);
	let program = [...von_neumann];

	function log(msg, level = 2) {
		let tabs = "";
		for (let i = 0; i < level; ++i) {
			tabs += "    ";
		}
		if (ENABLE_LOGGING) {
			console.log(reg.id + ": " + tabs + msg);
		}
	}

	function isIterable(obj) {
		// checks for null and undefined
		if (obj == null) {
			return false;
		}
		return typeof obj[Symbol.iterator] === "function";
	}

	function readInput() {
		let readValue = inputIterator.next().value;
		return readValue;
	}

	function writeOutput(val) {
		if (Array.isArray(outputBuffer)) {
			outputBuffer.push(val);
		}
		if (typeof outputBuffer === "function") {
			outputBuffer(val);
		}
	}

	function add(program, op1, op2, dest) {
		log("Adding " + op1 + " + " + op2 + " to " + dest);
		program[dest] = BigInt(op1) + BigInt(op2);
	}

	function multiply(program, op1, op2, dest) {
		log("Multiplying " + op1 + " * " + op2 + " to " + dest);
		program[dest] = BigInt(op1) * BigInt(op2);
	}

	function input(program, dest) {
		const inVal = readInput();
		log("Read val " + inVal + ", writing to " + dest);
		if (inVal != null) {
			program[dest] = BigInt(inVal);
		} else {
			log("No input. Halting.");
			reg.err = "ENOINPUT";
			return "ERR";
		}
	}

	function output(program, outVal) {
		log("Writing val " + outVal);
		writeOutput(outVal);
	}

	function jumpTrue(program, test, dest) {
		log("Jump if " + test + " is true to " + dest);
		if (test !== 0n) {
			reg.pc = Number(dest);
		}
	}

	function jumpFalse(program, test, dest) {
		log("Jump if " + test + " is false to " + dest);
		if (test === 0n) {
			reg.pc = Number(dest);
		}
	}

	function lessThan(program, op1, op2, dest) {
		log("Computing " + op1 + " < " + op2 + " to " + dest);
		program[dest] = op1 < op2 ? 1 : 0;
	}

	function equal(program, op1, op2, dest) {
		log("Computing " + op1 + " = " + op2 + " to " + dest);
		program[dest] = op1 === op2 ? 1 : 0;
	}

	function adjustRelativeBase(program, delta) {
		const drb = Number(delta);
		reg.rb += drb;
		log("Adjusting relative base by " + drb + " to " + reg.rb);
	}

	function decode(opCode) {
		const instructionMap = {
			1: {
				func: add,
				arity: 3,
				writeArgs: [2],
			},
			2: {
				func: multiply,
				arity: 3,
				writeArgs: [2],
			},
			3: {
				func: input,
				arity: 1,
				writeArgs: [0],
			},
			4: {
				func: output,
				arity: 1,
			},
			5: {
				func: jumpTrue,
				arity: 2,
			},
			6: {
				func: jumpFalse,
				arity: 2,
			},
			7: {
				func: lessThan,
				arity: 3,
				writeArgs: [2],
			},
			8: {
				func: equal,
				arity: 3,
				writeArgs: [2],
			},
			9: {
				func: adjustRelativeBase,
				arity: 1,
			},
			99: {
				trap: "STOP",
				arity: 0,
			},
		};
		const instruction = opCode % 100n;
		let remaining = opCode / 100n;
		const paramModes = [];
		while (remaining > 0) {
			paramModes.push(Number(remaining % 10n));
			remaining = remaining / 10n;
		}

		const result = { ...instructionMap[instruction] };
		while (paramModes.length < result.arity) {
			paramModes.push(0);
		}
		result.paramModes = paramModes;

		return result;
	}

	function exec(program, command, params) {
		if (command.trap) {
			return command.trap;
		}

		const args = [...params];
		for (let i = 0; i < command.arity; ++i) {
			if (command.paramModes[i] === 0) {
				if (!command.writeArgs || command.writeArgs.indexOf(i) === -1) {
					args[i] = program[Number(args[i])] || 0n;
				}
			} else if (command.paramModes[i] === 2) {
				log("Relative! rb = " + reg.rb + ", type: " + typeof reg.rb);
				if (command.writeArgs && command.writeArgs.indexOf(i) >= 0) {
					args[i] = Number(args[i]) + reg.rb || 0n;
				} else {
					args[i] = program[Number(args[i]) + reg.rb] || 0n;
				}
				log("Args: " + args);
			}
		}
		if (command.func) {
			const oldPc = reg.pc;
			const result = command.func(program, ...args);

			// Might need to bail (i.e. no input to read)
			if (result !== undefined) {
				return result;
			}

			// If the instruction didn't manually update the PC, go to the
			// logical next instruction.
			if (oldPc === reg.pc) {
				reg.pc += 1 + command.arity;
			}
		}
	}

	while (true) {
		const opCode = program[reg.pc];
		const instruction = decode(opCode);
		const params = program.slice(reg.pc + 1, reg.pc + 1 + instruction.arity);
		log("opCode: " + opCode + ", " + "params: [" + params.join(",") + "], pc: " + reg.pc + ", rb: " + reg.rb, 1);
		const result = exec(program, instruction, params);

		// check any traps
		if (result === "STOP" || result === "ERR") {
			reg.ec = result;
			break;
		}
	}

	return program;
}

function runProgram(str, inputBuffer = [], outputBuffer = [], reg = {}) {
	const von_neumann = str.split(",").map(v => BigInt(v));
	return compute(von_neumann, inputBuffer, outputBuffer, reg);
}

function p2_2() {
	let target = 19690720;
	let input =
		"1,0,0,3,1,1,2,3,1,3,4,3,1,5,0,3,2,1,9,19,1,10,19,23,2,9,23,27,1,6,27,31,2,31,9,35,1,5,35,39,1,10,39,43,1,10,43,47,2,13,47,51,1,10,51,55,2,55,10,59,1,9,59,63,2,6,63,67,1,5,67,71,1,71,5,75,1,5,75,79,2,79,13,83,1,83,5,87,2,6,87,91,1,5,91,95,1,95,9,99,1,99,6,103,1,103,13,107,1,107,5,111,2,111,13,115,1,115,6,119,1,6,119,123,2,123,13,127,1,10,127,131,1,131,2,135,1,135,5,0,99,2,14,0,0";

	let inArr = input.split(",").map(v => parseInt(v, 10));

	for (let i = 0; i < 100; ++i) {
		for (let j = 0; j < 100; ++j) {
			inArr[1] = i;
			inArr[2] = j;
			let result = compute(inArr);
			if (result[0] === target) {
				console.log("i: " + i + ", j: " + j);
				return i * 100 + j;
			}
		}
	}
}

function p3_1() {
	let input = `R993,U847,R868,D286,L665,D860,R823,U934,L341,U49,R762,D480,R899,D23,L273,D892,R43,U740,L940,U502,L361,U283,L852,D630,R384,D758,R655,D358,L751,U970,R72,D245,L188,D34,R355,U373,L786,U188,L304,D621,L956,D839,R607,U279,L459,U340,R412,D901,L929,U256,R495,D462,R369,D138,R926,D551,L343,U237,L434,U952,R421,U263,L663,D694,R687,D522,L47,U8,L399,D930,R928,U73,L581,U452,R80,U610,L998,D797,R584,U772,L521,U292,L959,U356,L940,D894,R774,U957,L813,D650,L891,U309,L254,D271,R791,D484,L399,U106,R463,D39,L210,D154,L380,U86,L136,D228,L284,D267,R195,D727,R739,D393,R395,U703,L385,U483,R433,U222,L945,D104,L605,D814,L656,U860,L474,D672,L812,U789,L29,D256,R857,U436,R927,U99,R171,D727,L244,D910,L347,U789,R49,U598,L218,D834,L574,U647,L185,U986,L273,D363,R848,U531,R837,U433,L795,U923,L182,D915,R367,D347,R867,U789,L776,U568,R969,U923,L765,D589,R772,U715,R38,D968,L845,D327,R721,D928,R267,U94,R763,U799,L946,U130,L649,U521,L569,D139,R584,D27,L823,D918,L450,D390,R149,U237,L696,U258,L757,U810,L216,U202,L966,U157,R702,D623,R740,D560,R932,D587,L197,D56,R695,U439,R655,U576,R695,D176,L800,D374,R806,U969,L664,U216,L170,D415,R485,U188,L444,D613,R728,U508,L644,U289,R831,D978,R711,U973,R3,U551,R377,U114,L15,U812,R210,D829,L536,D883,L843,D427,L311,D680,R482,D69,R125,D953,L896,D85,R376,D683,R374,U415,L3,U843,L802,D124,R299,U345,L696,D276,L87,D98,R619,D321,R348,D806,L789,U657,R590,D747,L477,U251,R854,D351,L82,D982,R906,D94,R285,U756,L737,D377,L951,U126,L852,D751,L946,U696,L44,D709,R851,D364,R222
L1002,D658,L695,U170,L117,U93,R700,D960,L631,U483,L640,D699,R865,U886,L59,D795,R265,U803,R705,D580,R519,U685,R126,D888,R498,U934,L980,U734,L91,D50,R805,U197,R730,U363,R337,U594,L666,U702,L237,D140,L72,U980,L167,U598,L726,U497,L340,D477,L304,U945,R956,U113,L43,D4,R890,D316,R916,D644,R704,D398,L905,U361,R420,U31,L317,U338,R703,D211,R27,D477,L746,U813,R705,U191,L504,D434,R697,D945,R835,D374,L512,U269,L299,U448,R715,U363,R266,U720,L611,U672,L509,D983,L21,U895,L340,D794,R528,U603,R154,D610,L582,U420,L696,U599,R16,U610,L134,D533,R156,D338,L761,U49,L335,D238,R146,U97,L997,U545,L896,D855,L653,D789,R516,D371,L99,D731,R868,D182,R535,D35,R190,D618,R10,D694,L567,D17,R356,U820,R671,D883,R807,U218,L738,U225,L145,D954,R588,U505,R108,U178,R993,D788,R302,D951,R697,D576,L324,U930,R248,D245,R622,U323,R667,U876,L987,D411,L989,U915,R157,D67,L968,U61,R274,D189,L53,D133,R617,D958,L379,U563,L448,D412,R940,U12,R885,U121,R746,U215,R420,U346,L469,D839,R964,D273,R265,D3,L714,D224,L177,U194,L573,U511,L795,U299,L311,U923,R815,U594,L654,U326,L547,U547,R467,D937,L174,U453,R635,D551,L365,U355,R658,U996,R458,D623,R61,U181,R340,U163,L329,D496,L787,D335,L37,D565,R318,U942,R198,U85,R328,D826,R817,D118,R138,D29,L434,D427,R222,D866,L10,D152,R822,D779,L900,D307,R723,D363,L715,D60,R661,U680,R782,U789,R311,D36,R425,U498,L910,D546,R394,D52,R803,D168,L6,U769,R856,D999,L786,U695,R568,U236,R472,U291,L530,U314,L251,D598,R648,D475,L132,D236,L915,D695,L700,U378,L685,D240,R924,D977,R627,U824,L165`;

	//   input = `R8,U5,L5,D3
	// U7,R6,D4,L4`;

	//   input = `R75,D30,R83,U83,L12,D49,R71,U7,L72
	// U62,R66,U55,R34,D71,R55,D58,R83`;

	const [path1str, path2str] = input.split("\n");
	const [path1, path2] = [path1str, path2str].map(path => path.split(","));

	const path1Nodes = {};
	const path2Nodes = {};

	function getDeltas(dir) {
		let dx = dir === "U" || dir === "D" ? 0 : dir === "L" ? -1 : 1;
		let dy = dir === "L" || dir === "R" ? 0 : dir === "D" ? -1 : 1;
		return [dx, dy];
	}

	let x = 0;
	let y = 0;
	for (const move of path1) {
		const dir = move.substr(0, 1);
		const mag = move.substr(1);
		const [dx, dy] = getDeltas(dir);

		for (let i = 0; i < mag; ++i) {
			x += dx;
			y += dy;
			const pos = String(x) + "," + String(y);
			path1Nodes[pos] = true;
		}
	}

	let shortestDistance = Number.MAX_SAFE_INTEGER;
	x = 0;
	y = 0;
	for (const move of path2) {
		const dir = move.substr(0, 1);
		const mag = move.substr(1);
		const [dx, dy] = getDeltas(dir);

		for (let i = 0; i < mag; ++i) {
			x += dx;
			y += dy;
			const pos = String(x) + "," + String(y);
			// console.dir(pos);
			if (path1Nodes[pos]) {
				//console.log("Intersection at (" + x + ", " + y + ")");
				const distance = Math.abs(x) + Math.abs(y);
				if (distance < shortestDistance) {
					shortestDistance = distance;
				}
			}
		}
	}
	return shortestDistance;
}

function p3_2() {
	let input = `R993,U847,R868,D286,L665,D860,R823,U934,L341,U49,R762,D480,R899,D23,L273,D892,R43,U740,L940,U502,L361,U283,L852,D630,R384,D758,R655,D358,L751,U970,R72,D245,L188,D34,R355,U373,L786,U188,L304,D621,L956,D839,R607,U279,L459,U340,R412,D901,L929,U256,R495,D462,R369,D138,R926,D551,L343,U237,L434,U952,R421,U263,L663,D694,R687,D522,L47,U8,L399,D930,R928,U73,L581,U452,R80,U610,L998,D797,R584,U772,L521,U292,L959,U356,L940,D894,R774,U957,L813,D650,L891,U309,L254,D271,R791,D484,L399,U106,R463,D39,L210,D154,L380,U86,L136,D228,L284,D267,R195,D727,R739,D393,R395,U703,L385,U483,R433,U222,L945,D104,L605,D814,L656,U860,L474,D672,L812,U789,L29,D256,R857,U436,R927,U99,R171,D727,L244,D910,L347,U789,R49,U598,L218,D834,L574,U647,L185,U986,L273,D363,R848,U531,R837,U433,L795,U923,L182,D915,R367,D347,R867,U789,L776,U568,R969,U923,L765,D589,R772,U715,R38,D968,L845,D327,R721,D928,R267,U94,R763,U799,L946,U130,L649,U521,L569,D139,R584,D27,L823,D918,L450,D390,R149,U237,L696,U258,L757,U810,L216,U202,L966,U157,R702,D623,R740,D560,R932,D587,L197,D56,R695,U439,R655,U576,R695,D176,L800,D374,R806,U969,L664,U216,L170,D415,R485,U188,L444,D613,R728,U508,L644,U289,R831,D978,R711,U973,R3,U551,R377,U114,L15,U812,R210,D829,L536,D883,L843,D427,L311,D680,R482,D69,R125,D953,L896,D85,R376,D683,R374,U415,L3,U843,L802,D124,R299,U345,L696,D276,L87,D98,R619,D321,R348,D806,L789,U657,R590,D747,L477,U251,R854,D351,L82,D982,R906,D94,R285,U756,L737,D377,L951,U126,L852,D751,L946,U696,L44,D709,R851,D364,R222
L1002,D658,L695,U170,L117,U93,R700,D960,L631,U483,L640,D699,R865,U886,L59,D795,R265,U803,R705,D580,R519,U685,R126,D888,R498,U934,L980,U734,L91,D50,R805,U197,R730,U363,R337,U594,L666,U702,L237,D140,L72,U980,L167,U598,L726,U497,L340,D477,L304,U945,R956,U113,L43,D4,R890,D316,R916,D644,R704,D398,L905,U361,R420,U31,L317,U338,R703,D211,R27,D477,L746,U813,R705,U191,L504,D434,R697,D945,R835,D374,L512,U269,L299,U448,R715,U363,R266,U720,L611,U672,L509,D983,L21,U895,L340,D794,R528,U603,R154,D610,L582,U420,L696,U599,R16,U610,L134,D533,R156,D338,L761,U49,L335,D238,R146,U97,L997,U545,L896,D855,L653,D789,R516,D371,L99,D731,R868,D182,R535,D35,R190,D618,R10,D694,L567,D17,R356,U820,R671,D883,R807,U218,L738,U225,L145,D954,R588,U505,R108,U178,R993,D788,R302,D951,R697,D576,L324,U930,R248,D245,R622,U323,R667,U876,L987,D411,L989,U915,R157,D67,L968,U61,R274,D189,L53,D133,R617,D958,L379,U563,L448,D412,R940,U12,R885,U121,R746,U215,R420,U346,L469,D839,R964,D273,R265,D3,L714,D224,L177,U194,L573,U511,L795,U299,L311,U923,R815,U594,L654,U326,L547,U547,R467,D937,L174,U453,R635,D551,L365,U355,R658,U996,R458,D623,R61,U181,R340,U163,L329,D496,L787,D335,L37,D565,R318,U942,R198,U85,R328,D826,R817,D118,R138,D29,L434,D427,R222,D866,L10,D152,R822,D779,L900,D307,R723,D363,L715,D60,R661,U680,R782,U789,R311,D36,R425,U498,L910,D546,R394,D52,R803,D168,L6,U769,R856,D999,L786,U695,R568,U236,R472,U291,L530,U314,L251,D598,R648,D475,L132,D236,L915,D695,L700,U378,L685,D240,R924,D977,R627,U824,L165`;

	//   input = `R8,U5,L5,D3
	//U7,R6,D4,L4`;

	//   input = `R75,D30,R83,U83,L12,D49,R71,U7,L72
	// U62,R66,U55,R34,D71,R55,D58,R83`;

	const [path1str, path2str] = input.split("\n");
	const [path1, path2] = [path1str, path2str].map(path => path.split(","));

	const path1Nodes = {};

	function getDeltas(dir) {
		let dx = dir === "U" || dir === "D" ? 0 : dir === "L" ? -1 : 1;
		let dy = dir === "L" || dir === "R" ? 0 : dir === "D" ? -1 : 1;
		return [dx, dy];
	}

	let x = 0;
	let y = 0;
	let steps = 0;
	for (const move of path1) {
		const dir = move.substr(0, 1);
		const mag = move.substr(1);
		const [dx, dy] = getDeltas(dir);

		for (let i = 0; i < mag; ++i) {
			steps++;
			x += dx;
			y += dy;
			const pos = String(x) + "," + String(y);
			path1Nodes[pos] = steps;
		}
	}

	let fewestSteps = Number.MAX_SAFE_INTEGER;
	x = 0;
	y = 0;
	steps = 0;
	for (const move of path2) {
		const dir = move.substr(0, 1);
		const mag = move.substr(1);
		const [dx, dy] = getDeltas(dir);

		for (let i = 0; i < mag; ++i) {
			steps++;
			x += dx;
			y += dy;
			const pos = String(x) + "," + String(y);
			// console.dir(pos);
			if (path1Nodes[pos]) {
				console.log("Intersection at (" + x + ", " + y + ") on step " + steps);
				const totalSteps = path1Nodes[pos] + steps;
				if (totalSteps < fewestSteps) {
					fewestSteps = totalSteps;
				}
			}
		}
	}
	return fewestSteps;
}

function p4_1() {
	let input = "206938-679128";
	//input = "122345-122345"

	const [low, high] = input.split("-").map(v => parseInt(v, 10));

	function getDigit(num, index) {
		return Number(String(num)[index]);
	}

	function numIsValid(num) {
		const length = String(num).length;

		// has a repeated digit
		let repeats = false;
		let currentDigit = getDigit(num, 0);
		for (let j = 1; j < length; ++j) {
			const nextDigit = getDigit(num, j);
			if (nextDigit === currentDigit) {
				repeats = true;
				break;
			}
			currentDigit = nextDigit;
		}
		if (!repeats) {
			return false;
		}

		// increases
		let increases = true;
		currentDigit = getDigit(num, 0);
		for (let j = 1; j < length; ++j) {
			const nextDigit = getDigit(num, j);
			if (currentDigit > nextDigit) {
				increases = false;
				break;
			}
			currentDigit = nextDigit;
		}
		if (!increases) {
			return false;
		}

		//console.log(`${num} is valid`)

		return true;
	}

	let totalValid = 0;
	for (let num = low; num <= high; ++num) {
		if (numIsValid(num)) {
			totalValid++;
		}
	}
	return totalValid;
}

function p4_2() {
	let input = "206938-679128";
	//input = "122345-122345"

	const [low, high] = input.split("-").map(v => parseInt(v, 10));

	function getDigit(num, index) {
		return Number(String(num)[index]);
	}

	function numIsValid(num) {
		const length = String(num).length;

		// has a digit repeated exactly twice
		let repeatCount = 0;
		let currentDigit = getDigit(num, 0);
		for (let j = 1; j < length; ++j) {
			const nextDigit = getDigit(num, j);
			if (nextDigit === currentDigit) {
				repeatCount++;
			} else {
				if (repeatCount === 1) {
					break;
				}
				repeatCount = 0;
			}
			currentDigit = nextDigit;
		}
		if (repeatCount !== 1) {
			return false;
		}

		// increases
		let increases = true;
		currentDigit = getDigit(num, 0);
		for (let j = 1; j < length; ++j) {
			const nextDigit = getDigit(num, j);
			if (currentDigit > nextDigit) {
				increases = false;
				break;
			}
			currentDigit = nextDigit;
		}
		if (!increases) {
			return false;
		}

		//console.log(`${num} is valid`)

		return true;
	}

	let totalValid = 0;
	for (let num = low; num <= high; ++num) {
		if (numIsValid(num)) {
			totalValid++;
		}
	}
	return totalValid;
}

function p5_1() {
	const inputBuffer = [1];
	const outputBuffer = [];
	const programText = `3,225,1,225,6,6,1100,1,238,225,104,0,1102,16,13,225,1001,88,68,224,101,-114,224,224,4,224,1002,223,8,223,1001,224,2,224,1,223,224,223,1101,8,76,224,101,-84,224,224,4,224,102,8,223,223,101,1,224,224,1,224,223,223,1101,63,58,225,1102,14,56,224,101,-784,224,224,4,224,102,8,223,223,101,4,224,224,1,223,224,223,1101,29,46,225,102,60,187,224,101,-2340,224,224,4,224,102,8,223,223,101,3,224,224,1,224,223,223,1102,60,53,225,1101,50,52,225,2,14,218,224,101,-975,224,224,4,224,102,8,223,223,1001,224,3,224,1,223,224,223,1002,213,79,224,101,-2291,224,224,4,224,102,8,223,223,1001,224,2,224,1,223,224,223,1,114,117,224,101,-103,224,224,4,224,1002,223,8,223,101,4,224,224,1,224,223,223,1101,39,47,225,101,71,61,224,101,-134,224,224,4,224,102,8,223,223,101,2,224,224,1,224,223,223,1102,29,13,225,1102,88,75,225,4,223,99,0,0,0,677,0,0,0,0,0,0,0,0,0,0,0,1105,0,99999,1105,227,247,1105,1,99999,1005,227,99999,1005,0,256,1105,1,99999,1106,227,99999,1106,0,265,1105,1,99999,1006,0,99999,1006,227,274,1105,1,99999,1105,1,280,1105,1,99999,1,225,225,225,1101,294,0,0,105,1,0,1105,1,99999,1106,0,300,1105,1,99999,1,225,225,225,1101,314,0,0,106,0,0,1105,1,99999,1107,677,677,224,102,2,223,223,1006,224,329,1001,223,1,223,108,677,677,224,1002,223,2,223,1005,224,344,101,1,223,223,1008,226,226,224,102,2,223,223,1006,224,359,1001,223,1,223,1107,226,677,224,102,2,223,223,1006,224,374,1001,223,1,223,8,677,226,224,102,2,223,223,1006,224,389,101,1,223,223,8,226,226,224,102,2,223,223,1006,224,404,101,1,223,223,7,677,677,224,1002,223,2,223,1006,224,419,101,1,223,223,7,677,226,224,1002,223,2,223,1005,224,434,101,1,223,223,1108,677,226,224,1002,223,2,223,1006,224,449,1001,223,1,223,108,677,226,224,1002,223,2,223,1006,224,464,101,1,223,223,1108,226,677,224,1002,223,2,223,1006,224,479,101,1,223,223,1007,677,677,224,1002,223,2,223,1006,224,494,1001,223,1,223,107,226,226,224,102,2,223,223,1005,224,509,1001,223,1,223,1008,677,226,224,102,2,223,223,1005,224,524,1001,223,1,223,1007,226,226,224,102,2,223,223,1006,224,539,101,1,223,223,1108,677,677,224,102,2,223,223,1005,224,554,1001,223,1,223,1008,677,677,224,1002,223,2,223,1006,224,569,101,1,223,223,1107,677,226,224,1002,223,2,223,1006,224,584,1001,223,1,223,7,226,677,224,102,2,223,223,1005,224,599,101,1,223,223,108,226,226,224,1002,223,2,223,1005,224,614,101,1,223,223,107,226,677,224,1002,223,2,223,1005,224,629,1001,223,1,223,107,677,677,224,1002,223,2,223,1006,224,644,101,1,223,223,1007,677,226,224,1002,223,2,223,1006,224,659,101,1,223,223,8,226,677,224,102,2,223,223,1005,224,674,1001,223,1,223,4,223,99,226`;
	runProgram(programText, inputBuffer, outputBuffer);
	console.dir(outputBuffer);
	return outputBuffer[outputBuffer.length - 1];
}

function p5_2() {
	const inputBuffer = [5];
	const outputBuffer = [];
	const programText = `3,225,1,225,6,6,1100,1,238,225,104,0,1102,16,13,225,1001,88,68,224,101,-114,224,224,4,224,1002,223,8,223,1001,224,2,224,1,223,224,223,1101,8,76,224,101,-84,224,224,4,224,102,8,223,223,101,1,224,224,1,224,223,223,1101,63,58,225,1102,14,56,224,101,-784,224,224,4,224,102,8,223,223,101,4,224,224,1,223,224,223,1101,29,46,225,102,60,187,224,101,-2340,224,224,4,224,102,8,223,223,101,3,224,224,1,224,223,223,1102,60,53,225,1101,50,52,225,2,14,218,224,101,-975,224,224,4,224,102,8,223,223,1001,224,3,224,1,223,224,223,1002,213,79,224,101,-2291,224,224,4,224,102,8,223,223,1001,224,2,224,1,223,224,223,1,114,117,224,101,-103,224,224,4,224,1002,223,8,223,101,4,224,224,1,224,223,223,1101,39,47,225,101,71,61,224,101,-134,224,224,4,224,102,8,223,223,101,2,224,224,1,224,223,223,1102,29,13,225,1102,88,75,225,4,223,99,0,0,0,677,0,0,0,0,0,0,0,0,0,0,0,1105,0,99999,1105,227,247,1105,1,99999,1005,227,99999,1005,0,256,1105,1,99999,1106,227,99999,1106,0,265,1105,1,99999,1006,0,99999,1006,227,274,1105,1,99999,1105,1,280,1105,1,99999,1,225,225,225,1101,294,0,0,105,1,0,1105,1,99999,1106,0,300,1105,1,99999,1,225,225,225,1101,314,0,0,106,0,0,1105,1,99999,1107,677,677,224,102,2,223,223,1006,224,329,1001,223,1,223,108,677,677,224,1002,223,2,223,1005,224,344,101,1,223,223,1008,226,226,224,102,2,223,223,1006,224,359,1001,223,1,223,1107,226,677,224,102,2,223,223,1006,224,374,1001,223,1,223,8,677,226,224,102,2,223,223,1006,224,389,101,1,223,223,8,226,226,224,102,2,223,223,1006,224,404,101,1,223,223,7,677,677,224,1002,223,2,223,1006,224,419,101,1,223,223,7,677,226,224,1002,223,2,223,1005,224,434,101,1,223,223,1108,677,226,224,1002,223,2,223,1006,224,449,1001,223,1,223,108,677,226,224,1002,223,2,223,1006,224,464,101,1,223,223,1108,226,677,224,1002,223,2,223,1006,224,479,101,1,223,223,1007,677,677,224,1002,223,2,223,1006,224,494,1001,223,1,223,107,226,226,224,102,2,223,223,1005,224,509,1001,223,1,223,1008,677,226,224,102,2,223,223,1005,224,524,1001,223,1,223,1007,226,226,224,102,2,223,223,1006,224,539,101,1,223,223,1108,677,677,224,102,2,223,223,1005,224,554,1001,223,1,223,1008,677,677,224,1002,223,2,223,1006,224,569,101,1,223,223,1107,677,226,224,1002,223,2,223,1006,224,584,1001,223,1,223,7,226,677,224,102,2,223,223,1005,224,599,101,1,223,223,108,226,226,224,1002,223,2,223,1005,224,614,101,1,223,223,107,226,677,224,1002,223,2,223,1005,224,629,1001,223,1,223,107,677,677,224,1002,223,2,223,1006,224,644,101,1,223,223,1007,677,226,224,1002,223,2,223,1006,224,659,101,1,223,223,8,226,677,224,102,2,223,223,1005,224,674,1001,223,1,223,4,223,99,226`;
	runProgram(programText, inputBuffer, outputBuffer);
	console.dir(outputBuffer);
	return outputBuffer[outputBuffer.length - 1];
}

function p6_1() {
	const fs = require("fs");
	const data = fs.readFileSync("./p6_1.data", "utf-8");
	const lines = data.split("\n").map(v => v.trim());

	const graph = {};
	for (const line of lines) {
		const [l, r] = line.split(")");
		graph[l] = { parent: null };
		graph[r] = { parent: null };
	}
	for (const line of lines) {
		const [l, r] = line.split(")");
		graph[r].parent = graph[l];
	}
	let numOrbits = 0;
	for (const key in graph) {
		let par = graph[key].parent;
		while (par !== null) {
			numOrbits++;
			par = par.parent;
		}
	}
	return numOrbits;
}

function p6_2() {
	const fs = require("fs");
	let data = fs.readFileSync("./p6_1.data", "utf-8");

	const lines = data.split("\n").map(v => v.trim());

	const graph = {};
	for (const line of lines) {
		const [l, r] = line.split(")");
		graph[l] = { parent: null, name: l };
		graph[r] = { parent: null, name: r };
	}
	for (const line of lines) {
		const [l, r] = line.split(")");
		graph[r].parent = graph[l];
	}

	function pathToParent(start, parent) {
		let current = start;
		let target = parent;
		const result = [];
		while (current !== target) {
			result.push(current.parent);
			current = current.parent;
		}
		return result;
	}
	const YOUtoCOM = pathToParent(graph.YOU, graph.COM);
	const SANtoCOM = pathToParent(graph.SAN, graph.COM);
	YOUtoCOM.reverse();
	SANtoCOM.reverse();
	let i;
	for (i = 0; i < Math.min(YOUtoCOM.length, SANtoCOM.length); ++i) {
		if (YOUtoCOM[i] !== SANtoCOM[i]) {
			i--;
			break;
		}
	}
	return YOUtoCOM.length - i - 1 + SANtoCOM.length - i - 1;
}

function getPermutations(inputArr) {
	const result = [];

	function permute(arr, m = []) {
		if (arr.length === 0) {
			result.push(m);
		} else {
			for (let i = 0; i < arr.length; ++i) {
				const current = arr.slice();
				const next = current.splice(i, 1);
				permute(current.slice(), m.concat(next));
			}
		}
	}

	permute(inputArr);

	return result;
}

function p7_1() {
	const program = `3,8,1001,8,10,8,105,1,0,0,21,30,39,64,81,102,183,264,345,426,99999,3,9,1001,9,2,9,4,9,99,3,9,1002,9,4,9,4,9,99,3,9,1002,9,5,9,101,2,9,9,102,3,9,9,1001,9,2,9,1002,9,2,9,4,9,99,3,9,1002,9,3,9,1001,9,5,9,1002,9,3,9,4,9,99,3,9,102,4,9,9,1001,9,3,9,102,4,9,9,1001,9,5,9,4,9,99,3,9,101,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,1001,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,1,9,9,4,9,3,9,101,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,1,9,4,9,99,3,9,1002,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,101,1,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,1001,9,1,9,4,9,3,9,102,2,9,9,4,9,99,3,9,101,1,9,9,4,9,3,9,101,2,9,9,4,9,3,9,101,1,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,1001,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,1,9,9,4,9,99,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,101,2,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,2,9,4,9,99,3,9,101,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,1001,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,101,1,9,9,4,9,99`;
	const phasePermutations = getPermutations([0, 1, 2, 3, 4]);

	let highestSignal = 0;
	for (const permutation of phasePermutations) {
		let nextInput = 0;
		for (const amplifier of permutation) {
			const output = [];
			const input = [amplifier, nextInput];
			runProgram(program, input, output);
			nextInput = output[0];
		}
		if (nextInput > highestSignal) {
			highestSignal = nextInput;
		}
	}
	return highestSignal;
}

function p7_2() {
	ENABLE_LOGGING = false;
	let program = `3,8,1001,8,10,8,105,1,0,0,21,30,39,64,81,102,183,264,345,426,99999,3,9,1001,9,2,9,4,9,99,3,9,1002,9,4,9,4,9,99,3,9,1002,9,5,9,101,2,9,9,102,3,9,9,1001,9,2,9,1002,9,2,9,4,9,99,3,9,1002,9,3,9,1001,9,5,9,1002,9,3,9,4,9,99,3,9,102,4,9,9,1001,9,3,9,102,4,9,9,1001,9,5,9,4,9,99,3,9,101,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,1001,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,1,9,9,4,9,3,9,101,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,1,9,4,9,99,3,9,1002,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,101,1,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,1001,9,1,9,4,9,3,9,102,2,9,9,4,9,99,3,9,101,1,9,9,4,9,3,9,101,2,9,9,4,9,3,9,101,1,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,1001,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,1,9,9,4,9,99,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,101,2,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,2,9,4,9,99,3,9,101,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,1001,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,101,1,9,9,4,9,99`;
	// program = `3,26,1001,26,-4,26,3,27,1002,27,2,27,1,27,26,27,4,27,1001,28,-1,28,1005,28,6,99,0,0,5`;
	// program = `3,52,1001,52,-5,52,3,53,1,52,56,54,1007,54,5,55,1005,55,26,1001,54,-5,54,1105,1,12,1,53,54,53,1008,54,0,55,1001,55,1,55,2,53,55,53,4,53,1001,56,-1,56,1005,56,6,99,0,0,0,0,10`;

	let phasePermutations = getPermutations([5, 6, 7, 8, 9]);

	let highestSignal = 0;
	for (const permutation of phasePermutations) {
		const buffers = {};
		for (const phase of permutation) {
			buffers[phase] = [phase];
		}
		buffers[permutation[0]].push(0);
		const inputFuncs = {};
		const computers = {};
		for (let i = 0; ; ++i) {
			const phase = permutation[i % permutation.length];
			if (!computers[phase]) {
				const vn = program.split(",").map(v => parseInt(v, 10));
				computers[phase] = [vn, buffers[phase], buffers[permutation[(i + 1) % permutation.length]], {}];
			}
			const result = compute(...computers[phase]);
			computers[phase][0] = result; // save state for next run

			if (computers[phase][3].ec === "ERR" && computers[phase][3].err === "ENOINPUT") {
				continue;
			} else if (computers[phase][3].ec === "STOP" && i % permutation.length === permutation.length - 1) {
				break; // break when the last amp halts.
			}

			if (i === 10000000) {
				console.log("i too large, breaking");
				break;
			}
		}

		const lastOutputBuffer = buffers[permutation[0]];
		const toThrusters = lastOutputBuffer[lastOutputBuffer.length - 1];
		if (toThrusters > highestSignal) {
			highestSignal = toThrusters;
		}
	}
	return highestSignal;
}

function p8_1() {
	const fs = require("fs");
	let data = fs.readFileSync("./p8_1.data", "utf-8");

	let image = data.split("").map(v => parseInt(v, 10));
	let w = 25;
	let h = 6;

	// image = "011222112233".split("").map(v => parseInt(v, 10));
	// w = 3;
	// h = 2;

	const layers = [];

	for (let i = 0; i < image.length; ++i) {
		const layerNum = Math.floor(i / (w * h));
		if (!layers[layerNum]) {
			layers.push([]);
		}
		layers[layerNum].push(image[i]);
	}

	let fewest0s = Number.MAX_SAFE_INTEGER;
	let fewest0sLayer = null;
	for (const layer of layers) {
		const num0s = layer.filter(v => v === 0).length;
		if (num0s < fewest0s) {
			fewest0s = num0s;
			fewest0sLayer = layer;
		}
	}
	return fewest0sLayer.filter(v => v === 1).length * fewest0sLayer.filter(v => v === 2).length;
}

function p8_2() {
	const fs = require("fs");
	let data = fs.readFileSync("./p8_1.data", "utf-8");

	let image = data.split("").map(v => parseInt(v, 10));
	let w = 25;
	let h = 6;

	// image = "011222112233".split("").map(v => parseInt(v, 10));
	// w = 3;
	// h = 2;

	const layers = [];

	for (let i = 0; i < image.length; ++i) {
		const layerNum = Math.floor(i / (w * h));
		if (!layers[layerNum]) {
			layers.push([]);
		}
		layers[layerNum].push(image[i]);
	}

	let flat = [];
	for (let i = 0; i < w * h; ++i) {
		let layerNum = 0;
		while (layers[layerNum][i] === 2) {
			layerNum++;
		}
		flat.push(layers[layerNum][i]);
	}

	let render = "";
	for (let i = 0; i < w * h; ++i) {
		if (i % w === 0) {
			render += "\n";
		}
		if (flat[i] === 0) {
			render += " ";
		}
		if (flat[i] === 1) {
			render += "#";
		}
	}

	return render;
}

function p9_1() {
	ENABLE_LOGGING = true;
	const fs = require("fs");
	let data = fs.readFileSync("./p9_1.data", "utf-8");
	//data = "109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99";

	const inputBuffer = [1];
	const outputBuffer = [];
	runProgram(data, inputBuffer, outputBuffer);
	return outputBuffer;
}

function p9_2() {
	ENABLE_LOGGING = false;
	const fs = require("fs");
	let data = fs.readFileSync("./p9_1.data", "utf-8");
	//data = "109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99";

	const inputBuffer = [2];
	const outputBuffer = [];
	runProgram(data, inputBuffer, outputBuffer);
	return outputBuffer;
}

function p10_1() {
	function getGcd(a, b) {
		return b ? getGcd(b, a % b) : a;
	}
	function reduce(num, denom) {
		gcd = getGcd(num, denom);
		return [num / gcd, denom / gcd];
	}

	const fs = require("fs");
	let data = fs.readFileSync("./p10_1.data", "utf-8");
	// data = `.#..#
	// .....
	// #####
	// ....#
	// ...##`;

	const rows = data.split("\n").map(v => v.trim());
	let mostVisible = 0;

	for (let i = 0; i < rows.length; ++i) {
		const row = rows[i];

		for (let j = 0; j < row.length; ++j) {
			const spot = row[j];

			if (spot !== "#") {
				continue;
			}

			let visible = 0;

			for (let k = 0; k < rows.length; ++k) {
				const checkRow = rows[k];

				for (let l = 0; l < checkRow.length; ++l) {
					if (k === i && l === j) {
						continue; // it's our own spot!
					}
					const checkSpot = checkRow[l];
					if (checkSpot !== "#") {
						continue;
					}

					const rise = k - i;
					const run = l - j;
					const slope = reduce(rise, run).map(Math.abs);
					if (rise < 0) {
						slope[0] *= -1;
					}
					if (run < 0) {
						slope[1] *= -1;
					}

					let factor = 1;
					let check_x = l - slope[1];
					let check_y = k - slope[0];
					let blocked = false;
					while (!(check_x === j && check_y === i)) {
						if (rows[check_y][check_x] === "#") {
							blocked = true;
							break;
						}
						factor++;
						check_x = l - factor * slope[1];
						check_y = k - factor * slope[0];
					}
					if (!blocked) {
						visible++;
					}
				}
			}

			if (visible > mostVisible) {
				mostVisible = visible;
			}
		}
	}
	return mostVisible;
}

function p10_2() {
	function getGcd(a, b) {
		return b ? getGcd(b, a % b) : a;
	}
	function reduce(num, denom) {
		gcd = getGcd(num, denom);
		return [num / gcd, denom / gcd];
	}

	function calcAngleDegrees(y, x) {
		let result = 90 - (Math.atan2(y, x) * 180) / Math.PI;
		if (result < 0) {
			result = 360 + result;
		}
		return result;
	}

	function getVisibleAsteroidsFrom(map, fromPos) {
		const visibleCoords = [];
		for (let k = 0; k < map.length; ++k) {
			const checkRow = rows[k];

			for (let l = 0; l < checkRow.length; ++l) {
				if (k === fromPos[1] && l === fromPos[0]) {
					continue; // it's our own spot!
				}
				const checkSpot = checkRow[l];
				if (checkSpot !== "#") {
					continue;
				}

				const rise = k - fromPos[1];
				const run = l - fromPos[0];
				const slope = reduce(rise, run).map(Math.abs);
				if (rise < 0) {
					slope[0] *= -1;
				}
				if (run < 0) {
					slope[1] *= -1;
				}

				let factor = 1;
				let check_x = l - slope[1];
				let check_y = k - slope[0];
				let blocked = false;
				while (!(check_x === fromPos[0] && check_y === fromPos[1])) {
					if (map[check_y][check_x] === "#") {
						blocked = true;
						break;
					}
					factor++;
					check_x = l - factor * slope[1];
					check_y = k - factor * slope[0];
				}
				if (!blocked) {
					visibleCoords.push([l, k]);
				}
			}
		}
		return visibleCoords;
	}

	function print(map, marks) {
		let result = "";
		for (let i = 0; i < map.length; ++i) {
			for (let j = 0; j < map[i].length; ++j) {
				let nextInk = map[i][j];
				for (const mark of marks) {
					if (mark[0] === j && mark[1] === i) {
						nextInk = "X";
						break;
					}
				}
				result += nextInk;
			}
			result += "\n";
		}
		console.log(result);
	}

	const fs = require("fs");
	let data = fs.readFileSync("./p10_1.data", "utf-8");
	// data = `.#....#####...#..
	// ##...##.#####..##
	// ##...#...#.#####.
	// ..#.....#...###..
	// ..#.#.....#....##`;

	const rows = data
		.split("\n")
		.map(v => v.trim())
		.map(s => s.split(""));
	let mostVisible = 0;
	let mostVisiblePos;

	for (let i = 0; i < rows.length; ++i) {
		const row = rows[i];

		for (let j = 0; j < row.length; ++j) {
			const spot = row[j];

			if (spot !== "#") {
				continue;
			}

			let visible = getVisibleAsteroidsFrom(rows, [j, i]);

			if (visible.length > mostVisible) {
				mostVisible = visible.length;
				mostVisiblePos = [j, i];
			}
		}
	}

	let currentAngle = 359.999999999; // allows us to zap the one directly above us first
	let zapCount = 0;
	while (true) {
		let lowestAngleDifference = Number.MAX_SAFE_INTEGER;
		let zapCoords, zapAngle;

		let allVisible = getVisibleAsteroidsFrom(rows, mostVisiblePos);
		print(rows, allVisible);
		if (allVisible.length === 0) {
			break;
		}
		do {
			for (const visibleAsteroid of allVisible) {
				// Calculate the angle to this asteroid
				const run = visibleAsteroid[0] - mostVisiblePos[0];
				const rise = mostVisiblePos[1] - visibleAsteroid[1];
				const angle = calcAngleDegrees(rise, run);
				let angleDifference = angle - currentAngle;
				if (angleDifference < 0) {
					angleDifference = 360 - Math.abs(angleDifference);
				}

				if (angleDifference > 0 && angleDifference < lowestAngleDifference) {
					zapCoords = visibleAsteroid;
					zapAngle = angle;
					lowestAngleDifference = angleDifference;
				}
			}
		} while (((currentAngle -= 0.0000000001), zapAngle === undefined));

		rows[zapCoords[1]][zapCoords[0]] = "."; // zap!
		zapCount++;
		console.log(zapCount + " : Zapped " + zapCoords[0], zapCoords[1], "at angle " + zapAngle);
		currentAngle = zapAngle;

		if (zapCount === 200) {
			return zapCoords[0] * 100 + zapCoords[1];
		}
	}
}

function p11_1() {
	const fs = require("fs");
	let data = fs.readFileSync("./p11_1.data", "utf-8");

	let x = 0;
	let y = 0;
	let dir = 0; // 0 1 2 3 => up right down left
	let paintedSpots = {};

	let onColor = true;
	let paintedCount = 0;
	runProgram(
		data,
		() => {
			if (paintedSpots[x + "," + y] === 1n) {
				// console.log("Get input 1 (" + x + ", " + y + ")");
				return 1;
			} else {
				// console.log("Get input 0 (" + x + ", " + y + ")");
				return 0;
			}
		},
		v => {
			// console.log("Output: " + v);
			if (onColor) {
				const alreadyPainted = paintedSpots[x + "," + y];
				if (alreadyPainted === undefined) {
					paintedCount++;
				}
				// console.log("Painting " + x + ", " + y + " with " + v);
				paintedSpots[x + "," + y] = v;
			} else {
				if (v === 0n) {
					dir--;
					if (dir === -1) {
						dir = 3;
					}
				} else {
					dir = (dir + 1) % 4;
				}
				// console.log("New direction: " + dir);
				if (dir === 0) {
					y--;
				}
				if (dir === 1) {
					x++;
				}
				if (dir === 2) {
					y++;
				}
				if (dir === 3) {
					x--;
				}
			}
			onColor = !onColor;
		},
	);
	return paintedCount;
}

function p11_2() {
	const fs = require("fs");
	let data = fs.readFileSync("./p11_1.data", "utf-8");

	let x = 0;
	let y = 0;
	let dir = 0; // 0 1 2 3 => up right down left
	let paintedSpots = { "0,0": 1n };

	let onColor = true;
	let paintedCount = 0;
	runProgram(
		data,
		() => {
			if (paintedSpots[x + "," + y] === 1n) {
				// console.log("Get input 1 (" + x + ", " + y + ")");
				return 1;
			} else {
				// console.log("Get input 0 (" + x + ", " + y + ")");
				return 0;
			}
		},
		v => {
			// console.log("Output: " + v);
			if (onColor) {
				const alreadyPainted = paintedSpots[x + "," + y];
				if (alreadyPainted === undefined) {
					paintedCount++;
				}
				// console.log("Painting " + x + ", " + y + " with " + v);
				paintedSpots[x + "," + y] = v;
			} else {
				if (v === 0n) {
					dir--;
					if (dir === -1) {
						dir = 3;
					}
				} else {
					dir = (dir + 1) % 4;
				}
				// console.log("New direction: " + dir);
				if (dir === 0) {
					y--;
				}
				if (dir === 1) {
					x++;
				}
				if (dir === 2) {
					y++;
				}
				if (dir === 3) {
					x--;
				}
			}
			onColor = !onColor;
		},
	);

	const coordStrs = Object.keys(paintedSpots);
	const coords = coordStrs.map(s => s.split(",").map(v => parseInt(v, 10)));
	let minX = Number.MAX_SAFE_INTEGER;
	let minY = Number.MAX_SAFE_INTEGER;
	let maxX = Number.MIN_SAFE_INTEGER;
	let maxY = Number.MIN_SAFE_INTEGER;
	for (const coord of coords) {
		let [x, y] = coord;
		if (x < minX) {
			minX = x;
		}
		if (x > maxX) {
			maxX = x;
		}
		if (y < minY) {
			minY = y;
		}
		if (y > maxY) {
			maxY = y;
		}
	}
	let result = "";
	for (let i = minY; i <= maxY; ++i) {
		for (let j = minX; j <= maxX; ++j) {
			if (paintedSpots[j + "," + i] === 1n) {
				result += "#";
			} else {
				result += ".";
			}
		}
		result += "\n";
	}

	return result;
}

function p12_1() {
	const fs = require("fs");
	let data = fs.readFileSync("./p12_1.data", "utf-8");

	let pa = [-4, 3, 15];
	let pb = [-11, -10, 13];
	let pc = [2, 2, 18];
	let pd = [7, -1, 0];

	// pa = [-1, 0, 2];
	// pb = [2, -10, -7];
	// pc = [4, -8, 8];
	// pd = [3, 5, -1];

	const va = [0, 0, 0];
	const vb = [0, 0, 0];
	const vc = [0, 0, 0];
	const vd = [0, 0, 0];

	const posPairs = [
		[pa, pb],
		[pa, pc],
		[pa, pd],
		[pb, pc],
		[pb, pd],
		[pc, pd],
	];
	const velPairs = [
		[va, vb],
		[va, vc],
		[va, vd],
		[vb, vc],
		[vb, vd],
		[vc, vd],
	];

	let stepNum = 0;
	for (let n = 0; n < 1000; n++) {
		// Apply gravity
		for (const index of [0, 1, 2]) {
			for (let i = 0; i < posPairs.length; ++i) {
				const posPair = posPairs[i];
				if (posPair[0][index] > posPair[1][index]) {
					//pax > pbx
					velPairs[i][0][index]--;
					velPairs[i][1][index]++;
				} else if (posPair[0][index] < posPair[1][index]) {
					velPairs[i][0][index]++;
					velPairs[i][1][index]--;
				}
			}
		}

		// Apply velocity
		for (const index of [0, 1, 2]) {
			pa[index] += va[index];
			pb[index] += vb[index];
			pc[index] += vc[index];
			pd[index] += vd[index];
		}
	}
	const apot = Math.abs(pa[0]) + Math.abs(pa[1]) + Math.abs(pa[2]);
	const bpot = Math.abs(pb[0]) + Math.abs(pb[1]) + Math.abs(pb[2]);
	const cpot = Math.abs(pc[0]) + Math.abs(pc[1]) + Math.abs(pc[2]);
	const dpot = Math.abs(pd[0]) + Math.abs(pd[1]) + Math.abs(pd[2]);
	const akin = Math.abs(va[0]) + Math.abs(va[1]) + Math.abs(va[2]);
	const bkin = Math.abs(vb[0]) + Math.abs(vb[1]) + Math.abs(vb[2]);
	const ckin = Math.abs(vc[0]) + Math.abs(vc[1]) + Math.abs(vc[2]);
	const dkin = Math.abs(vd[0]) + Math.abs(vd[1]) + Math.abs(vd[2]);
	const atot = apot * akin;
	const btot = bpot * bkin;
	const ctot = cpot * ckin;
	const dtot = dpot * dkin;
	const total = atot + btot + ctot + dtot;
	return total;
}

function p12_2() {
	function lcm(...nums) {
		function lcm2(num1, num2) {
			const l = Math.max(num1, num2);
			const s = Math.min(num1, num2);
			let i = l;
			while (i % s !== 0) {
				i += l;
			}
			return i;
		}
		if (nums.length === 1) {
			return nums[0];
		}
		let result = lcm2(nums[0], nums[1]);
		for (let i = 2; i < nums.length; ++i) {
			result = lcm2(result, nums[i]);
		}
		return result;
	}

	let pa = [-4, 3, 15];
	let pb = [-11, -10, 13];
	let pc = [2, 2, 18];
	let pd = [7, -1, 0];

	// pa = [-1, 0, 2];
	// pb = [2, -10, -7];
	// pc = [4, -8, 8];
	// pd = [3, 5, -1];

	let ipa = [...pa];
	let ipb = [...pb];
	let ipc = [...pc];
	let ipd = [...pd];

	const va = [0, 0, 0];
	const vb = [0, 0, 0];
	const vc = [0, 0, 0];
	const vd = [0, 0, 0];

	const posPairs = [
		[pa, pb],
		[pa, pc],
		[pa, pd],
		[pb, pc],
		[pb, pd],
		[pc, pd],
	];
	const velPairs = [
		[va, vb],
		[va, vc],
		[va, vd],
		[vb, vc],
		[vb, vd],
		[vc, vd],
	];

	let stepNum = 0;
	const seen = {};
	let paxPattern = "";
	let poscounts = [0, 0, 0];
	let velcounts = [0, 0, 0];
	for (let n = 0; n < 10000000000; n++) {
		// Apply gravity
		for (const index of [0, 1, 2]) {
			for (let i = 0; i < posPairs.length; ++i) {
				const posPair = posPairs[i];
				if (posPair[0][index] > posPair[1][index]) {
					//pax > pbx
					velPairs[i][0][index]--;
					velPairs[i][1][index]++;
				} else if (posPair[0][index] < posPair[1][index]) {
					velPairs[i][0][index]++;
					velPairs[i][1][index]--;
				}
			}
		}

		// Apply velocity
		for (const index of [0, 1, 2]) {
			pa[index] += va[index];
			pb[index] += vb[index];
			pc[index] += vc[index];
			pd[index] += vd[index];
		}

		for (const x of [0, 1, 2]) {
			if (pa[x] === ipa[x] && pb[x] === ipb[x] && pc[x] === ipc[x] && pd[x] === ipd[x]) {
				if (!poscounts[x]) {
					poscounts[x] = n + 2;
				}
			}
		}
		for (const x of [0, 1, 2]) {
			if (va[x] === 0 && vb[x] === 0 && vc[x] === 0 && vd[x] === 0) {
				if (!velcounts[x]) {
					velcounts[x] = n + 1;
				}
			}
		}

		// once we have a repeating value for each, compute and return the lcm.
		if (!poscounts.some(v => v === 0) && !velcounts.some(v => v === 0)) {
			return lcm(poscounts[0], poscounts[1], poscounts[2], velcounts[0], velcounts[1], velcounts[2]);
		}
	}
}

function p13_1() {
	const fs = require("fs");
	let data = fs.readFileSync("./p13_1.data", "utf-8");

	const output = [];
	runProgram(data, [], output);

	let blockCount = 0;
	for (let i = 0; i < output.length; i += 3) {
		const x = output[i];
		const y = output[i + 1];
		const type = output[i + 2];

		if (type === 2n) {
			blockCount++;
		}
	}
	return blockCount;
}

function p13_2() {
	const fs = require("fs");
	let data = fs.readFileSync("./p13_1.data", "utf-8");

	const backspaces =
		"\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b";
	const output = [];
	const grid = [];
	let paddle = 20;
	let score = -1;
	const input = [];
	ballPos = [];
	let a = 0;
	function onOutput(val) {
		a++;
		output.push(Number(val));
		if (output.length % 3 !== 0) {
			return;
		}

		const x = output.shift();
		const y = output.shift();
		const type = output.shift();

		if (x === -1 && y === 0) {
			score = type;
		} else {
			if (!grid[y]) {
				grid[y] = [];
			}
			grid[y][x] = type;

			if (type === 3) {
				paddle = x;
			}

			if (type === 4) {
				ballPos.push([x, y]);
				if (ballPos.length > 10) {
					ballPos.shift();
				}
				printGrid(grid);

				if (ballPos.length > 1) {
					const current = ballPos[ballPos.length - 1];
					const last = ballPos[ballPos.length - 2];

					if (current[1] > last[1]) {
						// moving down
						const deltaY = current[1] - last[1];
						const deltaX = current[0] - last[0];
						const untilPaddleY = 18 - current[1];
						const timeTillPaddle = Number(untilPaddleY / deltaY);
						let xPosAtPaddle = deltaX * timeTillPaddle + x;
						console.log(
							`deltaY: ${deltaY}, deltaX: ${deltaX}, untilPaddleY: ${untilPaddleY}, timeTillPaddle: ${timeTillPaddle}, xPosAtPaddle: ${xPosAtPaddle}, x: ${x}, y: ${y}, paddle: ${paddle}, a: ${a}`,
						);
						if (xPosAtPaddle < 1) {
							xPosAtPaddle = Math.abs(xPosAtPaddle) + 1;
						} else if (xPosAtPaddle > 39) {
							xPosAtPaddle = 79 - xPosAtPaddle;
						}

						if (xPosAtPaddle > paddle) {
							input.push(1);
						}
						if (xPosAtPaddle < paddle) {
							input.push(-1);
						}
						if (xPosAtPaddle === paddle) {
							input.push(0);
						}
					} else {
						console.log(`Up. Paddle: ${paddle}, x: ${x}, y: ${y}`);
						input.splice(0, input.length);
						if (input.length === 0) {
							if (x < paddle) {
								input.push(-1);
							} else if (x > paddle) {
								input.push(1);
							}
						}
					}
				}
			}
		}
	}
	function onInput() {
		if (input.length > 0) {
			return input.shift();
		} else {
			return 0;
		}
	}
	let first = true;
	runProgram(data, onInput, onOutput);

	function printGrid(grid) {
		let text = "";
		if (!first) {
			//text = backspaces;
		}
		if (grid.length === 21 && grid[20].length === 40) {
			for (let i = 0; i < grid.length; ++i) {
				for (let j = 0; j < grid[i].length; ++j) {
					const val = grid[i][j];
					switch (val) {
						case 0:
							text += " ";
							break;
						case 1:
							text += "|";
							break;
						case 2:
							text += "#";
							break;
						case 3:
							text = text.substr(0, text.length - 1) + "---";
							++j;
							break;
						case 4:
							text += "o";
							break;
						default:
							text += " ";
					}
				}
				text += "\n";
			}
			console.log(text);
			first = false;
		}
	}

	return score;
}

function p14_1() {
	const fs = require("fs");
	let data = fs.readFileSync("./p14_1.data", "utf-8");
	//   data = `10 ORE => 10 A
	// 1 ORE => 1 B
	// 7 A, 1 B => 1 C
	// 7 A, 1 C => 1 D
	// 7 A, 1 D => 1 E
	// 7 A, 1 E => 1 FUEL`;

	// data = `9 ORE => 2 A
	// 8 ORE => 3 B
	// 7 ORE => 5 C
	// 3 A, 4 B => 1 AB
	// 5 B, 7 C => 1 BC
	// 4 C, 1 A => 1 CA
	// 2 AB, 3 BC, 4 CA => 1 FUEL`;

	const lines = data.split("\n").map(d => d.trim());
	const recipes = {};
	for (const line of lines) {
		const [input, output] = line.split("=>").map(v => v.trim());
		const inputSubstances = input.split(",").map(v => v.trim());
		let [outCount, outSubstance] = output.split(" ");
		if (!recipes[outSubstance]) {
			recipes[outSubstance] = { qty: parseInt(outCount, 10), ingredients: {} };
		}
		for (const inputSub of inputSubstances) {
			let [inCount, inSubstance] = inputSub.split(" ");
			inCount = parseInt(inCount, 10);
			if (!recipes[outSubstance].ingredients[inSubstance]) {
				recipes[outSubstance].ingredients[inSubstance] = 0;
			}
			recipes[outSubstance].ingredients[inSubstance] += inCount;
		}
	}

	function hasNonOreRequirements(requirements) {
		for (const req of Object.keys(requirements)) {
			if (req !== "ORE" && requirements[req] > 0) {
				return true;
			}
		}
		return false;
	}
	const requirements = { FUEL: 1 };
	while (hasNonOreRequirements(requirements)) {
		for (const req of Object.keys(requirements)) {
			if (req === "ORE") {
				continue;
			}
			const recipe = recipes[req];
			const batches = Math.ceil(requirements[req] / recipe.qty);
			const remaining = batches * recipe.qty - requirements[req];
			requirements[req] = -remaining;
			for (const ingredient of Object.keys(recipe.ingredients)) {
				if (!requirements[ingredient]) {
					requirements[ingredient] = 0;
				}
				requirements[ingredient] += batches * recipe.ingredients[ingredient];
			}
		}
	}
	return requirements["ORE"];
}

function p14_2() {
	const fs = require("fs");
	let data = fs.readFileSync("./p14_1.data", "utf-8");
	//   data = `10 ORE => 10 A
	// 1 ORE => 1 B
	// 7 A, 1 B => 1 C
	// 7 A, 1 C => 1 D
	// 7 A, 1 D => 1 E
	// 7 A, 1 E => 1 FUEL`;

	// data = `9 ORE => 2 A
	// 8 ORE => 3 B
	// 7 ORE => 5 C
	// 3 A, 4 B => 1 AB
	// 5 B, 7 C => 1 BC
	// 4 C, 1 A => 1 CA
	// 2 AB, 3 BC, 4 CA => 1 FUEL`;

	//   data = `157 ORE => 5 NZVS
	// 165 ORE => 6 DCFZ
	// 44 XJWVT, 5 KHKGT, 1 QDVJ, 29 NZVS, 9 GPVTF, 48 HKGWZ => 1 FUEL
	// 12 HKGWZ, 1 GPVTF, 8 PSHF => 9 QDVJ
	// 179 ORE => 7 PSHF
	// 177 ORE => 5 HKGWZ
	// 7 DCFZ, 7 PSHF => 2 XJWVT
	// 165 ORE => 2 GPVTF
	// 3 DCFZ, 7 NZVS, 5 HKGWZ, 10 PSHF => 8 KHKGT`;

	data = `171 ORE => 8 CNZTR
7 ZLQW, 3 BMBT, 9 XCVML, 26 XMNCP, 1 WPTQ, 2 MZWV, 1 RJRHP => 4 PLWSL
114 ORE => 4 BHXH
14 VRPVC => 6 BMBT
6 BHXH, 18 KTJDG, 12 WPTQ, 7 PLWSL, 31 FHTLT, 37 ZDVW => 1 FUEL
6 WPTQ, 2 BMBT, 8 ZLQW, 18 KTJDG, 1 XMNCP, 6 MZWV, 1 RJRHP => 6 FHTLT
15 XDBXC, 2 LTCX, 1 VRPVC => 6 ZLQW
13 WPTQ, 10 LTCX, 3 RJRHP, 14 XMNCP, 2 MZWV, 1 ZLQW => 1 ZDVW
5 BMBT => 4 WPTQ
189 ORE => 9 KTJDG
1 MZWV, 17 XDBXC, 3 XCVML => 2 XMNCP
12 VRPVC, 27 CNZTR => 2 XDBXC
15 KTJDG, 12 BHXH => 5 XCVML
3 BHXH, 2 VRPVC => 7 MZWV
121 ORE => 7 VRPVC
7 XCVML => 6 RJRHP
5 BHXH, 4 VRPVC => 5 LTCX`;

	const lines = data.split("\n").map(d => d.trim());
	const recipes = {};
	for (const line of lines) {
		const [input, output] = line.split("=>").map(v => v.trim());
		const inputSubstances = input.split(",").map(v => v.trim());
		let [outCount, outSubstance] = output.split(" ");
		if (!recipes[outSubstance]) {
			recipes[outSubstance] = { qty: parseInt(outCount, 10), ingredients: {} };
		}
		for (const inputSub of inputSubstances) {
			let [inCount, inSubstance] = inputSub.split(" ");
			inCount = parseInt(inCount, 10);
			if (!recipes[outSubstance].ingredients[inSubstance]) {
				recipes[outSubstance].ingredients[inSubstance] = 0;
			}
			recipes[outSubstance].ingredients[inSubstance] += inCount;
		}
	}

	function hasNonOreRequirements(requirements) {
		for (const req of Object.keys(requirements)) {
			if (req !== "ORE" && requirements[req] > 0) {
				return true;
			}
		}
		return false;
	}
	const requirements = { FUEL: 1 };
	let ore = 1000000000000;
	let fuelCount = 0;
	while (ore > 0) {
		for (const req of Object.keys(requirements)) {
			if (req === "ORE") {
				continue;
			}
			const recipe = recipes[req];
			const batches = Math.ceil(requirements[req] / recipe.qty);
			const remaining = batches * recipe.qty - requirements[req];
			requirements[req] = -remaining;
			for (const ingredient of Object.keys(recipe.ingredients)) {
				if (!requirements[ingredient]) {
					requirements[ingredient] = 0;
				}
				if (ingredient === "ORE") {
					ore -= batches * recipe.ingredients[ingredient];
					if (ore < 0) {
						break;
					}
				}
				requirements[ingredient] += batches * recipe.ingredients[ingredient];
			}
		}
		if (!hasNonOreRequirements(requirements)) {
			requirements["FUEL"] = 1;
			fuelCount++;
			if (fuelCount % 1000 === 0) {
				console.log("Fuel: " + fuelCount);
			}
		}
	}
	return fuelCount;
}

function p15_1() {
	const fs = require("fs");
	let data = fs.readFileSync("./p15_1.data", "utf-8");

	const N = 1;
	const S = 2;
	const W = 3;
	const E = 4;

	let x = 0;
	let y = 0;
	let o2x, o2y;
	const map = {};
	let lastMove;

	function move(x, y, dir) {
		switch (dir) {
			case N:
				return [x, y - 1];
			case S:
				return [x, y + 1];
			case W:
				return [x - 1, y];
			case E:
				return [x + 1, y];
		}
		throw new Error("Invalid move");
	}

	let moveNum = 0;
	let maxMoves = 1000000;
	let found = false;
	function getInput() {
		let randomMove = Math.floor(Math.random() * 4) + 1;
		lastMove = randomMove;
		moveNum++;
		if (moveNum % 10000 === 0) {
			console.log("Move num: " + moveNum);
		}
		if (moveNum < maxMoves) {
			// console.log("Getting input: " + randomMove);
			return BigInt(randomMove);
		} else {
			console.log("No moves left!");
			return undefined;
		}
	}

	function onOutput(val) {
		// console.log("Got output: " + val);
		const [newX, newY] = move(x, y, lastMove);
		const mapKey = `${newX},${newY}`;
		switch (Number(val)) {
			case 0: // wall
				map[mapKey] = "#";
				break;
			case 1: // good, new pos
				map[mapKey] = ".";
				x = newX;
				y = newY;
				break;
			case 2: // found o2, new pos
				map[mapKey] = "$";
				found = true;
				//moveNum = maxMoves - 1000;
				x = newX;
				y = newY;
				o2x = x;
				o2y = y;
				break;
			default:
				throw new Error("Unexpected output");
		}
	}

	runProgram(data, getInput, onOutput);
	// console.dir(map);
	map["0,0"] = "S";
	map[`${x},${y}`] = "X";
	const [grid, offsetX, offsetY] = getGrid(map);
	printGrid(grid);
	solveBFS(grid, x, y, o2x, o2y);

	function getGrid(map) {
		let minX, maxX, minY, maxY;
		minX = minY = Number.MAX_SAFE_INTEGER;
		maxX = maxY = Number.MIN_SAFE_INTEGER;

		for (const key of Object.keys(map)) {
			const [x, y] = key.split(",").map(v => Number(v));
			if (x < minX) {
				minX = x;
			}
			if (x > maxX) {
				maxX = x;
			}
			if (y < minY) {
				minY = y;
			}
			if (y > maxY) {
				maxY = y;
			}
		}
		const offsetX = -minX;
		const offsetY = -minY;
		const grid = [];
		const blankRow = [];
		for (let i = 0; i < maxX + offsetX + 1; ++i) {
			blankRow.push(" ");
		}
		for (let i = 0; i < maxY + offsetY + 1; ++i) {
			grid.push([...blankRow]);
		}

		for (const key of Object.keys(map)) {
			const [x, y] = key.split(",").map(v => Number(v));
			const [gridX, gridY] = [x + offsetX, y + offsetY];
			grid[gridY][gridX] = map[key];
		}
		return [grid, offsetX, offsetY];
	}

	function printGrid(grid) {
		let toPrint = "";
		for (const row of grid) {
			for (const cell of row) {
				toPrint += cell;
			}
			toPrint += "\n";
		}
		console.log(toPrint);
	}

	function solveBFS(grid, startX, startY, endX, endY) {
		/*1  procedure BFS(G,start_v):
2      let Q be a queue
3      label start_v as discovered
4      Q.enqueue(start_v)
5      while Q is not empty
6          v = Q.dequeue()
7          if v is the goal:
8              return v
9          for all edges from v to w in G.adjacentEdges(v) do
10             if w is not labeled as discovered:
11                 label w as discovered
12                 w.parent = v
13                 Q.enqueue(w) */
		const Q = [];
		const startKey = `${startX},${startY}`;
		const discovered = {};
		const path = {};
		discovered[startKey] = true;
		Q.push([startX, startY]);
		while (Q.length > 0) {
			const v = Q.shift();
			if (v[0] === endX && v[1] === endY) {
				return v;
			}
			const adjacentSpaces = [];
			const n = move(v[0], v[1], N);
			const s = move(v[0], v[1], S);
			const e = move(v[0], v[1], E);
			const w = move(v[0], v[1], W);
			const nVal = grid[n[1]] && grid[n[1]][n[0]];
			const sVal = grid[s[1]] && grid[s[1]][s[0]];
			const eVal = grid[e[1]] && grid[e[1]][e[0]];
			const wVal = grid[w[1]] && grid[w[1]][w[0]];
			if (nVal === "." || nVal === "S" || nVal === "$") {
				adjacentSpaces.push(n);
			}
			if (sVal === "." || sVal === "S" || sVal === "$") {
				adjacentSpaces.push(s);
			}
			if (eVal === "." || eVal === "S" || eVal === "$") {
				adjacentSpaces.push(e);
			}
			if (wVal === "." || wVal === "S" || wVal === "$") {
				adjacentSpaces.push(w);
			}
			for (const adj of adjacentSpaces) {
				const adjKey = `${adj[0]},${adj[1]}`;
				if (!discovered[adjKey]) {
					discovered[adjKey] = true;
					path[adjKey] = `${v[0]},${v[1]}`;
					Q.push(adj);
				}
			}
		}
		let len = 0;
		const endKey = `${endX},${endY}`;
		let current = endKey;
		while (path[current]) {
			current = path[current];
			len++;
		}
		return len;
	}
}

function p15_2() {
	const fs = require("fs");
	let data = fs.readFileSync("./p15_2.data", "utf-8");

	const N = 1;
	const S = 2;
	const W = 3;
	const E = 4;

	function parseGrid(data) {
		const grid = [];
		const dataRows = data.split("\n").map(d => d.trim());
		let start;
		for (let i = 0; i < dataRows.length; ++i) {
			grid.push([]);
			for (let j = 0; j < dataRows[i].length; ++j) {
				const char = dataRows[i][j];
				if (char === "$") {
					start = [j, i];
				}
				if (char === "#") {
					grid[i].push(false);
				} else {
					grid[i].push(true);
				}
			}
		}
		return [grid, start];
	}
	const [grid, start] = parseGrid(data);

	function move(x, y, dir) {
		switch (dir) {
			case N:
				return [x, y - 1];
			case S:
				return [x, y + 1];
			case W:
				return [x - 1, y];
			case E:
				return [x + 1, y];
		}
		throw new Error("Invalid move");
	}

	const o2Locs = {};
	o2Locs[`${start[0]},${start[1]}`] = true;
	spread(grid, o2Locs, 322);
	printGrid(grid, start, o2Locs);

	function spread(grid, o2Locs, count = 1) {
		for (let i = 0; i < count; ++i) {
			for (const locStr of Object.keys(o2Locs)) {
				const loc = locStr.split(",").map(l => Number(l));
				const n = move(loc[0], loc[1], N);
				const s = move(loc[0], loc[1], S);
				const e = move(loc[0], loc[1], E);
				const w = move(loc[0], loc[1], W);
				if (grid[n[1]] && grid[n[1]][n[0]]) {
					o2Locs[`${n[0]},${n[1]}`] = true;
				}
				if (grid[s[1]] && grid[s[1]][s[0]]) {
					o2Locs[`${s[0]},${s[1]}`] = true;
				}
				if (grid[e[1]] && grid[e[1]][e[0]]) {
					o2Locs[`${e[0]},${e[1]}`] = true;
				}
				if (grid[w[1]] && grid[w[1]][w[0]]) {
					o2Locs[`${w[0]},${w[1]}`] = true;
				}
			}
		}
	}
	//solveBFS(grid, x, y, o2x, o2y);

	function printGrid(grid, start, o2Locs) {
		let toPrint = "";
		for (let i = 0; i < grid.length; ++i) {
			for (let j = 0; j < grid[i].length; ++j) {
				let cell = grid[i][j] ? " " : "#";
				if (o2Locs[`${j},${i}`]) {
					cell = "O";
				}
				if (start[1] === i && start[0] === j) {
					cell = "$";
				}
				toPrint += cell;
			}
			toPrint += "\n";
		}
		console.log(toPrint);
	}

	function solveBFS(grid, startX, startY, endX, endY) {
		const Q = [];
		const startKey = `${startX},${startY}`;
		const discovered = {};
		const path = {};
		discovered[startKey] = true;
		Q.push([startX, startY]);
		while (Q.length > 0) {
			const v = Q.shift();
			if (v[0] === endX && v[1] === endY) {
				return v;
			}
			const adjacentSpaces = [];
			const n = move(v[0], v[1], N);
			const s = move(v[0], v[1], S);
			const e = move(v[0], v[1], E);
			const w = move(v[0], v[1], W);
			const nVal = grid[n[1]] && grid[n[1]][n[0]];
			const sVal = grid[s[1]] && grid[s[1]][s[0]];
			const eVal = grid[e[1]] && grid[e[1]][e[0]];
			const wVal = grid[w[1]] && grid[w[1]][w[0]];
			if (nVal === "." || nVal === "S" || nVal === "$") {
				adjacentSpaces.push(n);
			}
			if (sVal === "." || sVal === "S" || sVal === "$") {
				adjacentSpaces.push(s);
			}
			if (eVal === "." || eVal === "S" || eVal === "$") {
				adjacentSpaces.push(e);
			}
			if (wVal === "." || wVal === "S" || wVal === "$") {
				adjacentSpaces.push(w);
			}
			for (const adj of adjacentSpaces) {
				const adjKey = `${adj[0]},${adj[1]}`;
				if (!discovered[adjKey]) {
					discovered[adjKey] = true;
					path[adjKey] = `${v[0]},${v[1]}`;
					Q.push(adj);
				}
			}
		}
		let len = 0;
		const endKey = `${endX},${endY}`;
		let current = endKey;
		while (path[current]) {
			current = path[current];
			len++;
		}
		return len;
	}
}

function p16_1() {
	const fs = require("fs");
	let data = fs.readFileSync("./p16_1.data", "utf-8");
	//data = `80871224585914546619083218645595`;
	//data = `12345678`;

	const input = data.split("").map(d => Number(d));
	const len = input.length;
	const pattern = [0, 1, 0, -1];

	function getPattern(len, n, pattern) {
		const expandedPattern = [];
		let mod = 0;
		let index = pattern.length - 1;
		for (let i = 0; i <= len; ++i) {
			if (i % n === 0) {
				index++;
				index %= pattern.length;
			}
			expandedPattern.push(pattern[index]);
		}
		expandedPattern.shift();
		return expandedPattern;
	}
	let phaseData = [...input];
	let nextPhase = [];
	for (let n = 0; n < 100; ++n) {
		// n: phase number, i: row (0 to len), j: term
		// nextPhase: digit input to next phase, phaseData: current digit input
		console.log("Phase " + n);
		for (let i = 0; i < phaseData.length; ++i) {
			const expandedPattern = getPattern(len, i + 1, pattern);
			const addens = [];
			let sum;

			if (i > phaseData.length / 2) {
				sum = nextPhase[i - 1] - phaseData[i - 1];
				if (sum < 0) {
					sum += 10;
				}
			} else {
				for (let j = i; j < phaseData.length; ++j) {
					if (expandedPattern[j] === 1) {
						addens.push(phaseData[j]);
					} else if (expandedPattern[j] === -1) {
						addens.push(-phaseData[j]);
					}
				}
				sum = addens.reduce((a, b) => a + b);
			}
			const result = Math.abs(sum) % 10;
			nextPhase[i] = result;
		}
		[phaseData, nextPhase] = [nextPhase, phaseData];
	}
	return phaseData.join("").substr(0, 8);

	console.log(getPattern(20, 1, pattern));
}

function p16_2() {
	const fs = require("fs");
	let data = fs.readFileSync("./p16_1.data", "utf-8");
	let repeatedData = "";
	for (let i = 0; i < 10000; ++i) {
		repeatedData += data;
	}
	let offset = Number(data.substr(0, 7));
	repeatedData = repeatedData.slice(offset);
	// repeatedData = `80871224585914546619083218645595`;
	// offset = 10;
	// repeatedData = `12345678`;
	// repeatedData = `1111111111111111111111`;

	const input = repeatedData.split("").map(d => Number(d));

	let phaseData = [...input];
	let nextPhase = [];

	for (let n = 0; n < 100; ++n) {
		let c = 0;
		for (let i = phaseData.length - 1; i >= 0; --i) {
			c = (c + phaseData[i]) % 10;
			nextPhase[i] = c;
		}
		for (let i = 0; i < phaseData.length; ++i) {
			phaseData[i] = nextPhase[i];
		}
	}
	return phaseData.slice(0, 8).join("");
}

function p17_1() {
	const fs = require("fs");
	let data = fs.readFileSync("./p17_1.data", "utf-8");

	const output = [];
	runProgram(data, [], output);

	const map = output.map(a => String.fromCharCode(Number(a))).join("");

	const grid = map.split("\n").map(a => a.trim());
	let sum = 0;
	for (let i = 0; i < grid.length; ++i) {
		for (let j = 0; j < grid[i].length; ++j) {
			if (i !== 0 && j !== 0 && i !== grid.length - 1 && j !== grid[i].length - 1) {
				if (
					grid[i][j] === "#" &&
					grid[i + 1][j] === "#" &&
					grid[i - 1][j] === "#" &&
					grid[i][j + 1] === "#" &&
					grid[i][j - 1] === "#"
				) {
					console.log("cross at " + j + "," + i);
					sum += j * i;
				}
			}
		}
	}
	return sum;
}

function p17_2() {
	const fs = require("fs");
	let data = fs.readFileSync("./p17_1.data", "utf-8");
	data = "2" + data.substr(1);

	function toAsciiList(str) {
		const list = [];
		for (let i = 0; i < str.length; ++i) {
			list.push(str.charCodeAt(i));
		}
		return list;
	}

	const output = [];
	/*

  +———————————————————————————————————————————————————+
  |                            #                      |
  |             R6             #                      |
  |          #######           #6                     |
  |          #     #           #R           R10       |
  |          #     #R          #       ###########    |
  |          #     #1          #   L12 #         #    |
  |          #     #0          #############     #R   |
  |         2#     #       R12         #6  #     #1   |
  |         1#     #     ############# #R  #     #2   |
  |         L#     #     #           # #   # L12 #    |
  |          #     #     #          R# #############  |
  |          #     #     #          6#     #     # #  |
  |          #     #############     #     #0    # #  |
  |          #       L12 #     # R10 #     #1    # #  |
  |^##########           # ###########     #R    # #0 |
  |    R10              0# #   #           #  R6 # #1 |
  |                     1# #   #R          ####### #L |
  |                     R# #   #6                  #  |
  |                      ####### <=R6      R6=>#######|
  |                        #                   #   # #|
  |                        # #######           #   # #|
  |                       L# # R6  #      R10  #   # #|
  |                       1# #     #R    ########### #|
  |                       2# #     #1    #     #     #|
  |                        # #     #0    #     #2   R#|
  |                        # # L12 #     #6    #1   1#|
  |                        ############# #R    #L   0#|
  |                          #     #   # #     #     #|
  |                         2#     #  R# #############|
  |                         1#     #  6#       #  R12 |
  |                         R#     #############      |
  |                          #    R10  #   L12        |
  |                          ###########              |
  +———————————————————————————————————————————————————+
  
  */
	// sequence: R, 10, L, 12, R, 6, R, 10, L, 12, R, 6, R, 6, R, 10, R, 12, R, 6, R, 10, L, 12, L, 12, R, 6, R, 10, R, 12, R, 6, R, 10, L, 12, L, 12, R, 6, R, 10, R, 12, R, 6, R, 10, L, 12, L, 12, R, 6, R, 10, R, 12, R, 6, R, 10, L, 12, R, 6
	// main => A,A,B,C,B,C,B,C,B,A
	// A => R,10,L,12,R,6
	// B => R,6,R,10,R,12,R,6
	// C => R,10,L,12,L,12

	const input = [
		...toAsciiList("A,A,B,C,B,C,B,C,B,A\n"),
		...toAsciiList("R,10,L,12,R,6\n"),
		...toAsciiList("R,6,R,10,R,12,R,6\n"),
		...toAsciiList("R,10,L,12,L,12\n"),
		...toAsciiList("n\n"),
	];
	function getInput() {
		return input.shift();
	}
	function handleOutput(o) {
		output.push(o);
	}
	console.log(input);
	runProgram(data, getInput, handleOutput);

	return output[output.length - 1];

	////////////// Code below was used to determine the sequence //////////////
	// const map = output.map(a => String.fromCharCode(Number(a))).join("");

	// const grid = map.split("\n").map(a => a.trim());

	// const N = 0;
	// const E = 1;
	// const S = 2;
	// const W = 3;
	// const L = -1;
	// const R = -2;

	// function move(pos, dir) {
	//   const rows = grid.length;
	//   const cols = grid[0].length;
	//   let newPos;
	//   switch (dir) {
	//     case N:
	//       newPos = [pos[0], pos[1] - 1];
	//       break;
	//     case E:
	//       newPos = [pos[0] + 1, pos[1]];
	//       break;
	//     case S:
	//       newPos = [pos[0], pos[1] + 1];
	//       break;
	//     case W:
	//       newPos = [pos[0] - 1, pos[1]];
	//       break;
	//   }
	//   if (
	//     newPos[0] < cols &&
	//     newPos[1] < rows &&
	//     newPos[0] >= 0 &&
	//     newPos[1] >= 0
	//   ) {
	//     return newPos;
	//   } else {
	//     return false;
	//   }
	// }
	// function turn(currentDirection, leftOrRight) {
	//   if (leftOrRight === R) {
	//     return (currentDirection + 1) % 4;
	//   } else {
	//     const temp = currentDirection - 1;
	//     return temp < 0 ? 4 + temp : temp;
	//   }
	// }

	// let pos, dir;
	// for (let i = 0; i < grid.length; ++i) {
	//   let br = false;
	//   for (let j = 0; j < grid[i].length; ++j) {
	//     const char = grid[i][j];
	//     pos = [j, i];
	//     if (char === "^") {
	//       dir = 0;
	//     } else if (char === ">") {
	//       dir = 1;
	//     } else if (char === "v") {
	//       dir = 2;
	//     } else if (char === "<") {
	//       dir = 3;
	//     }
	//     if (typeof dir !== "undefined") {
	//       br = true;
	//       break;
	//     }
	//   }
	//   if (br) {
	//     break;
	//   }
	// }

	// let straightMoves = 0;
	// const moveList = [];
	// while (true) {
	//   const forward = move(pos, dir);
	//   if (forward && grid[forward[1]][forward[0]] === "#") {
	//     straightMoves++;
	//     pos = forward;
	//     continue;
	//   } else {
	//     moveList.push(String(straightMoves));
	//     straightMoves = 0;
	//     const leftDir = turn(dir, L);
	//     const leftMove = move(pos, leftDir);
	//     const rightDir = turn(dir, R);
	//     const rightMove = move(pos, rightDir);

	//     if (leftMove && grid[leftMove[1]][leftMove[0]] === "#") {
	//       dir = leftDir;
	//       moveList.push("L");
	//     } else if (rightMove && grid[rightMove[1]][rightMove[0]] === "#") {
	//       dir = rightDir;
	//       moveList.push("R");
	//     } else {
	//       // end of the line, break;
	//       break;
	//     }
	//   }
	// }
}

function p18_1() {
	const fs = require("fs");
	let data = fs.readFileSync("./p18_1.data", "utf-8");

	function parse(input) {
		const grid = [];
		const lines = input.split("\n").map(l => l.trim());
		for (let i = 0; i < lines.length; ++i) {
			grid.push([]);
			for (let j = 0; j < lines[i].length; ++j) {
				grid[i][j] = lines[i][j];
			}
		}
		return grid;
	}

	function findKeys(grid) {
		let startPos;
		let keys = {};

		for (let i = 0; i < grid.length; ++i) {
			for (let j = 0; j < grid[i].length; ++j) {
				const char = grid[i][j];
				if (char === "@") {
					startPos = [j, i];
				} else if (/^[a-z]$/.test(char)) {
					keys[char] = [j, i];
				}
			}
		}
		return { start: startPos, keys: keys };
	}

	function posToKey(pos) {
		return `${pos[0]},${pos[1]}`;
	}

	function calcKeyDist(keys, grid) {
		const result = {};
		for (const [key, pos] of Object.entries(keys)) {
			const queue = [[pos, []]];
			const distances = {};
			distances[posToKey(pos)] = 0;

			const keysForKey = [];

			while (queue.length > 0) {
				const [pos, requiredKeys] = queue.shift();
				for (const [dx, dy] of [
					[0, -1],
					[0, 1],
					[-1, 0],
					[1, 0],
				]) {
					const x = pos[0] + dx;
					const y = pos[1] + dy;
					const current = [x, y];
					const char = grid[y][x];
					if (char === "#") {
						continue;
					}
					const currentAsKey = posToKey(current);
					const posAsKey = posToKey(pos);
					if (currentAsKey in distances) {
						continue;
					}
					distances[currentAsKey] = distances[posAsKey] + 1;

					if (/^[a-z]$/.test(char)) {
						keysForKey.push([char, requiredKeys, distances[currentAsKey]]);
					}
					if (/^[A-Za-z]$/.test(char)) {
						queue.push([current, requiredKeys.concat([char.toLowerCase()])]);
					} else {
						queue.push([current, requiredKeys]);
					}
				}
			}
			result[key] = keysForKey;
		}
		return result;
	}

	function setDifference(setA, setB) {
		const diff = new Set(setA);
		for (const elem of setB) {
			diff.delete(elem);
		}
		return diff;
	}

	function visibleKeys(fromKey, unlocked, keyDistances) {
		const visible = [];
		for (const [key, requiredKeys, distance] of keyDistances[fromKey]) {
			// key already collected.
			if (unlocked.has(key)) {
				continue;
			}
			// required doors aren't unlocked.
			if (setDifference(new Set(requiredKeys), unlocked).size > 0) {
				continue;
			}
			visible.push([key, distance]);
		}
		return visible;
	}

	function getCacheKey(fromKey, unlocked) {
		const sortedUnlocked = [...unlocked];
		sortedUnlocked.sort();
		return `${fromKey},${sortedUnlocked.join("")}`;
	}

	function numSteps(fromKey, keyDistances, unlocked = new Set(), cache = {}) {
		const cacheKey = getCacheKey(fromKey, unlocked);
		if (!(cacheKey in cache)) {
			let result;
			const visible = visibleKeys(fromKey, unlocked, keyDistances);
			if (visible.length === 0) {
				result = 0;
			} else {
				const steps = [];
				for (const [key, distance] of visible) {
					const originalPos = fromKey;
					fromKey = key;
					const newlyUnlocked = new Set(unlocked);
					newlyUnlocked.add(key);
					steps.push(distance + numSteps(fromKey, keyDistances, newlyUnlocked, cache));
					pos = originalPos;
				}
				result = Math.min(...steps);
			}
			cache[cacheKey] = result;
		}
		return cache[cacheKey];
	}

	const grid = parse(data);
	const { start, keys } = findKeys(grid);
	keys["@"] = start;
	const keyDistances = calcKeyDist(keys, grid);
	const unlocked = new Set();
	const cache = {};
	const steps = numSteps("@", keyDistances, unlocked, cache);
	const cacheLen = Object.keys(cache).length;
	return steps;

	// Below here is a stone tablet containing an impression of old shitty forgotton code

	// const N = 0;
	// const E = 1;
	// const S = 2;
	// const W = 3;

	// function move(pos, dir) {
	//   let newPos;
	//   switch (dir) {
	//     case N:
	//       newPos = [pos[0], pos[1] - 1];
	//       break;
	//     case E:
	//       newPos = [pos[0] + 1, pos[1]];
	//       break;
	//     case S:
	//       newPos = [pos[0], pos[1] + 1];
	//       break;
	//     case W:
	//       newPos = [pos[0] - 1, pos[1]];
	//       break;
	//   }
	//   return newPos;
	// }
	// function isPassable(char, throughDoors) {
	//   if (typeof char === "string") {
	//     const code = char.charCodeAt(0);
	//     return char !== "#" && (throughDoors || code < 65 || charCode > 90);
	//   } else {
	//     return char.unlocked || isPassable(char.char, throughDoors);
	//   }
	// }
	// function gridToGraph(grid) {
	//   const vertices = {};
	//   for (let i = 0; i < grid.length; ++i) {
	//     for (let j = 0; j < grid[i].length; ++j) {
	//       const char = grid[i][j];
	//       if (isPassable(char, true)) {
	//         const key = `${j},${i}`;
	//         vertices[key] = {
	//           name: key,
	//           pos: [j, i],
	//           neighbors: new Set(),
	//           char: char,
	//           distance: NaN,
	//           prev: undefined,
	//           doors: [],
	//           keys: [],
	//           collected: false, // keys only
	//           unlocked: false // doors only
	//         };
	//       }
	//     }
	//   }
	//   for (const k of Object.keys(vertices)) {
	//     const vertex = vertices[k];
	//     const neighbors = [N, S, W, E].map(dir => move(vertex.pos, dir));
	//     for (const neighbor of neighbors) {
	//       const neighborNode = vertices[`${neighbor[0]},${neighbor[1]}`];
	//       if (neighborNode) {
	//         vertex.neighbors.add(neighborNode);
	//       }
	//     }
	//   }
	//   return vertices;
	// }
	// function isDoor(node, ignoreUnlocked) {
	//   const charCode = node.char.charCodeAt(0);
	//   if (ignoreUnlocked) {
	//     return charCode >= 65 && charCode <= 90;
	//   }
	//   return node.unlocked || (charCode >= 65 && charCode <= 90);
	// }
	// function isKey(node) {
	//   if (!node) {
	//     return false;
	//   }
	//   const charCode = node.char.charCodeAt(0);
	//   return charCode >= 97 && charCode <= 122;
	// }

	// function graphToNDijkstra(graph) {
	//   const ndijkstra = new NDijkstra();
	//   for (const vertexKey of Object.keys(graph)) {
	//     const vertex = graph[vertexKey];
	//     const neighbors = Array.from(vertex.neighbors);
	//     const adjObj = {};
	//     for (const neighbor of neighbors) {
	//       if (!isDoor(neighbor, true)) {
	//         adjObj[neighbor.name] = 1;
	//       }
	//     }
	//     ndijkstra.addNode(vertex.name, adjObj);
	//   }
	//   return ndijkstra;
	// }

	// function getPath(ndijkstra, a, b, cache) {
	//   const cacheKey = a + "TO" + b;
	//   if (cache && cache[cacheKey]) {
	//     return cache[cacheKey];
	//   }
	//   const route = ndijkstra.path(a, b);
	//   if (cache) {
	//     cache[cacheKey] = route;
	//   }
	//   return route.slice(1);
	// }

	// function unlock(ndijkstra, door) {
	//   if (!door.unlocked) {
	//     const doorNeighbors = ndijkstra.graph.get(door.name);
	//     for (const neighbor of doorNeighbors.entries()) {
	//       ndijkstra.graph.get(neighbor[0]).set(door.name, 1);
	//     }
	//     door.unlocked = true;
	//     //console.log(`Unlock ${door.char}`);
	//     return true;
	//   }
	//   return false;
	// }

	// function lock(ndijkstra, door) {
	//   if (door.unlocked) {
	//     const doorNeighbors = ndijkstra.graph.get(door.name);
	//     for (const neighbor of doorNeighbors.entries()) {
	//       ndijkstra.graph.get(neighbor[0]).delete(door.name);
	//     }
	//     door.unlocked = false;
	//     //console.log(`Lock ${door.char}`);
	//     return true;
	//   }
	//   return false;
	// }

	// function unlockPath(ndijkstra, path, graph) {
	//   const unlockedDoors = [];
	//   for (const step of path) {
	//     const node = graph[step];
	//     if (isKey(node)) {
	//       const correspondingDoor = getCorrespondingDoor(graph, node);
	//       if (correspondingDoor) {
	//         if (unlock(ndijkstra, correspondingDoor)) {
	//           unlockedDoors.push(correspondingDoor);
	//         }
	//       }
	//     }
	//   }
	//   return unlockedDoors;
	// }

	// function lockDoors(ndijkstra, doors) {
	//   for (const door of doors) {
	//     lock(ndijkstra, door);
	//   }
	// }

	// function lockPath(ndijkstra, path, graph) {
	//   for (const step of path) {
	//     const node = graph[step];
	//     if (isKey(node)) {
	//       const correspondingDoor = getCorrespondingDoor(graph, node);
	//       if (correspondingDoor) {
	//         lock(ndijkstra, correspondingDoor);
	//       }
	//     }
	//   }
	// }

	// function keysRequiredForPath(path, graph) {
	//   const requiredKeys = [];
	//   for (const node of path) {
	//     if (isDoor(graph[node], true)) {
	//       requiredKeys.push(graph[node]);
	//     }
	//   }
	//   return requiredKeys;
	// }

	// function getVisibleKeys(ndijkstra, from, keys) {
	//   const visibleKeys = [];
	//   for (const key of keys) {
	//     const path = ndijkstra.path(from.name, key.name);
	//     if (path) {
	//       visibleKeys.push(key);
	//     }
	//   }
	//   return visibleKeys;
	// }

	// function getCorrespondingDoor(graph, key) {
	//   if (!isKey(key)) {
	//     return null;
	//   }
	//   for (const k of Object.keys(graph)) {
	//     const node = graph[k];
	//     if (node.char === key.char.toUpperCase()) {
	//       return node;
	//     }
	//   }
	// }

	// //   data = `#########
	// // #b.A.@.a#
	// // #########`;

	// function getCacheKey(currentPos, keys) {
	//   const keysSorted = [...keys];
	//   keysSorted.sort((a, b) => a.char.localeCompare(b.char));
	//   return currentPos.char + "@@" + keysSorted.map(k => k.char).join("");
	// }

	// let i = 0;
	// let hits = 0;
	// let misses = 0;
	// function distanceToKeys(
	//   currentPos,
	//   keys,
	//   cache,
	//   ndijkstra,
	//   graph,
	//   currentRoute
	// ) {
	//   if (keys.length === 0) {
	//     return 0;
	//   }
	//   let correspondingDoor = getCorrespondingDoor(graph, currentPos);

	//   const cacheKey = getCacheKey(currentPos, keys);
	//   const cacheResult = cache[cacheKey];
	//   if (cacheResult) {
	//     //console.log(`Cache hit: ${cacheKey} => ${cacheResult}`);
	//     hits++;
	//     return cacheResult;
	//   }
	//   misses++;
	//   const visibleKeys = getVisibleKeys(ndijkstra, currentPos, keys);
	//   //console.log(`Cache miss: ${cacheKey}`);

	//   let length = Number.MAX_SAFE_INTEGER;
	//   for (const key of visibleKeys) {
	//     const keyPath = getPath(ndijkstra, currentPos.name, key.name);
	//     const newKeyList = [...keys];
	//     newKeyList.splice(newKeyList.indexOf(key), 1);
	//     const unlockedDoors = unlockPath(ndijkstra, keyPath, graph);
	//     currentRoute.push(...keyPath);
	//     const distance =
	//       keyPath.length +
	//       distanceToKeys(key, newKeyList, cache, ndijkstra, graph, currentRoute);
	//     for (const x of keyPath) {
	//       currentRoute.pop();
	//     }
	//     lockDoors(ndijkstra, unlockedDoors);
	//     length = Math.min(distance, length);
	//   }
	//   cache[cacheKey] = length;

	//   if (i++ % 10 === 0) {
	//     console.log(`Added ${cacheKey} = ${length}`);
	//     console.log(`Cache length: ${Object.keys(cache).length}`);
	//     console.log(
	//       `Hits: ${hits}, misses: ${misses}, percentage: ${hits /
	//         (misses + hits)}\n`
	//     );
	//   }

	//   return length;
	// }

	//    data =
	// `########################
	// #f.D.E.e.C.b.A.@.a.B.c.#
	// ######################.#
	// #d.....................#
	// ########################`;

	//   data = `#################
	// #i.G..c...e..H.p#
	// ########.########
	// #j.A..b...f..D.o#
	// ########@########
	// #k.E..a...g..B.n#
	// ########.########
	// #l.F..d...h..C.m#
	// #################`;

	//   data = `########################
	// #...............b.C.D.f#
	// #.######################
	// #.....@.a.B.c.d.A.e.F.g#
	// ########################`;

	// data = `############
	// #.......D.f#
	// #.##########
	// #.@.d.e.F.g#
	// ############`;

	//   data =
	// `#######
	//  #a..Cb#
	//  #.cd.D#
	//  #....@#
	//  #######`;

	//   data = `########################
	// #@.............ac.G.I.b#
	// ###d#e#f################
	// ###A#B#C################
	// ###g#h#i################
	// ########################`;

	// const grid = data.split("\n").map(s => s.trim());
	// const graph = gridToGraph(grid);
	// const ndijkstra = graphToNDijkstra(graph);
	// const letterMap = {};
	// const keys = [];
	// for (let i = 0; i < grid.length; ++i) {
	//   for (let j = 0; j < grid[i].length; ++j) {
	//     const key = `${j},${i}`;
	//     const char = grid[i][j];
	//     if (char !== "." && char !== "#") {
	//       letterMap[char] = graph[key];
	//     }
	//     if (isKey(graph[key])) {
	//       keys.push(graph[key]);
	//     }
	//   }
	// }

	// let current = letterMap["@"];
	// const cache = {};
	// const rte = [];
	// const dist = distanceToKeys(current, keys, cache, ndijkstra, graph, rte);
	// console.dir(cache);

	// return dist;
}

function p18_2() {
	const fs = require("fs");
	let data = fs.readFileSync("./p18_2.data", "utf-8");

	function parse(input) {
		const grid = [];
		const lines = input.split("\n").map(l => l.trim());
		for (let i = 0; i < lines.length; ++i) {
			grid.push([]);
			for (let j = 0; j < lines[i].length; ++j) {
				grid[i][j] = lines[i][j];
			}
		}
		return grid;
	}

	function findKeys(grid) {
		let startPos = [];
		let keys = {};

		for (let i = 0; i < grid.length; ++i) {
			for (let j = 0; j < grid[i].length; ++j) {
				const char = grid[i][j];
				if (char === "@") {
					startPos.push([j, i]);
				} else if (/^[a-z]$/.test(char)) {
					keys[char] = [j, i];
				}
			}
		}
		return { starts: startPos, keys: keys };
	}

	function posToKey(pos) {
		return `${pos[0]},${pos[1]}`;
	}

	function calcKeyDist(keys, grid) {
		const result = {};
		for (const [key, pos] of Object.entries(keys)) {
			const queue = [[pos, []]];
			const distances = {};
			distances[posToKey(pos)] = 0;

			const keysForKey = [];

			while (queue.length > 0) {
				const [pos, requiredKeys] = queue.shift();
				for (const [dx, dy] of [
					[0, -1],
					[0, 1],
					[-1, 0],
					[1, 0],
				]) {
					const x = pos[0] + dx;
					const y = pos[1] + dy;
					const current = [x, y];
					const char = grid[y][x];
					if (char === "#") {
						continue;
					}
					const currentAsKey = posToKey(current);
					const posAsKey = posToKey(pos);
					if (currentAsKey in distances) {
						continue;
					}
					distances[currentAsKey] = distances[posAsKey] + 1;

					if (/^[a-z]$/.test(char)) {
						keysForKey.push([char, requiredKeys, distances[currentAsKey]]);
					}
					if (/^[A-Za-z]$/.test(char)) {
						queue.push([current, requiredKeys.concat([char.toLowerCase()])]);
					} else {
						queue.push([current, requiredKeys]);
					}
				}
			}
			result[key] = keysForKey;
		}
		return result;
	}

	function setDifference(setA, setB) {
		const diff = new Set(setA);
		for (const elem of setB) {
			diff.delete(elem);
		}
		return diff;
	}

	function visibleKeys(fromKeys, unlocked, keyDistances) {
		const visible = [];

		for (let robotNum = 0; robotNum < fromKeys.length; ++robotNum) {
			const fromKey = fromKeys[robotNum];

			// Find the visible keys from each robot
			for (const [key, requiredKeys, distance] of keyDistances[fromKey]) {
				// key already collected.
				if (unlocked.has(key)) {
					continue;
				}
				// required doors aren't unlocked.
				if (setDifference(new Set(requiredKeys), unlocked).size > 0) {
					continue;
				}
				visible.push([robotNum, key, distance]);
			}
		}

		return visible;
	}

	function getCacheKey(fromKeys, unlocked) {
		const fromSorted = [...fromKeys];
		fromSorted.sort();
		const sortedUnlocked = [...unlocked];
		sortedUnlocked.sort();
		return `${fromSorted.join("")},${sortedUnlocked.join("")}`;
	}

	function numSteps(fromKeys, keyDistances, unlocked = new Set(), cache = {}) {
		const cacheKey = getCacheKey(fromKeys, unlocked);
		if (!(cacheKey in cache)) {
			let result;
			const visible = visibleKeys(fromKeys, unlocked, keyDistances);
			if (visible.length === 0) {
				result = 0;
			} else {
				const steps = [];
				for (const [robot, key, distance] of visible) {
					const originalPos = fromKeys[robot];
					fromKeys[robot] = key;
					const newlyUnlocked = new Set(unlocked);
					newlyUnlocked.add(key);
					steps.push(distance + numSteps(fromKeys, keyDistances, newlyUnlocked, cache));
					fromKeys[robot] = originalPos;
				}
				result = Math.min(...steps);
			}
			cache[cacheKey] = result;
		}
		return cache[cacheKey];
	}

	const grid = parse(data);
	const { starts, keys } = findKeys(grid);
	keys["@0"] = starts[0];
	keys["@1"] = starts[1];
	keys["@2"] = starts[2];
	keys["@3"] = starts[3];
	const keyDistances = calcKeyDist(keys, grid);
	const unlocked = new Set();
	const cache = {};
	const steps = numSteps(["@0", "@1", "@2", "@3"], keyDistances, unlocked, cache);
	const cacheLen = Object.keys(cache).length;
	return steps;
}

function p19_1() {
	const fs = require("fs");
	let data = fs.readFileSync("./p19_1.data", "utf-8");

	let currentX = 0;
	let currentY = 0;

	const maxXCheck = 1400;
	const maxYCheck = 1400;
	let startCheck = 0;
	let doBreak = false;
	let complete = false;
	function* getInput() {
		for (let i = 1200; i < maxYCheck; ++i) {
			if (i === maxYCheck - 1) {
				complete = true;
			}
			for (let j = startCheck; j < maxXCheck; ++j) {
				currentX = j;
				currentY = i;
				yield j;
				yield i;
				if (doBreak) {
					doBreak = false;
					break;
				}
			}
		}
	}

	let outputData = [];
	let affectedCount = 0;

	let lastBeamX = -1;
	let firstBeamX = -1;
	function handleOutput(out) {
		const nOut = Number(out);
		while (!outputData[currentY]) {
			outputData.push([]);
		}
		const isBeam = nOut === 1;
		outputData[currentY][currentX] = isBeam ? "#" : ".";

		if (isBeam) {
			if (firstBeamX === -1) {
				firstBeamX = currentX;
				startCheck = Math.max(firstBeamX - 1, 0);
			}
			lastBeamX = currentX;
		} else {
			if (currentX > lastBeamX && lastBeamX !== -1) {
				doBreak = true;
				firstBeamX = -1;
				lastBeamX = -1;
			}
		}

		if (nOut === 1) {
			affectedCount++;
		}
	}

	const inputIterator = getInput();
	for (let i = 0; i < maxXCheck * maxYCheck; ++i) {
		if (i % 100 === 0) {
			console.error(`i: ${i}`);
		}
		runProgram(data, inputIterator, handleOutput);
		if (complete) {
			break;
		}
	}

	let result = "";
	for (const r of outputData) {
		for (const c of r) {
			result += c || " ";
		}
		result += "\n";
	}
	console.log(result);

	// const outputLines = outputData.map(a => a || " ");
	// const outputStr = outputData.map(l => l.map(a => a == null ? " " : a).join("")).join("\n");
	// console.log(outputStr);
	return affectedCount;

	//l 48 + 1200
	//c 1122
}

function p20_1() {
	const fs = require("fs");
	let data = fs.readFileSync("./p20_1.data", "utf-8");

	//   data =
	// `         A
	//          A
	//   #######.#########
	//   #######.........#
	//   #######.#######.#
	//   #######.#######.#
	//   #######.#######.#
	//   #####  B    ###.#
	// BC...##  C    ###.#
	//   ##.##       ###.#
	//   ##...DE  F  ###.#
	//   #####    G  ###.#
	//   #########.#####.#
	// DE..#######...###.#
	//   #.#########.###.#
	// FG..#########.....#
	//   ###########.#####
	//              Z
	//              Z       `;

	function parse(input) {
		const grid = [];
		const lines = input.split("\n");
		for (let i = 0; i < lines.length; ++i) {
			grid.push([]);
			for (let j = 0; j < lines[i].length; ++j) {
				grid[i][j] = lines[i][j];
			}
		}
		return grid;
	}

	function getPosKey(pos) {
		return `${pos[0]},${pos[1]}`;
	}

	function findWarpPoints(grid) {
		const warpPoints = {};
		const byName = {};

		for (let i = 0; i < grid.length; ++i) {
			const row = grid[i];
			for (let j = 0; j < row.length; ++j) {
				const cell = row[j];

				const pos = [j, i];

				if (cell === ".") {
					for (const [dx, dy] of [
						[-1, 0],
						[1, 0],
						[0, -1],
						[0, 1],
					]) {
						const checkPos = [j + dx, i + dy];
						const checkCell = grid[checkPos[1]][checkPos[0]];
						if (/^[A-Z]$/.test(checkCell)) {
							const firstLetter = checkCell;
							const secondLetter = grid[checkPos[1] + dy][checkPos[0] + dx];

							const warpPointName =
								dx < 0 || dy < 0 ? secondLetter + firstLetter : firstLetter + secondLetter;
							if (warpPointName === "AA") {
								warpPoints["START"] = pos;
								continue;
							}
							if (warpPointName === "ZZ") {
								warpPoints["END"] = pos;
								continue;
							}

							const otherPoint = byName[warpPointName];
							if (otherPoint) {
								warpPoints[getPosKey(pos)] = otherPoint;
								warpPoints[getPosKey(otherPoint)] = pos;
							} else {
								byName[warpPointName] = pos;
							}
						}
					}
				}
			}
		}
		return warpPoints;
	}

	function getAdjacentCoords(grid, pos, warpPoints) {
		const adjacents = [];

		const warpsTo = warpPoints[getPosKey(pos)];
		if (warpsTo) {
			adjacents.push(warpsTo);
		}
		for (const [dx, dy] of [
			[-1, 0],
			[1, 0],
			[0, -1],
			[0, 1],
		]) {
			const checkPos = [pos[0] + dx, pos[1] + dy];
			const checkCell = grid[checkPos[1]][checkPos[0]];

			if (checkCell === ".") {
				adjacents.push(checkPos);
			}
		}
		return adjacents;
	}

	function genNDijkstra(grid, warpPoints) {
		const route = new NDijkstra();
		for (let i = 0; i < grid.length; ++i) {
			const row = grid[i];
			for (let j = 0; j < row.length; ++j) {
				const cell = row[j];
				const pos = [j, i];

				if (cell === ".") {
					const adjacents = getAdjacentCoords(grid, pos, warpPoints);
					const ndijkstraAdjacents = {};
					for (const adjacent of adjacents) {
						ndijkstraAdjacents[getPosKey(adjacent)] = 1;
					}
					route.addNode(getPosKey(pos), ndijkstraAdjacents);
				}
			}
		}
		return route;
	}

	const grid = parse(data);
	const warpPoints = findWarpPoints(grid);
	const ndijkstra = genNDijkstra(grid, warpPoints);
	const bestPath = ndijkstra.path(getPosKey(warpPoints["START"]), getPosKey(warpPoints["END"]));
	return bestPath.length - 1;
}

function p20_2() {
	const fs = require("fs");
	let data = fs.readFileSync("./p20_1.data", "utf-8");
	//data = fs.readFileSync("./p20_1ex1.data", "utf-8");

	function parse(input) {
		const grid = [];
		const lines = input.split("\n");
		for (let i = 0; i < lines.length; ++i) {
			grid.push([]);
			for (let j = 0; j < lines[i].length; ++j) {
				grid[i][j] = lines[i][j];
			}
		}
		return grid;
	}

	function getPosKey(pos) {
		return pos.toString();
	}

	/*

    If y = 2 or y = 116 or x = 2 or x = 114
      Outer edge
    If y = 30 or y = 88 or x = 30 or x = 86
      Inner edge

	*/

	function findWarpPoints(grid) {
		const warpPoints = {};
		const byName = {};

		for (let i = 0; i < grid.length; ++i) {
			const row = grid[i];
			for (let j = 0; j < row.length; ++j) {
				const cell = row[j];

				const pos = [j, i];

				if (cell === ".") {
					for (const [dx, dy] of [
						[-1, 0],
						[1, 0],
						[0, -1],
						[0, 1],
					]) {
						const checkPos = [j + dx, i + dy];
						const checkCell = grid[checkPos[1]][checkPos[0]];
						if (/^[A-Z]$/.test(checkCell)) {
							const firstLetter = checkCell;
							const secondLetter = grid[checkPos[1] + dy][checkPos[0] + dx];

							const warpPointName =
								dx < 0 || dy < 0 ? secondLetter + firstLetter : firstLetter + secondLetter;
							if (warpPointName === "AA") {
								warpPoints["START"] = pos;
								continue;
							}
							if (warpPointName === "ZZ") {
								warpPoints["END"] = pos;
								continue;
							}

							const otherPoint = byName[warpPointName];
							if (otherPoint) {
								warpPoints[getPosKey(pos)] = otherPoint;
								warpPoints[getPosKey(otherPoint)] = pos;
							} else {
								byName[warpPointName] = pos;
							}
						}
					}
				}
			}
		}
		return warpPoints;
	}

	function getLevelChange(warpFrom) {
		if (warpFrom[1] === 30 || warpFrom[1] === 88 || warpFrom[0] === 30 || warpFrom[0] === 86) {
			return 1;
		}
		if (warpFrom[1] === 2 || warpFrom[1] === 116 || warpFrom[0] === 2 || warpFrom[0] === 114) {
			return -1;
		}
		// for sample data
		// if (warpFrom[1] === 8 || warpFrom[1] === 28 || warpFrom[0] === 8 || warpFrom[0] === 36) {
		// 	return 1;
		// }
		// if (warpFrom[1] === 2 || warpFrom[1] === 34 || warpFrom[0] === 2 || warpFrom[0] === 42) {
		// 	return -1;
		// }
		throw new Error(`Expected different warp coordinates but got ${warpfrom.toString()}`);
	}

	function getAdjacentCoordsFunc(grid, warpPoints) {
		return function(node) {
			const adjacents = [];

			const warpsTo = warpPoints[getPosKey(node.pos)];
			if (warpsTo) {
				const newLevel = node.level + getLevelChange(node.pos);
				if (newLevel >= 0) {
					adjacents.push({ pos: [...warpsTo], level: newLevel });
				}
			}
			for (const [dx, dy] of [
				[-1, 0],
				[1, 0],
				[0, -1],
				[0, 1],
			]) {
				const checkPos = { pos: [node.pos[0] + dx, node.pos[1] + dy], level: node.level };
				const checkCell = grid[checkPos.pos[1]][checkPos.pos[0]];

				if (checkCell === ".") {
					adjacents.push(checkPos);
				}
			}
			return adjacents;
		};
	}

	// Is just the level good enough as a heuristic?
	function heuristic(node) {
		return node.level;
	}

	function distance(a, b) {
		return 1;
	}

	function getIsEndFunc(endNode) {
		return function(node) {
			return getPosKey(node.pos) === getPosKey(endNode) && node.level === 0;
		};
	}

	function hash(node) {
		return `{${node.level}:[${node.pos[0]},${node.pos[1]}]}`;
	}

	const aStar = require("a-star");
	const grid = parse(data);
	const warpPoints = findWarpPoints(grid);
	const neighbor = getAdjacentCoordsFunc(grid, warpPoints);
	const isEnd = getIsEndFunc(warpPoints["END"]);
	const bestPath = aStar({
		start: { pos: warpPoints.START, level: 0 },
		isEnd: isEnd,
		neighbor: neighbor,
		distance: distance,
		heuristic: heuristic,
		hash: hash,
	});

	for (const node of bestPath.path) {
		console.log(`${node.pos} (lev ${node.level})`);
	}

	return bestPath.cost;
}

function p21_1() {
	const fs = require("fs");
	let data = fs.readFileSync("./p21_1.data", "utf-8");

	let outBuffer = "";
	let result = 0;
	function onOutput(out) {
		const intOut = Number(out);
		if (intOut > 256) {
			result = intOut;
		} else {
			const char = String.fromCharCode(intOut);
			if (char === "\n") {
				console.log(outBuffer);
				outBuffer = "";
			} else {
				outBuffer += char;
			}
		}
	}
	/*

ABCD => ??
#### => no jump        ABCD
###. => no jump        !D
##.# => jump           
##.. => no jump        !D
#.## => jump           
#.#. => no jump        !D
#..# => jump           
#... => no jump        !D
.### => jump           
.##. => no jump        !D
.#.# => jump           
.#.. => no jump        !D
..## => jump           
..#. => no jump        !D
...# => jump           
.... => no jump (dead) !D

nojump = !D | ABCD
jump = !(!D | ABCD) = D & (!A | !B | !C | !D)


	*/

	function* getInput() {
		const program = `NOT A J
NOT B T
OR T J
NOT C T
OR T J
NOT D T
OR T J
NOT D T
NOT T T
AND T J
WALK\n`;

		const asciiCodes = program.split("").map(c => c.charCodeAt(0));
		for (const code of asciiCodes) {
			yield code;
		}
	}

	runProgram(data, getInput(), onOutput);
	return result;
}
function p21_2() {
	const fs = require("fs");
	let data = fs.readFileSync("./p21_1.data", "utf-8");

	let outBuffer = "";
	let result = 0;
	function onOutput(out) {
		const intOut = Number(out);
		if (intOut > 256) {
			result = intOut;
		} else {
			const char = String.fromCharCode(intOut);
			if (char === "\n") {
				console.log(outBuffer);
				outBuffer = "";
			} else {
				outBuffer += char;
			}
		}
	}
	/*

ABCD => ??
#### => no jump        ABCD
###. => no jump        !D
##.# => jump           
##.. => no jump        !D
#.## => jump           
#.#. => no jump        !D
#..# => jump           
#... => no jump        !D
.### => jump           
.##. => no jump        !D
.#.# => jump           
.#.. => no jump        !D
..## => jump           
..#. => no jump        !D
...# => jump           
.... => no jump (dead) !D

nojump = !D | ABCD
jump = !(!D | ABCD) = D & (!A | !B | !C | !D)


	*/

	function* getInput() {
		const program = `NOT C J
AND D J
AND H J
NOT B T
AND D T
OR T J
NOT A T
OR T J
RUN\n`;

		const asciiCodes = program.split("").map(c => c.charCodeAt(0));
		for (const code of asciiCodes) {
			yield code;
		}
	}

	runProgram(data, getInput(), onOutput);
	return result;
}

function p22_1() {
	const fs = require("fs");
	let data = fs.readFileSync("./p22_1.data", "utf-8");
	let deckSize = 10007;

	// 	data = `deal into new stack
	// cut -2
	// deal with increment 7
	// cut 8
	// cut -4
	// deal with increment 7
	// cut 3
	// deal with increment 9
	// deal with increment 3
	// cut -1`;
	// 	deckSize = 10;

	function cut(deck, pos) {
		const firstChunk = deck.slice(pos);
		const secondChunk = deck.slice(0, pos);
		return [...firstChunk, ...secondChunk];
	}

	function deal(deck, inc) {
		const newDeck = new Array(deck.length);
		let nextPos = 0;
		for (const card of deck) {
			newDeck[nextPos] = card;
			nextPos += inc;
			nextPos %= deck.length;
		}
		return newDeck;
	}

	function stack(deck) {
		return deck.reverse();
	}

	function handleLine(deck, line) {
		const words = line.split(" ");
		if (words[0] === "cut") {
			const pos = Number(words[1]);
			return cut(deck, pos);
		} else if (words[0] === "deal") {
			if (words[1] === "into") {
				return stack(deck);
			} else if (words[1] === "with") {
				const inc = Number(words[3]);
				return deal(deck, inc);
			}
		}
	}

	const lines = data.split("\n");
	let deck = new Array(deckSize);
	for (let i = 0; i < deck.length; ++i) {
		deck[i] = i;
	}
	for (const line of lines) {
		deck = handleLine(deck, line);
	}
	//console.log(deck);

	for (let i = 0; i < deck.length; ++i) {
		if (deck[i] === 2019) {
			return i;
		}
	}
}

function p22_2() {
	const fs = require("fs");
	let data = fs.readFileSync("./p22_1.data", "utf-8");

	let deckSize = 119315717514047n;
	let shuffles = 101741582076661n % 5003n;
	let targetIndex = 2020n;
	let reverse = true;

	shuffles = 1;

	// 	data = `deal with increment 60
	// cut -7394
	// deal into new stack`;

	// data = `deal with increment 3`;
	// deckSize = 10;
	// shuffles = 1;
	// targetIndex = 3;

	function gcdExtended(a, b) {
		let x = 0n,
			y = 1n,
			u = 1n,
			v = 0n;
		while (a !== 0n) {
			let q = b / a;
			[x, y, u, v] = [u, v, x - u * q, y - v * q];
			[a, b] = [b % a, a];
		}
		return [b, x, y];
	}
	function modInverse(a, m) {
		const [g, x] = gcdExtended(a, m);
		if (g !== 1n) throw "Bad mod inverse";
		return (x + m) % m;
	}
	function modDivide(a, b, m) {
		return BigInt((BigInt(a) * BigInt(modInverse(b, m))) % BigInt(m));
	}

	function reverseCut(index, deckSize, pos) {
		return cut(index, deckSize, -pos);
	}

	function reverseDeal(index, deckSize, inc) {
		return modDivide(index, inc, deckSize);
	}

	function reverseStack(index, deckSize) {
		return deckSize - 1n - index;
	}

	function cut(index, deckSize, pos) {
		const newPos = index - pos;
		if (newPos > deckSize) {
			return newPos % deckSize;
		} else {
			return newPos + deckSize;
		}
	}

	function deal(index, deckSize, inc) {
		return (index * inc) % deckSize;
	}

	function stack(index, deckSize) {
		return deckSize - 1n - index;
	}

	function normalize(index, deckSize) {
		if (index >= 0) {
			return index % deckSize;
		} else {
			return deckSize - (-index % deckSize);
		}
	}

	function lincut(index, deckSize, pos) {
		return normalize(index - pos, deckSize);
	}

	function lindeal(index, deckSize, inc) {
		return normalize(index * inc, deckSize);
	}

	function linstack(index, deckSize) {
		return normalize(-index + deckSize - 1, deckSize);
	}

	function invert(vars, deckSize) {
		const [a, b] = vars;
		let deckMultipleA = 1n;
		let deckMultipleB = 1n;

		while ((deckMultipleA * deckSize) % a !== 0n) {
			deckMultipleA++;
		}
		while ((b * deckMultipleB * deckSize) % a !== 0n) {
			deckMultipleB++;
		}
		return [deckMultipleA / a, (-b * deckMultipleB) / a];
	}

	function composeOperation(op, deckSize, a = 1n, b = 0n) {
		if (op[0] === "cut") {
			// f(index) = 1 * index + (-pos) .... c = 1, d = -pos
			const pos = op[1];
			b -= pos;
		} else if (op[0] === "deal") {
			// f(index) = inc * index + 0 .... c = inc, d = 0
			const inc = op[1];
			b *= inc;
			a *= inc;
		} else if (op[0] === "stack") {
			// f(index) = -1 * index + deckSize - 1 .... c = -1, d = deckSize - 1
			b = -1n * b + (deckSize - 1n);
			a = a * -1n;
		}
		if (op[2]) {
			return invert([a, b], deckSize);
		}
		return [a, b];
	}

	function computeLinearShuffle(ops, deckSize) {
		let a = 1n;
		let b = 0n;

		for (const op of ops) {
			[a, b] = composeOperation(op, deckSize, a, b);
		}
		return [a, b];
	}

	function computeOps(input, deckSize, reverse = false) {
		const lines = input.split("\n");
		if (reverse) {
			lines.reverse();
		}
		const ops = [];
		for (const line of lines) {
			const words = line.split(" ");
			if (words[0] === "cut") {
				ops.push(["cut", BigInt(words[1]), reverse]);
			} else if (words[0] + words[1] === "dealwith") {
				ops.push(["deal", BigInt(words[3]), reverse]);
			} else if (words[0] + words[1] === "dealinto") {
				ops.push(["stack", deckSize, reverse]);
			}
		}
		return ops;
	}

	const ops = computeOps(data, deckSize, true);
	const linearShuffle = computeLinearShuffle(ops, deckSize);

	const oneShuffle2020 = normalize(2020n * linearShuffle[0] + linearShuffle[1], deckSize);
	console.log(`oneShuffle2020: ${oneShuffle2020}`);

	// Old try

	function handleLine(index, deckSize, reverse, line) {
		const words = line.split(" ");
		if (words[0] === "cut") {
			const pos = BigInt(words[1]);
			if (reverse) {
				return reverseCut(index, deckSize, pos);
			} else {
				return cut(index, deckSize, pos);
			}
		} else if (words[0] === "deal") {
			if (words[1] === "into") {
				if (reverse) {
					return reverseStack(index, deckSize);
				} else {
					return stack(index, deckSize);
				}
			} else if (words[1] === "with") {
				const inc = BigInt(words[3]);
				if (reverse) {
					return reverseDeal(index, deckSize, inc);
				} else {
					return deal(index, deckSize, inc);
				}
			}
		}
	}

	const lines = data.split("\n");
	if (reverse) {
		lines.reverse();
	}
	let index = targetIndex;
	for (let i = 0; i < shuffles; ++i) {
		if (i % 10000 === 0) {
			console.log(`i = ${i}`);
		}
		for (const line of lines) {
			index = handleLine(index, deckSize, reverse, line);
			if (index === targetIndex) {
				console.log(`Repeated at i = ${i}`);
			}
		}
	}

	return index;

	// let iteration = 0;
	// while (true) {
	// 	iteration++;
	// 	if (iteration % 1000 === 0) {
	// 		console.log(`Iteration ${iteration}`);
	// 	}
	// 	for (const line of lines) {
	// 		deck = handleLine(deck, line);
	// 	}
	// 	let done = true;
	// 	for (let i = 0; i < deck.length; ++i) {
	// 		if (i !== deck[i]) {
	// 			done = false;
	// 			break;
	// 		}
	// 	}
	// 	if (done) {
	// 		console.log(`After ${iteration} iterations we repeat.`);
	// 		break;
	// 	}
	// }
}

console.log(p22_2());
