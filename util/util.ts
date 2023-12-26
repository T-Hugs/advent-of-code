import * as path from "path";
import * as fs from "fs/promises";
import crypto from "crypto";
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

export function splitTimeIntoUnits(ms: number) {
	let remaining = ms;
	const result: { [key: string]: number } = {
		days: 0,
		hr: 0,
		min: 0,
		sec: 0,
		ms: 0,
	};
	if (remaining > 86400000) {
		result.days = Math.floor(remaining / 86400000);
		remaining -= result.days * 86400000;
	}
	if (remaining > 3600000) {
		result.hr = Math.floor(remaining / 3600000);
		remaining -= result.hr * 3600000;
	}
	if (remaining > 60000) {
		result.min = Math.floor(remaining / 60000);
		remaining -= result.min * 60000;
	}
	if (remaining > 1000) {
		result.sec = Math.floor(remaining / 1000);
		remaining -= result.sec * 1000;
	}
	if (remaining > 0) {
		result.ms = remaining;
	}
	return result;
}
const TIME_UNIT_ORDER = ["days", "hr", "min", "sec", "ms"];
export function formatTime(ms: number, unitsOfPrecision: number = Number.MAX_SAFE_INTEGER) {
	const units = splitTimeIntoUnits(ms);
	const entries = Object.entries(units);
	entries.sort((a, b) => TIME_UNIT_ORDER.indexOf(a[0]) - TIME_UNIT_ORDER.indexOf(b[0]));
	let result: string[] = [];
	const startIndex = entries.findIndex(e => e[1] !== 0);
	for (let i = startIndex; i < Math.min(entries.length, startIndex + unitsOfPrecision); ++i) {
		if (entries[i][0] === "ms") {
			if (i === startIndex + unitsOfPrecision - 1) {
				result.push(Math.round(entries[i][1]) + entries[i][0]);
			} else {
				const microseconds = Math.round(entries[i][1] * 1000) / 1000;
				result.push(microseconds + entries[i][0]);
			}
		} else {
			result.push(Math.round(entries[i][1]) + entries[i][0]);
		}
	}
	return result.join(" ");
}

/**
 * Returns a promise that resolves after a certain amount of time.
 * @param ms Number of milliseconds to wait
 */
export async function wait(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export function getLatestPuzzleDate(asOf = new Date()) {
	const asUTC = new Date(asOf.getTime() + asOf.getTimezoneOffset() * 60 * 1000);
	const asEST = new Date(asUTC.getTime() - 5 * 60 * 60 * 1000);
	const isDecember = asEST.getMonth() === 11;
	const currentYear = asEST.getFullYear();
	const latestPuzzleYear = isDecember ? currentYear : currentYear - 1;
	const currentDay = asEST.getDate();
	const latestPuzzleDay = isDecember ? Math.min(currentDay, 25) : 25;
	return { day: latestPuzzleDay, year: latestPuzzleYear };
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

export function clamp(val: number, min: number, max: number) {
	return Math.max(Math.min(val, max), min);
}

// The % operator in JS is the remainder operator. The below function
// implements modulus. The two give the same output for positive values
// of the left-operand, but different for negative values.
// @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
export function bigIntMod(_a: number | bigint, _n: number | bigint) {
	const [a, n] = [_a, _n].map(BigInt);
	return ((a % n) + n) % n;
}

/**
 * JavaScript's % operator is the remainder operator rather than the modulus
 * operator. This function implements modulus, which produces different results
 * than % for negative values. Use this instead of % for most cases.
 * @param a
 * @param n
 * @returns
 */
export function mod(a: number, n: number) {
	return ((a % n) + n) % n;
}

export function gcd(a: number, b: number) {
	a = Math.abs(a);
	b = Math.abs(b);

	if (b > a) {
		var temp = a;
		a = b;
		b = temp;
	}

	while (true) {
		a %= b;
		if (a === 0) {
			return b;
		}
		b %= a;
		if (b === 0) {
			return a;
		}
	}
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

export function lcm(nums: bigint[]) {
	return nums.reduce((p, c) => (p * c) / BigInt(gcd(Number(p), Number(c))), 1n);
}

/**
 * modular multiplicative inverse
 * @param _a
 * @param _m
 */
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

/**
 * I don't remember exactly what this does.
 * @param elems
 * @param target
 * @param level
 */
// Note: doesn't work great for duplicate values in the input array
export function* getSumSubsets(elems: number[], target: number, level: number = 0): Generator<number[] | undefined> {
	const generated: number[][] = [];
	if (target === 0) {
		yield [];
	} else if (target < 0) {
		yield undefined;
	} else {
		for (let i = 0; i < elems.length; ++i) {
			const elem = elems[i];
			const reducedSubsets = getSumSubsets(
				[...elems.slice(0, i), ...elems.slice(i + 1)],
				target - elem,
				level + 1
			);
			for (const subset of reducedSubsets) {
				if (subset) {
					const next = [elem, ...subset];
					let alreadyGenerated = false;
					for (const gen of generated) {
						const genCopy = [...gen];
						for (const i of next) {
							const itemIndex = genCopy.indexOf(i);
							if (itemIndex >= 0) {
								genCopy.splice(itemIndex, 1);
							} else {
								break;
							}
						}
						alreadyGenerated = genCopy.length === 0;
						if (alreadyGenerated) {
							break;
						}
					}
					if (!alreadyGenerated) {
						generated.push(next);
						yield next;
					}
				}
			}
		}
	}
}

/**
 * Returns the count of each unique element in the array
 */
export function countUniqueElements(iterable: Iterable<string>): {
	[elem: string]: number;
} {
	const result: { [elem: string]: number } = {};
	for (const elem of iterable) {
		if (!result[elem]) {
			result[elem] = 1;
		} else {
			result[elem]++;
		}
	}
	return result;
}

/**
 * For a given array, find the "maximum" element and return its index,
 * numerical value, and original value.
 * @param arr
 * @param toNumber A function to convert array elements to numbers
 * @returns
 */
export function max<T>(arr: T[], toNumber: (elem: T) => number = Number, getAllIndexes = false) {
	let maxIndex = -1;
	let maxValue = Number.MIN_VALUE;
	let maxElem: T | undefined = undefined;
	let allIndexes: number[] = [];
	for (let i = 0; i < arr.length; ++i) {
		const num = toNumber(arr[i]);
		if (num > maxValue) {
			maxIndex = i;
			maxValue = num;
			maxElem = arr[i];
		}
	}
	if (getAllIndexes) {
		for (let i = 0; i < arr.length; ++i) {
			const num = toNumber(arr[i]);
			if (num === maxValue) {
				allIndexes.push(i);
			}
		}
	}
	return { index: maxIndex, value: maxValue, elem: maxElem!, allIndexes };
}

/**
 * For a given array, find the "minimum" element and return its index,
 * numerical value, and original value.
 * @param arr
 * @param toNumber A function to convert array elements to numbers
 * @returns
 */
export function min<T>(arr: T[], toNumber: (elem: T) => number = Number, getAllIndexes = false) {
	let minIndex = -1;
	let minValue = Number.MAX_VALUE;
	let minElem: T | undefined = undefined;
	const allIndexes: number[] = [];
	for (let i = 0; i < arr.length; ++i) {
		const num = toNumber(arr[i]);
		if (num < minValue) {
			minIndex = i;
			minValue = num;
			minElem = arr[i];
		}
	}
	if (getAllIndexes) {
		for (let i = 0; i < arr.length; ++i) {
			const num = toNumber(arr[i]);
			if (num === minValue) {
				allIndexes.push(i);
			}
		}
	}
	return { index: minIndex, value: minValue, elem: minElem!, allIndexes };
}

/**
 * Returns the MD5 digest of the given string as a hexadecimal string.
 * @param input
 * @returns
 */
export function md5(input: string) {
	const hash = crypto.createHash("md5");
	hash.update(input);
	return hash.digest("hex");
}

export function sumArray(arr: Iterable<number>) {
	let sum = 0;
	for (const elem of arr) {
		sum += elem;
	}
	return sum;
}
