import * as path from "path";
import * as fs from "fs/promises";
import { existsSync } from "fs";
import { fileURLToPath } from "url";

/**
 * Helper to run multiple search-and-replace operations within a string.
 * @param corpus Body of text in which to make replacements
 * @param replacements Dictionary of search => replacement. Run in sequential order.
 * @param global If false, only replace the first occurrence of each search value.
 */
export function replaceAll(corpus: string, replacements: { [search: string]: string }, global = true) {
	let current = corpus;
	for (const entry of Object.entries(replacements)) {
		if (global) {
			current = current.split(entry[0]).join(entry[1]);
		} else {
			current = current.replace(entry[0], entry[1]);
		}
	}
	return current;
}

export function msToString(ms: number) {
	if (ms < 10000) {
		return ms + "ms";
	} else if (ms < 60000) {
		return ms / 1000 + "sec";
	} else {
		const mins = Math.floor(ms / 60000);
		return mins + "min " + (ms % 60000) / 1000 + "sec";
	}
}

/**
 * Returns a promise that resolves after a certain amount of time.
 * @param ms Number of milliseconds to wait
 */
export async function wait(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// Use this if we move back to ESM
// export const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Starting from the directory this file is running in, search up
 * through folders until a "package.json" file is found. Return this
 * directory's path.
 */
export function getAppRoot() {
	let currentDir = __dirname;
	while (!existsSync(path.join(currentDir, "package.json"))) {
		currentDir = path.dirname(currentDir);
	}
	return currentDir;
}

export function getDayRoot(day: number, year: number, rootDir = path.join(getAppRoot(), "years")) {
	const dayWithLeadingZeros = String(day).padStart(2, "0");
	return path.join(rootDir, String(year), dayWithLeadingZeros);
}

export function getProblemUrl(day: number, year: number) {
	return `https://adventofcode.com/${year}/day/${day}`;
}

export async function getInput(day: number, year: number, rootDir = path.join(getAppRoot(), "years")) {
	const dayRoot = getDayRoot(day, year, rootDir);
	return fs.readFile(path.join(dayRoot, "data.txt"), "utf-8");
}

// The % operator in JS is the remainder operator. The below function
// implements modulus. The two give the same output for positive values
// of the left-operand, but different for negative values.
// @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
export function mod(_a: number | bigint, _n: number | bigint) {
	const [a, n] = [_a, _n].map(BigInt);
	return ((a % n) + n) % n;
}

export function gcdExtended(_a: number | bigint, _b: number | bigint) {
	let [a, b] = [_a, _b].map(BigInt);
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
export function modInverse(_a: number | bigint, _m: number | bigint) {
	const [a, m] = [_a, _m].map(BigInt);
	const [g, x] = gcdExtended(a, m);
	if (g !== 1n) throw "Bad mod inverse";

	return (x + m) % m;
}
export function modDivide(_a: number | bigint, _b: number | bigint, _m: number | bigint) {
	const [a, b, m] = [_a, _b, _m].map(BigInt);
	return (a * modInverse(b, m)) % m;
}

export function powerMod(_base: number | bigint, _exponent: number | bigint, _modulus: number | bigint) {
	let [base, exponent, modulus] = [_base, _exponent, _modulus].map(BigInt);
	if (modulus === 1n) return 0n;
	let result = 1n;
	base = base % modulus;
	while (exponent > 0n) {
		if (exponent % 2n === 1n) result = (result * base) % modulus;
		exponent = exponent >> 1n;
		base = (base * base) % modulus;
	}
	return result;
}

export function getPermutations<T>(inputArr: T[]) {
	const result: T[][] = [];

	function permute(arr: T[], m: T[] = []) {
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

export function powerSet<T>(inputArr: T[], settings: { proper?: boolean; nonEmpty?: boolean } = {}) {
	let result = inputArr.reduce((subsets, value) => subsets.concat(subsets.map(set => [value, ...set])), [
		[],
	] as T[][]);
	if (settings.proper) {
		result = result.filter(a => a.length !== inputArr.length);
	}
	if (settings.nonEmpty) {
		result = result.filter(a => a.length !== 0);
	}
	return result;
}
