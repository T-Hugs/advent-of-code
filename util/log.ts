import chalk from "chalk";
import { LocalStorage } from "node-localstorage";
import path from "path";
import { getAppRoot } from "./util";

const appRoot = getAppRoot();
const localStorage = new LocalStorage(path.join(appRoot, ".scratch"));

let DEBUG = false;

export function setDebug(debug: boolean) {
	DEBUG = debug;
}

/**
 * Logs arbitrary strings and objects
 * @param params 
 */
export function log(...params: any[]) {
	for (const param of params) {
		if (typeof param === "object") {
			console.dir(param);
		} else {
			process.stdout.write(param.toString() + " ");
		}
	}
	console.log();
}

/**
 * Logs a message only if --debug is passed to run.ts
 * @param params 
 */
export function trace(...params: any[]) {
	if (DEBUG) {
		for (const param of params) {
			if (typeof param === "object") {
				process.stdout.write(chalk.gray("<"));
				console.dir(param);
				process.stdout.write(chalk.gray(">"));
			} else {
				process.stdout.write(chalk.gray(param.toString() + " "));
			}
		}
		console.log();
	}
}
export const solutionLogKey = "solutionLog";
export interface SolutionObject {
	dateComputed: string;
	problem: { year: number; day: number };
	part1: string;
	part2: string;
	submissions?: {
		date: string;
		result: "correct" | "incorrect" | "low" | "high" | "timeout" | "unknown";
		cooldownFinished?: string;
	}[];
}
export function logSolution(day: number, year: number, part1: string, part2?: string) {
	const part1Text =
		part1 === "Not implemented"
			? chalk.black.bgYellowBright(` ${part1} `)
			: chalk.black.bgGreenBright(` ${part1} `);
	const part2Text =
		part2 != undefined
			? part2 === "Not implemented"
				? chalk.black.bgYellowBright(` ${part2} `)
				: chalk.black.bgGreenBright(` ${part2} `)
			: "";

	console.log(
		"\n== ANSWER ==\n" +
			chalk.blueBright.bold("Part 1: ") +
			part1Text +
			(part2 != undefined ? chalk.blueBright.bold("\nPart 2: ") : "") +
			part2Text +
			"\n"
	);

	// Log the solution in local storage. Used in case of a follow-up execution of submit.ts
	const solutionObj = {
		dateComputed: new Date().toJSON(),
		problem: {
			year,
			day,
		},
		part1,
		part2,
	} as SolutionObject;

	const solutionLogStr = localStorage.getItem(solutionLogKey);
	let solutionLog: any;
	if (solutionLogStr) {
		try {
			solutionLog = JSON.parse(solutionLogStr);
			if (Array.isArray(solutionLog)) {
				solutionLog.push(solutionObj);
			}
		} catch {}
	}
	if (!solutionLog) {
		solutionLog = [solutionObj];
	}
	localStorage.setItem(solutionLogKey, JSON.stringify(solutionLog, null, 4));
}
