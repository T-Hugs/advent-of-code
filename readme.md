# Advent of Code
This repository contains my solutions for [Advent of Code](https://adventofcode.com) problems. All solutions are implemented in TypeScript and JavaScript, runnable with modern Node.js.

** IF YOU DO NOT WANT SPOILERS, AVOID LOOKING IN THE `years` FOLDER! **

## Automatic workspace
This repo contains a tool to automatically jump-start your workspace, including:

* Automatically download problem data
* Generate a file for each problem from a template

It also includes utilities for Logging and other common tasks (if you're using Node.js).

## Usage
Prerequisites: install [Node.js](https://nodejs.org) 14 (LTS) or later.

**Quick-start instructions**

1. Create an account at https://adventofcode.com using GitHub OAuth.
2. Fork this repo
3. Clone the forked repository
4. `cd` into the repository and run `npm install`
5. Run `npx ts-node init.ts suck seed --pristine`. If you run this again, REMOVE `--pristine`! See below for details.
6. An instance of Chromium will open to a GitHub* login page. Log in with your credentials. Chromium will then close.
7. Command line output will show progress for downloading the data for each problem in the current** year of AoC.

Once this is done, the folder `years/<current_year>` will contain a folder for each day, each of which includes your personalized data file and a solution file ready-to-run. Go ahead, run `node years/2019/01` and see that it prints out "Not implemented" for Part 1 and Part 2 of that problem. That's your job! Open up `years/2019/01/index.ts` and get to work!

To run the TypeScript solutions, use `npx ts-node years/YEAR/DAY`, replacing YEAR and DAY with the values for the solution you want to run. For example `npx ts-node years/2015/01`. If you want, you can install ts-node globally, which will allow to you remove npx from the invocation: `npm install --global ts-node` and then `ts-node years/2015/01`.

**A bit more in-depth**

The script `init.js` has two main functions: `suck` and `seed`.

### Suck
Suck is designed to automatically download problem data from adventofcode.com. When `suck` is passed to `init.js`, the script will open an instance of Chromium to a GitHub login page. After you log in, Chromium gets redirected back to adventofcode.com, where a cookie is set containing your session token. `init.js` reads this cookie and saves your session token to disk in a file called `.scratch`.

* Suck will **not** try to download data for problems that are not released yet.
* Suck will **not** try to download data for problems that have already been downloaded, *unless* `--pristine` is passed.
* Suck does **not** do anything with your session token, except as described in this readme.

#### Options
`--year <year | "all">`: Specify the year of problems to suck in. If `all` is specified in place of the year, suck in data for all available years, starting in 2015. Defaults to the current year**.

`--path <path>`: Specify the root path for writing data. Must be a fully qualified absolute path. Within this directory, directories for each year, then for each problem day will be created. Data is written to `data.txt` within the day directory.

`--token`: If you know how to get your AoC session token manually, you can specify it here. This will also be written to `.scratch` so you don't have to specify it every time.

`--no-store-token`: Do not store the AoC session token on disk (you will have to log in or specify it at the command line every time).

`--pristine`: Request new data from adventofcode.com, even if the data file already exists.

### Seed
Seed is designed to automatically create your working files. The default template (`solutionTemplate.ts.dat`) sets up imports, your solution functions, data import, and logging your solution.

#### Options
`--year <year | ">`: Specify the year of problems to seed solution files. If `all` is specified in place of the year, seed for all available years, starting in 2015. Defaults to the current year**.

`--path <path>`: Specify the root path for writing data. Must be a fully qualified absolute path. Within this directory, directories for each year, then for each problem day will be created. Solution files are named `index` with a file extension found in your template file name (e.g. `solutionTemplate.rb.dat` will result in solution files named `index.rb`).

`--template`: Specify the path to your template file. For an example, see `solutionTemplate.ts.dat`.

`--compare-with`: This is used in case you need to update your template and want to re-generate any un-touched files. Specify the path of the template file to use as a basis for comparison to decide if we can re-generate the file without using `--pristine`.

`--pristine`: **DANGER!!** This will overwrite any existing solution files! Use with caution! You have been warned!

\* More auth providers coming soon. This step is necessary to get a session token that allows the script to download your personalized problem data.

** The current year will resolve as last year until new problems are available. For instance, if you run this in November 2020, it will suck in problems from 2019. If you run in December 2020, you will start getting the problems from 2020.

## Advent of Code Solutions
The default template sets up each solution file to automatically read the problem's data file and call 2 functions: one for Part 1 and one for Part 2. The result of calling the solution function is printed to the console on a green background.

The solution function is asynchronous by default. Even if the solution is completely synchronous, everything will still work.

### Test Cases
There is a small framework included for running test cases. The `run()` function includes two variables, `part1tests` and `part2tests`, each of which is an array of `TestCase`. A `TestCase` is a simple object with two properties: `input` and `expected`. If using VSCode, you can use the `test` snippet to insert a new test case at your cursor. Any tests added to the test case arrays will be run *before* the main problem's input so you don't have to worry about a solution that takes a long time to run before seeing output. Test cases are printed out in an easy-to-read format (screenshot below).

You can pass `true` to `beginTests()` and `beginSection()` to suppress the output of all tests or tests in a particular section, respectively.

![test output screenshot](./.assets/test-output-screenshot.png)