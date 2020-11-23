import * as util from "../../../util/util.js";
import * as LOGUTIL from "../../../util/log.js";
const { log, logGrid, logSolution, trace } = LOGUTIL;
const YEAR = 2018;
const DAY = 1;
const DEBUG = false;
LOGUTIL.setDebug(DEBUG);
// solution path: /Users/trevorsg/t-hugs/aoc-2020/years/2018/01/index.ts
// data path    : /Users/trevorsg/t-hugs/aoc-2020/years/2018/01/data.txt
// problem url  : https://adventofcode.com/2018/day/1
async function p2018day1_part1(input) {
    return "Not implemented";
}
async function p2018day1_part2(input, part1Solution) {
    return "Not implemented";
}
async function run() {
    const input = await util.getInput(DAY, YEAR);
    const part1Solution = String(await p2018day1_part1(input));
    const part2Solution = String(await p2018day1_part2(input, part1Solution));
    logSolution(part1Solution, part2Solution);
}
run()
    .then(() => {
    process.exit();
})
    .catch(error => {
    throw error;
});
