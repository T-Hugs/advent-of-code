import _, { flip } from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk, { black } from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { readBuilderProgram } from "typescript";

const YEAR = 2020;
const DAY = 24;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2020/24/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2020/24/data.txt
// problem url  : https://adventofcode.com/2020/day/24

async function p2020day24_part1(input: string) {
	const lines = input.split("\n");
	const tiles: string[][] = [];
	for (const line of lines) {
		const dirs: string[] = [];
		for (let i = 0; i < line.length; ++i) {
			if (line[i] === "e") {
				dirs.push("e");
				continue;
			} else if (line[i] === "n" && line[i + 1] === "e") {
				dirs.push("ne");
				i++;
				continue;
			} else if (line[i] === "n" && line[i + 1] === "w") {
				dirs.push("nw");
				i++;
				continue;
			} else if (line[i] === "w") {
				dirs.push("w");
				continue;
			} else if (line[i] === "s" && line[i + 1] === "e") {
				dirs.push("se");
				i++;
				continue;
			} else if (line[i] === "s" && line[i + 1] === "w") {
				dirs.push("sw");
				i++;
				continue;
			} else {
				throw new Error("bad");
			}
		}
		tiles.push(dirs);
	}

	const flipped: Obj<boolean> = {};
	const ref = [0, 0];
	for (const tile of tiles) {
		let _ref = [...ref];
		for (const m of tile) {
			if (m === "w") {
				_ref[0] -= 1;
			} else if (m === "e") {
				_ref[0] += 1;
			} else if (m === "ne") {
				_ref[0] += 0.5;
				_ref[1] -= 1;
			} else if (m === "nw") {
				_ref[0] -= 0.5;
				_ref[1] -= 1;
			} else if (m === "se") {
				_ref[0] += 0.5;
				_ref[1] += 1;
			} else if (m === "sw") {
				_ref[0] -= 0.5;
				_ref[1] += 1;
			}
		}
		const xtile = flipped[`${_ref[0]},${_ref[1]}`] ?? false;
		flipped[`${_ref[0]},${_ref[1]}`] = !xtile;
	}
	return Object.values(flipped).filter(v => v === true).length;
}

async function p2020day24_part2(input: string) {
	const lines = input.split("\n");
	const tiles: string[][] = [];
	for (const line of lines) {
		const dirs: string[] = [];
		for (let i = 0; i < line.length; ++i) {
			if (line[i] === "e") {
				dirs.push("e");
				continue;
			} else if (line[i] === "n" && line[i + 1] === "e") {
				dirs.push("ne");
				i++;
				continue;
			} else if (line[i] === "n" && line[i + 1] === "w") {
				dirs.push("nw");
				i++;
				continue;
			} else if (line[i] === "w") {
				dirs.push("w");
				continue;
			} else if (line[i] === "s" && line[i + 1] === "e") {
				dirs.push("se");
				i++;
				continue;
			} else if (line[i] === "s" && line[i + 1] === "w") {
				dirs.push("sw");
				i++;
				continue;
			} else {
				throw new Error("bad");
			}
		}
		tiles.push(dirs);
	}

	let flipped: Obj<boolean> = {};
	const ref = [0, 0];
	for (const tile of tiles) {
		let _ref = [...ref];
		for (const m of tile) {
			if (m === "w") {
				_ref[0] -= 1;
			} else if (m === "e") {
				_ref[0] += 1;
			} else if (m === "ne") {
				_ref[0] += 0.5;
				_ref[1] -= 1;
			} else if (m === "nw") {
				_ref[0] -= 0.5;
				_ref[1] -= 1;
			} else if (m === "se") {
				_ref[0] += 0.5;
				_ref[1] += 1;
			} else if (m === "sw") {
				_ref[0] -= 0.5;
				_ref[1] += 1;
			}
		}
		const xtile = flipped[`${_ref[0]},${_ref[1]}`] ?? false;
		flipped[`${_ref[0]},${_ref[1]}`] = !xtile;
	}

	for (let i = 0; i < 100; ++i) {
		const nextGrid = { ...flipped };

		for (let m = -100; m < 100; ++m) {
			for (let n = -100; n < 100; ++n) {
				const loc = [n];
				if (n % 2 === 0) {
					loc.unshift(m);
				} else {
					loc.unshift(m + 0.5);
				}
				const [x, y] = loc;
				const w = [x - 1, y];
				const e = [x + 1, y];
				const sw = [x - 0.5, y + 1];
				const se = [x + 0.5, y + 1];
				const ne = [x + 0.5, y - 1];
				const nw = [x - 0.5, y - 1];

				const colors = [w, e, sw, se, ne, nw].map(d => flipped[`${d[0]},${d[1]}`]);
				const blacks = colors.filter(c => c === true);
				const key = `${loc[0]},${loc[1]}`;
				if (flipped[key]) {
					if (blacks.length === 0 || blacks.length > 2) {
						nextGrid[key] = false;
					} else {
						nextGrid[key] = true;
					}
				} else {
					if (blacks.length === 2) {
						nextGrid[key] = true;
					} else {
						nextGrid[key] = false;
					}
				}
			}
		}

		flipped = nextGrid;
	}

	return Object.values(flipped).filter(v => v === true).length;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `sesenwnenenewseeswwswswwnenewsewsw
neeenesenwnwwswnenewnwwsewnenwseswesw
seswneswswsenwwnwse
nwnwneseeswswnenewneswwnewseswneseene
swweswneswnenwsewnwneneseenw
eesenwseswswnenwswnwnwsewwnwsene
sewnenenenesenwsewnenwwwse
wenwwweseeeweswwwnwwe
wsweesenenewnwwnwsenewsenwwsesesenwne
neeswseenwwswnwswswnw
nenwswwsewswnenenewsenwsenwnesesenew
enewnwewneswsewnwswenweswnenwsenwsw
sweneswneswneneenwnewenewwneswswnese
swwesenesewenwneswnwwneseswwne
enesenwswwswneneswsenwnewswseenwsese
wnwnesenesenenwwnenwsewesewsesesew
nenewswnwewswnenesenwnesewesw
eneswnwswnwsenenwnwnwwseeswneewsenese
neswnwewnwnwseenwseesewsenwsweewe
wseweeenwnesenwwwswnew`,
			expected: `10`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `sesenwnenenewseeswwswswwnenewsewsw
neeenesenwnwwswnenewnwwsewnenwseswesw
seswneswswsenwwnwse
nwnwneseeswswnenewneswwnewseswneseene
swweswneswnenwsewnwneneseenw
eesenwseswswnenwswnwnwsewwnwsene
sewnenenenesenwsewnenwwwse
wenwwweseeeweswwwnwwe
wsweesenenewnwwnwsenewsenwwsesesenwne
neeswseenwwswnwswswnw
nenwswwsewswnenenewsenwsenwnesesenew
enewnwewneswsewnwswenweswnenwsenwsw
sweneswneswneneenwnewenewwneswswnese
swwesenesewenwneswnwwneseswwne
enesenwswwswneneswsenwnewswseenwsese
wnwnesenesenenwwnenwsewesewsesesew
nenewswnwewswnenesenwnesewesw
eneswnwswnwsenenwnwnwwseeswneewsenese
neswnwewnwnwseenwseesewsenwsweewe
wseweeenwnesenwwwswnew`,
			expected: `2208`,
		},
	];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2020day24_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2020day24_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2020day24_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2020day24_part2(input));
	const part2After = performance.now();

	logSolution(24, 2020, part1Solution, part2Solution);

	log(chalk.gray("--- Performance ---"));
	log(chalk.gray(`Part 1: ${util.formatTime(part1After - part1Before)}`));
	log(chalk.gray(`Part 2: ${util.formatTime(part2After - part2Before)}`));
	log();
}

run()
	.then(() => {
		process.exit();
	})
	.catch(error => {
		throw error;
	});
