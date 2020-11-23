let idSeed = 1;
let ENABLE_LOGGING = false;
export function compute(von_neumann, inputBuffer = [], outputBuffer = [], reg = {}) {
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

export function runProgram(str, inputBuffer = [], outputBuffer = [], reg = {}) {
	const von_neumann = str.split(",").map(v => BigInt(v));
	return compute(von_neumann, inputBuffer, outputBuffer, reg);
}