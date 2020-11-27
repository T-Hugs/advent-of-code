import chalk from "chalk";

let DEBUG = false;

export function setDebug(debug: boolean) {
	DEBUG = debug;
}

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

export function logSolution(part1: string, part2?: string) {
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
}
