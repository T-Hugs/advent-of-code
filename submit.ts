import { LocalStorage } from "node-localstorage";
import { formatTime, getAppRoot, wait } from "./util/util";
import path from "path";
import { log, SolutionObject, solutionLogKey } from "./util/log";
import fetch from "cross-fetch";
import chalk from "chalk";
import _ from "lodash";
import { getSessionToken } from "./getToken";
import { UA_STRING } from "./config";

const appRoot = getAppRoot();
const localStorage = new LocalStorage(path.join(appRoot, ".scratch"));

/* Potential responses from an answer submission */
/*That's not the right answer. If you're stuck, make sure you're using the full input data; there are also some general tips on the about page, or you can ask for hints on the subreddit. Please wait one minute before trying again. (You guessed 12345.) [Return to Day 6]*/
/*That's not the right answer; your answer is too high. If you're stuck, make sure you're using the full input data; there are also some general tips on the about page, or you can ask for hints on the subreddit. Please wait one minute before trying again. (You guessed 78986.) [Return to Day 2]*/
/*That's not the right answer; your answer is too low. If you're stuck, make sure you're using the full input data; there are also some general tips on the about page, or you can ask for hints on the subreddit. Please wait one minute before trying again. (You guessed 78986.) [Return to Day 2]*/
/*You gave an answer too recently; you have to wait after submitting an answer before trying again. You	have 55s left to wait. <a href="/2016/day/6">[Return to Day 6]</a>*/

function getMsUntilActiveCooldownExpiration(solutionLog: SolutionObject[]) {
	const expirations = solutionLog.map(solution => {
		const previousSubmissions = solution.submissions;
		if (previousSubmissions && previousSubmissions.length > 0) {
			const mostRecentSubmission = _.maxBy(previousSubmissions, s => new Date(s.date).getTime())!;
			if (mostRecentSubmission.result === "timeout" && mostRecentSubmission.cooldownFinished != undefined) {
				return new Date(mostRecentSubmission.cooldownFinished).getTime() - new Date().getTime();
			}
		}
		return 0;
	});

	return Math.max(...expirations, 0);
}

async function submit() {
	const solutionLogStr = localStorage.getItem(solutionLogKey);

	if (solutionLogStr == undefined) {
		log("Could not find solution log!");
		process.exit(1);
	}

	let solutionLog: SolutionObject[];
	try {
		solutionLog = JSON.parse(solutionLogStr);
	} catch {
		log("Could not parse solution log!");
		process.exit(1);
	}

	let mostRecent: SolutionObject | undefined = undefined;
	let i = 0;
	for (const solution of solutionLog) {
		const dateComputed = new Date(solution.dateComputed);
		if (!mostRecent) {
			mostRecent = solution;
		} else if (new Date(mostRecent.dateComputed).getTime() < dateComputed.getTime()) {
			mostRecent = solution;
		}
		i++;
	}

	if (!mostRecent) {
		log("Could not find any solutions in the log!");
		process.exit(1);
	}

	const msTillCooldown = getMsUntilActiveCooldownExpiration(solutionLog);
	if (msTillCooldown > 0) {
		log(
			`Waiting ${formatTime(msTillCooldown)} until cooldown expiration before automatically submitting. Ctrl+C to abort.`
		);
	}
	await wait(msTillCooldown);

	let part: string;
	let answer: string;
	if (mostRecent.part2 && mostRecent.part2 !== "Not implemented") {
		part = "2";
		answer = mostRecent.part2;
	} else if (mostRecent.part1 && mostRecent.part1 !== "Not implemented") {
		part = "1";
		answer = mostRecent.part1;
	} else {
		log("No solution to submit!");
		process.exit(1);
	}

	const postData = `level=${part}&answer=${answer}`;

	const sessionToken = await getSessionToken();
	const uri = `https://adventofcode.com/${mostRecent.problem.year}/day/${mostRecent.problem.day}/answer`;

	log(
		`Submitting: Year: ${mostRecent.problem.year}, Day: ${mostRecent.problem.day}, Part: ${part}, Answer: ${answer}`
	);
	const result = await fetch(uri, {
		headers: {
			cookie: `session=${sessionToken}`,
			accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
			"content-type": "application/x-www-form-urlencoded",
			"user-agent": UA_STRING
		},
		method: "post",
		body: postData,
	});
	if (!mostRecent.submissions) {
		mostRecent.submissions = [];
	}
	if (result.status === 200) {
		const responseText = await result.text();
		if (responseText.includes("That's not the right answer")) {
			if (responseText.includes("your answer is too high.")) {
				mostRecent.submissions.push({ date: new Date().toJSON(), result: "high" });
				log("Wrong! (too high)");
			} else if (responseText.includes("your answer is too low.")) {
				mostRecent.submissions.push({ date: new Date().toJSON(), result: "low" });
				log("Wrong! (too low)");
			} else {
				mostRecent.submissions.push({ date: new Date().toJSON(), result: "incorrect" });
				log("Wrong answer!");
			}
		} else if (responseText.includes("You gave an answer too recently")) {
			const waitTime = /You have (.*?) left to wait/.exec(responseText)![1];
			let cooldownFinished: string | undefined = undefined;
			const waitTimeMatch = /^(\d+)s$/.exec(waitTime);
			if (waitTimeMatch) {
				cooldownFinished = new Date(new Date().getTime() + Number(waitTimeMatch[1]) * 1000).toJSON();
			}
			mostRecent.submissions.push({
				date: new Date().toJSON(),
				result: "timeout",
				cooldownFinished: cooldownFinished,
			});
			log(
				`Cooldown in progress (${waitTime} remaining). Re-submitting now will auto wait for cooldown to expire.`
			);
		} else if (responseText.includes("That's the right answer!")) {
			mostRecent.submissions.push({date: new Date().toJSON(), result: "correct"});
			log(
				chalk.greenBright("Correct! One ") + chalk.yellowBright("GOLD") + chalk.greenBright(" star for you!")
			);
		} else {
			mostRecent.submissions.push({date: new Date().toJSON(), result: "unknown"});
			log("Unrecognized response! See below.\n");
			log(responseText);
		}
		localStorage.setItem(solutionLogKey, JSON.stringify(solutionLog, null, 4));
	}
}

submit().then(() => {
	process.exit(0);
});
