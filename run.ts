import * as util from "./util/util";
import path from "path";
import * as LOGUTIL from "./util/log";
import * as TESTUTIL from "./util/test";
import chalk from "chalk";
const { log } = LOGUTIL;

let debug = false;
let help = false;
let noTests = false;
let year: number = 0;
let day: number = 0;

const args = process.argv.slice(2);
for (const arg of args) {
	if (arg.trim() === "--debug" || arg.trim() === "-d") {
		debug = true;
	} else if (arg.trim() === "--help" || arg.trim() === "-h") {
		help = true;
	} else if (arg.trim() === "--no-test" || arg.trim() === "--no-tests" || arg.trim() === "-n") {
		noTests = true;
	} else {
		const num = Number(arg);
		if (Number.isInteger(num)) {
			if (num >= 1 && num <= 25) {
				day = num;
			} else if (num >= 2015 && num < 2100) {
				year = num;
			} else {
				usage();
			}
		} else {
			usage();
		}
	}
}

if ((year === 0 && day !== 0) || (year !== 0 && day === 0)) {
	usage();
}

if (help) {
	usage();
}

LOGUTIL.setDebug(debug);
TESTUTIL.setNoTests(noTests);

if (year === 0 && day === 0) {
	({ year, day } = util.getLatestPuzzleDate());
}
const puzzleFile = path.join(util.getDayRoot(day, year), "index");
log(chalk`\n== Running puzzle {cyan ${year}.${day}}${debug ? " [Debug ON]" : ""} ==\n`);
require(puzzleFile);

function usage() {
	log(`
	Runs your solution for the problem for the given <year, day>. If
	executed without arguments, it will attempt to run the most
	recently-released Advent of Code puzzle.
  
	Usage:
	  ts-node run.ts [<year> <day>]
  
	Arguments:
	  year: a 4-digit number greater than or equal to 2015
	  day: a number between 1 and 25, inclusive
  
	Options:
	  --help, -h: Show this help message.
	  --debug, -d: Print debug/trace messages.
	  --no-tests, -n: Don't run tests.
  
	Examples:
	  ts-node run.ts
	  ts-node run.ts 2018 22
	`);
	process.exit(0);
}
