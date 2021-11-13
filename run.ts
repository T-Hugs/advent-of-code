import * as util from "./util/util";
import path from "path";
import * as LOGUTIL from "./util/log";
import chalk from "chalk";
const { log } = LOGUTIL;

const argStr = process.argv.slice(2).join(" ");
if (/(\bdebug\b)|((\W|^)-d\b)/.test(argStr)) {
	LOGUTIL.setDebug(true);
}

if (/(\bhelp\b)|((\W|^)-h\b)/.test(argStr)) {
	usage();
}


let [year, day] = process.argv.slice(2).map(Number);

if (year === undefined && day === undefined) {
	({ year, day } = util.getLatestPuzzleDate());
}

if (Number.isInteger(year) && year >= 2015 && Number.isInteger(day) && day >= 1 && day <= 25) {
	const puzzleFile = path.join(util.getDayRoot(day, year), "index");
	log(chalk`\n== Running puzzle {cyan ${year}.${day}} ==\n`);
	require(puzzleFile);
} else {
	usage();
}

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
	  --help: Show this help message.
  
	Examples:
	  ts-node run.ts
	  ts-node run.ts 2018 22
	`);
	process.exit(0);
}
