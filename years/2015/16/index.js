import * as util from "../../../util/util.js";
import * as test from "../../../util/test.js";
import * as LOGUTIL from "../../../util/log.js";
const { log, logGrid, logSolution, trace } = LOGUTIL;
const YEAR = 2015;
const DAY = 16;
const DEBUG = true;
LOGUTIL.setDebug(DEBUG);
// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2015/16/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2015/16/data.txt
// problem url  : https://adventofcode.com/2015/day/16
async function p2015day16_part1(input) {
    return "Not implemented";
}
async function p2015day16_part2(input) {
    return "Not implemented";
}
async function run() {
    const part1tests = [];
    const part2tests = [];
    // Run tests
    test.beginTests();
    test.beginSection();
    for (const testCase of part1tests) {
        test.logTestResult(testCase, String(await p2015day16_part1(testCase.input)));
    }
    test.beginSection();
    for (const testCase of part2tests) {
        test.logTestResult(testCase, String(await p2015day16_part2(testCase.input)));
    }
    test.endTests();
    // Get input and run program
    const input = await util.getInput(DAY, YEAR);
    const part1Solution = String(await p2015day16_part1(input));
    const part2Solution = String(await p2015day16_part2(input));
    logSolution(part1Solution, part2Solution);
}
run()
    .then(() => {
    process.exit();
})
    .catch(error => {
    throw error;
});
