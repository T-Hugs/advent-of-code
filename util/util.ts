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

/**
 * Returns a promise that resolves after a certain amount of time.
 * @param ms Number of milliseconds to wait
 */
export async function wait(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
