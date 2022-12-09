import fetch from "cross-fetch";
import { getAppRoot, replaceAll, wait, getDayRoot, getProblemUrl, getLatestPuzzleDate, formatTime } from "./util/util";
import playwright from "playwright-chromium";
import { LocalStorage } from "node-localstorage";
import * as path from "path";
import mkdirp from "mkdirp";
import chalk from "chalk";
import * as fs from "fs/promises";
import { existsSync, mkdir } from "fs";
import { getSessionToken } from "./getToken";
import { UA_STRING } from "./config";

interface Settings {
	pristine: boolean;
	rootPath: string;
	seed: boolean;
	suck: boolean;
	templatePath: string;
	compareWithPath?: string;
	years: number[];
	wait: boolean;
}

if (
	process.argv.includes("-h") ||
	process.argv.includes("--help") ||
	(!process.argv.includes("suck") && !process.argv.includes("seed"))
) {
	console.log(`Advent of Code initializer

Initialize your Advent of Code workspace by
-- Automatically sucking in problem data
-- Seeding your solution files with a template

Usage:
node init.js [seed] [suck] [options]
seed             : Seed solution files using template.
suck             : Suck in problem data from adventofcode.com.
--year, -y       : Specify a year e.g., 2018. Defaults to current year.
                   Or specify "all" for all years (2015-current_year).
--path, -p       : Specify root path for writing data. Must supply full,
                   absolute path. Defaults to {app_root}/years.
--template       : Specify path to solution seed template. Template file
                   name must end in in the format ".xx.dat", where xx can
                   be any extension. All solution files generated will 
                   have an extension of ".xx". Must supply full, absolute
                   path. Defaults to {app_root}/solutionTemplate.ts.dat.
--compare-with   : Optional template to compare with to make template
                   updates without destroying any existing solutions.
                   Defaults to {app_root}/compareTemplate.dat.
--pristine       : Overwrite all solution files and data files. Cannot be
                   reversed. You have been warned.
--wait           : Before sucking any data, wait until the next problem is
                   released, then proceed normally. If wait is more than
                   one day, show an error and do nothing.

`);
	process.exit();
}
const settings: Settings = {
	years: [],
	suck: false,
	seed: false,
	rootPath: "",
	templatePath: "",
	compareWithPath: "",
	pristine: false,
	wait: false,
};
const appRoot = getAppRoot();
const localStorage = new LocalStorage(path.join(appRoot, ".scratch"));

const AOC_INPUT_TEMPLATE = "https://adventofcode.com/{year}/day/{day}/input";
const NUM_DAYS = 25;
const START_YEAR = 2015;

async function getDayData(day: number, year: number): Promise<string> {
	const sessionToken = await getSessionToken();
	const uri = replaceAll(AOC_INPUT_TEMPLATE, {
		"{year}": String(year),
		"{day}": String(day),
	});
	const result = await fetch(uri, {
		headers: {
			cookie: `session=${sessionToken}`,
			"user-agent": UA_STRING
		},
	});
	if (result.status === 200) {
		return result.text();
	} else if (result.status !== 404) {
		throw new Error(
			"Did not get a 200 status code requesting data. Did your token expire? Try running `npx ts-node login.ts` again. Error code: " +
				result.status
		);
	} else {
		throw new Error("Received a 404. Is the puzzle released yet?");
	}
}

function getDataPath(day: number, year: number) {
	const dataDir = getDayRoot(day, year, settings.rootPath);
	return path.join(dataDir, "data.txt");
}

function getSolutionPath(day: number, year: number) {
	const dataDir = getDayRoot(day, year, settings.rootPath);
	const templatePath = settings.templatePath;
	const templateExtension = path.extname(templatePath.substr(0, templatePath.length - 4));
	return path.join(dataDir, `index${templateExtension}`);
}

let template: string | undefined;
async function getTemplate() {
	if (template == undefined) {
		template = await fs.readFile(settings.templatePath, "utf-8");
	}
	return template;
}

let compareTemplate: string | undefined;
async function getCompareTemplate() {
	if (compareTemplate == undefined) {
		if (settings.compareWithPath && existsSync(settings.compareWithPath)) {
			compareTemplate = await fs.readFile(settings.compareWithPath, "utf-8");
		} else {
			compareTemplate = "XXXXXX";
		}
	}
	return compareTemplate;
}

function getReleaseTime(day: number, year: number) {
	const inCurrentTZ = new Date(year, 11, day, 5);
	return new Date(inCurrentTZ.getTime() - inCurrentTZ.getTimezoneOffset() * 60 * 1000);
}

async function suckDay(day: number, year: number) {
	const dataPath = getDataPath(day, year);
	if (!existsSync(dataPath) || settings.pristine) {
		const releaseTime = getReleaseTime(day, year);
		if (new Date().getTime() >= releaseTime.getTime()) {
			console.log(`Sucking in data for year: ${year}, day: ${day}.`);
			const data = await getDayData(day, year);
			const dataDir = path.dirname(dataPath);
			await mkdirp(dataDir);
			await fs.writeFile(dataPath, data.trim(), "utf-8");
		} else {
			return true;
		}
	}
	return false;
}

function getAllYears() {
	const latestPuzzle = getLatestPuzzleDate();
	const years: number[] = [];
	for (let i = START_YEAR; i <= latestPuzzle.year; ++i) {
		years.push(i);
	}
	return years;
}

function parseArgs() {
	const latestPuzzle = getLatestPuzzleDate();
	const args = process.argv.slice(2);

	const yearIndex = args.findIndex(a => a === "--year" || a === "-y");
	const yearArg = yearIndex >= 0 ? args[yearIndex + 1] : String(latestPuzzle.year);
	const years = yearArg === "all" ? getAllYears() : [Number(yearArg)];

	const sessionTokenIndex = args.findIndex(
		a => a === "--session" || a === "--session-token" || a === "--sessionToken" || a === "--token" || a === "-t"
	);

	const rootPathIndex = args.findIndex(a => a === "--path" || a === "-p");
	const rootPath = rootPathIndex >= 0 ? args[rootPathIndex + 1] : path.join(getAppRoot(), "years");

	const templatePathIndex = args.findIndex(a => a === "--template");
	let templatePath =
		templatePathIndex >= 0 ? args[templatePathIndex + 1] : path.join(getAppRoot(), "solutionTemplate.ts.dat");
	const origTemplatePath = templatePath;

	const compareWithIndex = args.findIndex(a => a === "--compare-with");
	let compareWithPath =
		compareWithIndex >= 0 ? args[compareWithIndex + 1] : path.join(getAppRoot(), "compareTemplate.dat");

	const sessionToken = sessionTokenIndex >= 0 ? args[sessionTokenIndex + 1] : undefined;
	const suck = args.includes("suck");
	const seed = args.includes("seed");
	const pristine = args.includes("--pristine");
	const wait = args.includes("--wait");

	if (!existsSync(templatePath)) {
		templatePath = templatePath + ".dat";
	}
	if (!existsSync(templatePath) && seed) {
		throw new Error(`Could not find template at path: ${origTemplatePath}`);
	}

	Object.assign(settings, {
		years,
		suck,
		seed,
		rootPath,
		templatePath,
		pristine,
		compareWithPath,
		wait,
	});
}

async function seed(year: number) {
	for (let i = 0; i < 25; ++i) {
		const day = i + 1;
		const solutionPath = getSolutionPath(day, year);

		const replacements = {
			"{year}": String(year),
			"{day}": String(day),
			"{solution_path}": solutionPath,
			"{data_path}": getDataPath(day, year),
			"{problem_url}": getProblemUrl(day, year),
		};
		await mkdirp(path.dirname(solutionPath));
		let doesNotExistOrIsUnchanged = !existsSync(solutionPath);
		if (!doesNotExistOrIsUnchanged) {
			const compareTemplate = await getCompareTemplate();
			const existingFileContents = await fs.readFile(solutionPath, "utf-8");
			const compareSeed = replaceAll(compareTemplate, replacements);
			doesNotExistOrIsUnchanged = compareSeed === existingFileContents;
		}

		if (settings.pristine || doesNotExistOrIsUnchanged) {
			const seedText = replaceAll(await getTemplate(), replacements);
			await fs.writeFile(solutionPath, seedText, "utf-8");
		}
	}
}

async function run() {
	parseArgs();

	if (settings.suck) {
		if (settings.wait) {
			const latestPuzzleAsOfTomorrow = getLatestPuzzleDate(new Date(Date.now() + 86400000));
			const actualLatestPuzzle = getLatestPuzzleDate();
			if (
				latestPuzzleAsOfTomorrow.day === actualLatestPuzzle.day &&
				latestPuzzleAsOfTomorrow.year === actualLatestPuzzle.year
			) {
				console.log(
					chalk.redBright("Error: ") +
						"The latest puzzle won't be released for more than 1 day. Use --wait only within 1 day of next puzzle release."
				);
			} else {
				const releaseTime = getReleaseTime(
					latestPuzzleAsOfTomorrow.day,
					latestPuzzleAsOfTomorrow.year
				);
				// Wait an extra few seconds just in case the system clock is off by a bit.
				// The player will need to read the problem anyway.
				const toWait = releaseTime.getTime() - new Date().getTime() + 5000;

				console.log(
					chalk.yellowBright("\n=== WAITING === \n") +
						`Waiting ${formatTime(
							toWait,
							2
						)} for next puzzle release before continuing (Ctrl+C to cancel).\n`
				);
				await wait(toWait);
			}
		}
		for (const year of settings.years) {
			for (let i = 0; i < NUM_DAYS; ++i) {
				const day = i + 1;
				const isDone = await suckDay(day, year);
				if (isDone) {
					console.log(`Finished sucking year ${year} after day: ${day - 1}.`);
					return;
				}

				// Wait 100ms between requests, because idk.
				await wait(100);
			}
		}
	}
	if (settings.seed) {
		for (const year of settings.years) {
			await seed(year);
		}
	}
}

run().then(() => {
	process.exit();
});
