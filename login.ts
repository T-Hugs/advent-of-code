//import inquirer from "inquirer";
import playwright from "playwright-chromium";
import { log, SolutionObject, solutionLogKey } from "./util/log";
import chalk from "chalk";
import { LocalStorage } from "node-localstorage";
import path from "path";
import { getAppRoot } from "./util/util";
const appRoot = getAppRoot();

const localStorage = new LocalStorage(path.join(appRoot, ".scratch"));

const providers = ["GitHub", "Google", "Twitter", "Reddit"] as const;

async function getTokenInteractive(provider: string) {
	const browser = await playwright.chromium.launch({ headless: false });
	const context = await browser.newContext();
	const page = await context.newPage();
	await page.goto(`https://adventofcode.com/auth/${provider.toLowerCase()}`);
	await page.waitForNavigation({ url: /^https:\/\/adventofcode\.com\/$/, timeout: 0 });
	const cookies = await context.cookies();
	const sessionCookie = cookies.find(c => c.name === "session" && c.domain.includes("adventofcode.com"));
	if (!sessionCookie) {
		throw new Error("Could not acquire session cookie.");
	}
	browser.close();
	return sessionCookie.value.trim();
}

async function run() {
	const inquirer = await import("inquirer");
	log(`
  Authenticate to Advent of Code to use submit and data download functions.
  Note: your token will be stored in plain text in a file at ./.scratch/sessionToken.
  Do not commit this file to version control! Security notice: the session token
  obtained from authentication allows this framework to make requests to Advent
  of Code as you! You should only continue with these steps if you trust this
  software. As the author, I can only offer you a promise that it does nothing with
  your credentials other than what is described in the documentation, but I
  encourage you to read through the code anyway. Cheers!
  `);
	const mode = await inquirer.prompt([
		{
			name: "mode",
			message: "How would you like to log in?",
			type: "list",
			choices: ["Interactive", "Manual"],
		},
	]);
	let token: string | undefined = undefined;
	if (mode.mode === "Interactive") {
		const provider = await inquirer.prompt([
			{
				name: "provider",
				message: "Which auth provider would you like to use?",
				type: "list",
				choices: providers,
			},
		]);
		token = await getTokenInteractive(provider.provider);
	} else if (mode.mode === "Manual") {
		log(`Follow these instructions to get your auth token and paste it in the prompt below.
  1) Open https://adventofcode.com/auth/login in a web browser.
  2) Open your browser's developer tools (usually F12) and switch to the network tab.
  3) On the Advent of Code login page, click on the link for the auth provider of your choice.
  4) Follow the steps to complete authentication. This should result in a logged-in Advent of Code page.
  5) Switch back to the developer tools and look for a network request starting with "callback?" - click on it.
  6) Under Response headers, find the "set-cookie" header and look for a string starting with "session=".
  7) Paste everything after "session=" until the semicolon into the prompt below.
	`);
		token = (
			await inquirer.prompt([
				{
					name: "token",
					message: "Paste your session token here",
					type: "input",
				},
			])
		).token.trim();
	}
	if (token) {
		localStorage.setItem("sessionToken", token);
	}
	log(chalk`{greenBright Done.}`);
}

run();
