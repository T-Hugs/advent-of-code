import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";

const YEAR = 2020;
const DAY = 18;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2020/18/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2020/18/data.txt
// problem url  : https://adventofcode.com/2020/day/18

interface Token {
	name: string;
	source: string;
	length: number;
	offset: number;
}

interface Node {
	offset: number;
	length: number;
}
interface Term extends Node {
	val?: Token;
	parentheticalExpr?: Expression;
}
interface Expression extends Node {
	lhs: Term;
	rhs: {
		op: Token;
		term: Term;
	}[];
}

/**
 * Compiles Expressions that adhere to the following grammar:
 *   TERM => <NUMBER> | ( <EXPR> )
 *   OP => "*" | "+"
 *   EXPR => <TERM> (<OP> <TERM>)*
 */
class ExpressionCompiler {
	private static OPERATORS = new Set<string>();
	private static TOKENS_MATCHERS = {
		NUMBER: /\d+/,
		PLUS: /\+/,
		MULTIPLY: /\*/,
		LPAREN: /\(/,
		RPAREN: /\)/,
		WHITESPACE: /\s+/,
		EPSILON: /^$/,
	};

	static init() {
		ExpressionCompiler.OPERATORS.add("MULTIPLY");
		ExpressionCompiler.OPERATORS.add("PLUS");
	}

	static getNextToken(str: string, index: number): Token {
		const substr = str.substr(index);
		for (const [name, re] of Object.entries(ExpressionCompiler.TOKENS_MATCHERS)) {
			const startAnchorRe = new RegExp("^" + re.toString().slice(1, -1), "s");
			const match = startAnchorRe.exec(substr);
			if (match) {
				return {
					name,
					source: match[0],
					length: match[0].length,
					offset: index,
				};
			}
		}
		throw new Error(`Failed to tokenize string ${str} at index ${index}. String starting at index is ${substr}.`);
	}

	static tokenizeExpression(expr: string): Token[] {
		const tokens: Token[] = [];

		let index = 0;
		while (true) {
			const nextToken = ExpressionCompiler.getNextToken(expr, index);
			if (nextToken.name === "EPSILON") {
				break;
			} else {
				tokens.push(nextToken);
				index += nextToken.length;
			}
		}
		return tokens;
	}

	private tokens: Token[];
	private operatorPrecedence: Set<string>[] = [];
	public constructor(expr: string, operatorPrecedence: Set<string>[] = []) {
		this.tokens = ExpressionCompiler.tokenizeExpression(expr);
		this.operatorPrecedence = operatorPrecedence;
	}

	static isOperator(token: Token | undefined) {
		return token != undefined && ExpressionCompiler.OPERATORS.has(token.name);
	}

	private consumeWhitespace(offset: number): number {
		for (let i = offset; i < this.tokens.length; ++i) {
			if (this.tokens[i].name !== "WHITESPACE") {
				return i;
			}
		}
		return offset;
	}

	private parseTerm(offset: number): Term {
		const initialOffset = this.consumeWhitespace(offset);
		let _offset = initialOffset;
		const token = this.tokens[_offset];
		if (token.name === "NUMBER") {
			return {
				val: token,
				offset: _offset,
				length: 1,
			};
		} else if (token.name === "LPAREN") {
			_offset += 1;
			const expression = this.parseExpression(_offset);
			_offset = _offset + expression.length;
			_offset = this.consumeWhitespace(_offset);
			if (this.tokens[_offset].name === "RPAREN") {
				return {
					parentheticalExpr: expression,
					offset: initialOffset,
					length: _offset + 1 - initialOffset,
				};
			}
			throw new Error(`Did not find a closing parenthesis for term, instead found ${token.name}`);
		} else {
			throw new Error(`Could not parse tokens as a Term. Required NUMBER or LPAREN, but found ${token.name}.`);
		}
	}

	private parseExpression(offset = 0): Expression {
		const initialOffset = this.consumeWhitespace(offset);
		let _offset = initialOffset;
		const lhs = this.parseTerm(_offset);
		_offset = _offset + lhs.length;
		_offset = this.consumeWhitespace(_offset);
		const rhs: { op: Token; term: Term }[] = [];
		while (ExpressionCompiler.isOperator(this.tokens[_offset])) {
			const op = this.tokens[_offset];
			_offset += 1;
			_offset = this.consumeWhitespace(_offset);
			const term = this.parseTerm(_offset);
			_offset += term.length;
			rhs.push({ op, term });
			_offset = this.consumeWhitespace(_offset);
		}
		return {
			lhs,
			rhs,
			offset: initialOffset,
			length: _offset - initialOffset,
		};
	}
	private evaluateTerm(term: Term) {
		if (term.val) {
			return Number(term.val.source);
		} else if (term.parentheticalExpr) {
			return this.evaluateExpression(term.parentheticalExpr);
		} else {
			throw new Error("Invalid term! Terms must contain a value or a parenthetical expression.");
		}
	}
	private evaluateExpression(expr: Expression): number {
		const evaledTerms = expr.rhs.map(r => this.evaluateTerm(r.term));
		evaledTerms.unshift(this.evaluateTerm(expr.lhs));
		const ops = expr.rhs.map(r => r.op.name);

		// The less-than-or-equal is not a bug.
		for (let precedencePointer = 0; precedencePointer <= this.operatorPrecedence.length; ++precedencePointer) {
			const nextOps = this.operatorPrecedence[precedencePointer];

			for (let i = 0; i < ops.length; ) {
				if (nextOps == undefined || nextOps.has(ops[i])) {
					const left = evaledTerms[i];
					const right = evaledTerms[i + 1];
					if (ops[i] === "PLUS") {
						evaledTerms[i + 1] = left + right;
					} else if (ops[i] === "MULTIPLY") {
						evaledTerms[i + 1] = left * right;
					}
					ops.splice(i, 1);
					evaledTerms.splice(i, 1);
				} else {
					++i;
				}
			}
		}
		return evaledTerms[0];
	}

	public evaluate() {
		return this.evaluateExpression(this.parseExpression());
	}
}
ExpressionCompiler.init();

async function p2020day18_part1(input: string) {
	const lines = input.split("\n");

	let sum = 0;
	for (const line of lines) {
		sum += new ExpressionCompiler(line).evaluate();
	}
	return sum;
}
async function p2020day18_part2(input: string) {
	const lines = input.split("\n");
	let sum = 0;
	for (const line of lines) {
		sum += new ExpressionCompiler(
			line,
			"PLUS MULTIPLY".split(" ").map(op => new Set([op]))
		).evaluate();
	}
	return sum;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `((2 * 3 + 4) * 5 + (6 + 2) * 3 + 1) * 4`,
			expected: `700`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `((2 * 3 + 4) * 5 + (6 + 2) * 3 + 1) * 4`,
			expected: `2912`,
		},
	];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2020day18_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2020day18_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2020day18_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2020day18_part2(input));
	const part2After = performance.now();

	logSolution(18, 2020, part1Solution, part2Solution);

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
