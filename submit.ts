import { LocalStorage } from "node-localstorage";
import { getAppRoot } from "./util/util";
import path from "path";
import { SolutionObject, solutionLogKey } from "./util/log";
import fetch from "node-fetch";
import playwright from "playwright-chromium";
import chalk from "chalk";

const appRoot = getAppRoot();
const localStorage = new LocalStorage(path.join(appRoot, ".scratch"));

/*That's not the right answer. If you're stuck, make sure you're using the full input data; there are also some general tips on the about page, or you can ask for hints on the subreddit. Please wait one minute before trying again. (You guessed 12345.) [Return to Day 6]*/
/*That's not the right answer; your answer is too high. If you're stuck, make sure you're using the full input data; there are also some general tips on the about page, or you can ask for hints on the subreddit. Please wait one minute before trying again. (You guessed 78986.) [Return to Day 2]*/
/*That's not the right answer; your answer is too low. If you're stuck, make sure you're using the full input data; there are also some general tips on the about page, or you can ask for hints on the subreddit. Please wait one minute before trying again. (You guessed 78986.) [Return to Day 2]*/
/*You gave an answer too recently; you have to wait after submitting an answer before trying again. You	have 55s left to wait. <a href="/2016/day/6">[Return to Day 6]</a>*/

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
	localStorage.setItem("sessionToken", sessionToken);
}

async function getSessionToken() {
	if (!localStorage.getItem("sessionToken")) {
		await login();
	}
	return localStorage.getItem("sessionToken");
}

async function submit() {
	const solutionLogStr = localStorage.getItem(solutionLogKey);

	if (solutionLogStr == undefined) {
		console.log("Could not find solution log!");
		process.exit(1);
	}
	try {
		const solutionLog: SolutionObject[] = JSON.parse(solutionLogStr);
		let mostRecent: SolutionObject | undefined = undefined;
		for (const solution of solutionLog) {
			const dateComputed = new Date(solution.dateComputed);
			if (!mostRecent) {
				mostRecent = solution;
			} else if (new Date(mostRecent.dateComputed).getTime() < dateComputed.getTime()) {
				mostRecent = solution;
			}
		}

		if (!mostRecent) {
			console.log("Could not find any solutions in the log!");
			process.exit(1);
		}

		let postData: string;
		let part = "1";
		let answer = mostRecent.part1;
		if (mostRecent.part2 && mostRecent.part2 !== "Not implemented") {
			postData = `level=2&answer=${mostRecent.part2}`;
			part = "2";
			answer = mostRecent.part2;
		} else if (mostRecent.part1 && mostRecent.part1 !== "Not implemented") {
			postData = `level=1&answer=${mostRecent.part1}`;
		} else {
			console.log("No solution to submit!");
			process.exit(1);
		}

		const sessionToken = await getSessionToken();
		const uri = `https://adventofcode.com/${mostRecent.problem.year}/day/${mostRecent.problem.day}/answer`;

		console.log(`Submitting: Year: ${mostRecent.problem.year}, Day: ${mostRecent.problem.day}, Part: ${part}, Answer: ${answer}`);
		const result = await fetch(uri, {
			headers: {
				cookie: `session=${sessionToken}`,
				accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
				"content-type": "application/x-www-form-urlencoded",
			},
			method: "post",
			body: postData,
		});
		if (result.status === 200) {
			const responseText = await result.text();
			if (responseText.includes("That's not the right answer")) {
				if (responseText.includes("your answer is too high.")) {
					console.log("Wrong! (too high)");
					process.exit(0);
				} else if (responseText.includes("your answer is too low.")) {
					console.log("Wrong! (too low)");
					process.exit(0);
				} else {
					console.log("Wrong answer!");
					process.exit(0);
				}
			} else if (responseText.includes("You gave an answer too recently")) {
				const waitTime = /You have (.*?) left to wait/.exec(responseText)![1];
				console.log(`Cooldown in progress (${waitTime} remaining)`);
				process.exit(0);
			} else if (responseText.includes("That's the right answer!")) {
				console.log(chalk.greenBright("Correct! One ") + chalk.yellowBright("GOLD") + chalk.greenBright(" star for you!"));
				process.exit(0);
			}
		}
	} catch {
		console.log("Could not parse solution log!");
		process.exit(1);
	}
}

submit().then(() => {
	process.exit(0);
});
