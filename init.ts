import fetch from "node-fetch";
import { getAppRoot, replaceAll, wait, getDayRoot, getProblemUrl } from "./util/util.js";
import playwright from "playwright-chromium";
import { LocalStorage } from "node-localstorage";
import * as path from "path";
import mkdirp from "mkdirp";
import * as fs from "fs/promises";
import { existsSync } from "fs";

interface Settings {
	pristine: boolean;
	rootPath: string;
	seed: boolean;
	sessionToken?: string;
	storeToken: boolean;
	suck: boolean;
	templatePath: string;
	years: number[];
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
--token, -t      : Specify your session token for authentication.
                   Defaults to get it interactively using Chromium.
                   Plain text value will be saved in .scratch.
--no-store-token : Do not store the token on disk. Also applies to
                   interactive login. Any existing token will be deleted.
--pristine       : Overwrite all solution files and data files. Cannot be
                   reversed. You have been warned.

`);
	process.exit();
}
const settings: Settings = {
	storeToken: true,
	years: [],
	suck: false,
	seed: false,
	rootPath: "",
	templatePath: "",
	pristine: false,
};
const appRoot = getAppRoot();
const localStorage = new LocalStorage(path.join(appRoot, ".scratch"));

const AOC_INPUT_TEMPLATE = "https://adventofcode.com/{year}/day/{day}/input";
const NUM_DAYS = 25;
const START_YEAR = 2015;

async function getNewSessionToken() {
	const browser = await playwright.chromium.launch({ headless: false });
	const context = await browser.newContext();
	const page = await context.newPage();
	await page.goto("https://adventofcode.com/auth/github");
	await page.waitForNavigation({ url: /^https:\/\/adventofcode\.com\/$/, timeout: 0 });
	const cookies = await context.cookies();
	const sessionCookie = cookies.find(c => c.name === "session" && c.domain.includes("adventofcode.com"));
	if (!sessionCookie) {
		throw new Error("Could not acquire session cookie.");
	}
	return sessionCookie.value;
}

async function login(token?: string) {
	const sessionToken = token ?? (await getNewSessionToken());
	if (settings.storeToken) {
		localStorage.setItem("sessionToken", sessionToken);
	}
}

async function getSessionToken() {
	if (!localStorage.getItem("sessionToken")) {
		await login();
	}
	return localStorage.getItem("sessionToken");
}

async function getDayData(day: number, year: number, fail = false): Promise<string> {
	const sessionToken = await getSessionToken();
	const uri = replaceAll(AOC_INPUT_TEMPLATE, {
		"{year}": String(year),
		"{day}": String(day),
	});
	const result = await fetch(uri, {
		headers: {
			cookie: `session=${sessionToken}`,
		},
	});
	if (result.status === 200) {
		return result.text();
	} else if (result.status !== 404) {
		if (!fail) {
			await login();
			return getDayData(day, year, true);
		} else {
			throw new Error("Did not get a 200 status code requesting data.");
		}
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

function getLatestPuzzleDate(asOf = new Date()) {
	const asUTC = new Date(asOf.getTime() + asOf.getTimezoneOffset() * 60 * 1000);
	const asEST = new Date(asUTC.getTime() - 5 * 60 * 60 * 1000);
	const isDecember = asEST.getMonth() === 11;
	const currentYear = asEST.getFullYear();
	const latestPuzzleYear = isDecember ? currentYear : currentYear - 1;
	const currentDay = asEST.getDate();
	const latestPuzzleDay = isDecember ? Math.min(currentDay, 25) : 25;
	return { day: latestPuzzleDay, year: latestPuzzleYear };
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

	const sessionToken = sessionTokenIndex >= 0 ? args[sessionTokenIndex + 1] : undefined;
	const storeToken = !args.includes("--no-store-token");
	const suck = args.includes("suck");
	const seed = args.includes("seed");
	const pristine = args.includes("--pristine");

	if (!existsSync(templatePath)) {
		templatePath = templatePath + ".dat";
	}
	if (!existsSync(templatePath) && seed) {
		throw new Error(`Could not find template at path: ${origTemplatePath}`);
	}

	Object.assign(settings, {
		sessionToken,
		years,
		storeToken,
		suck,
		seed,
		rootPath,
		templatePath,
		pristine,
	} as Settings);

	if (!settings.storeToken) {
		localStorage.removeItem("sessionToken");
	}
}

async function seed(year: number) {
	for (let i = 0; i < 25; ++i) {
		const day = i + 1;
		const solutionPath = getSolutionPath(day, year);

		if (settings.pristine || !existsSync(solutionPath)) {
			const seedText = replaceAll(await getTemplate(), {
				"{year}": String(year),
				"{day}": String(day),
				"{solution_path}": solutionPath,
				"{data_path}": getDataPath(day, year),
				"{problem_url}": getProblemUrl(day, year),
			});
			await fs.writeFile(solutionPath, seedText, "utf-8");
		}
	}
}

async function run() {
	parseArgs();

	if (settings.suck) {
		for (const year of settings.years) {
			for (let i = 0; i < NUM_DAYS; ++i) {
				const day = i + 1;
				const isDone = await suckDay(day, year);
				if (isDone) {
					console.log(`Finished sucking year ${year} after day: ${day}.`);
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
