import chalk from "chalk";
let DEBUG = false;
export function setDebug(debug) {
    DEBUG = debug;
}
export function log(...params) {
    for (const param of params) {
        if (typeof param === "object") {
            console.dir(param);
        }
        else {
            process.stdout.write(param.toString() + " ");
        }
    }
    console.log();
}
export function logGrid(grid) {
    let toPrint = "";
    for (const row of grid) {
        for (const cell of row) {
            toPrint += cell;
        }
        toPrint += "\n";
    }
    console.log(toPrint);
}
export function trace(...params) {
    if (DEBUG) {
        for (const param of params) {
            if (typeof param === "object") {
                process.stdout.write(chalk.gray("<"));
                console.dir(param);
                process.stdout.write(chalk.gray(">"));
            }
            else {
                process.stdout.write(chalk.gray(param.toString() + " "));
            }
        }
        console.log();
    }
}
export function logSolution(part1, part2) {
    const part1Text = part1 === "Not implemented" ? chalk.black.bgYellowBright(` ${part1} `) : chalk.black.bgGreenBright(` ${part1} `);
    const part2Text = part2 === "Not implemented" ? chalk.black.bgYellowBright(` ${part2} `) : chalk.black.bgGreenBright(` ${part2} `);
    console.log("\n== ANSWER ==\n" +
        chalk.blueBright.bold("Part 1: ") +
        part1Text +
        chalk.blueBright.bold("\nPart 2: ") +
        part2Text +
        "\n");
}
