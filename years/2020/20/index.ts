import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { Grid, GridPos } from "../../../util/grid";

const YEAR = 2020;
const DAY = 20;

// solution path: /Users/trevorsg/t-hugs/advent-of-code/years/2020/20/index.ts
// data path    : /Users/trevorsg/t-hugs/advent-of-code/years/2020/20/data.txt
// problem url  : https://adventofcode.com/2020/day/20

function rotate(grid: Grid, times: number) {
	let rotated = grid;
	for (let i = 0; i < times; ++i) {
		const next = new Grid({ rowCount: grid.rowCount, colCount: grid.rowCount });
		for (const cell of rotated) {
			const pos = cell.position;
			const newPos: GridPos = [pos[1], grid.rowCount - pos[0] - 1];
			next.setCell(newPos, cell.value);
		}
		rotated = next;
	}
	return rotated;
}
function flipY(grid: Grid) {
	const flipped = new Grid({ rowCount: grid.rowCount, colCount: grid.rowCount });
	for (const cell of grid) {
		const pos = cell.position;
		flipped.setCell([grid.rowCount - pos[0] - 1, pos[1]], cell.value);
	}
	return flipped;
}
function flipX(grid: Grid) {
	const flipped = new Grid({ rowCount: grid.rowCount, colCount: grid.rowCount });
	for (const cell of grid) {
		const pos = cell.position;
		flipped.setCell([pos[0], grid.rowCount - pos[1] - 1], cell.value);
	}
	return flipped;
}

function getNeighbors(grid: Grid, allGrids: [Grid, number][]) {
	const topEdge = grid
		.getCells(c => c.position[0] === 0)
		.map(c => c.value)
		.join("");
	const bottomEdge = grid
		.getCells(c => c.position[0] === grid.rowCount - 1)
		.map(c => c.value)
		.join("");
	const rightEdge = grid
		.getCells(c => c.position[1] === grid.rowCount - 1)
		.map(c => c.value)
		.join("");
	const leftEdge = grid
		.getCells(c => c.position[1] === 0)
		.map(c => c.value)
		.join("");

	const neighbors: Grid[] = [];
	for (const [otherGrid, num] of allGrids) {
		if (otherGrid === grid) {
			continue;
		}

		const t = otherGrid
			.getCells(c => c.position[0] === 0)
			.map(c => c.value)
			.join("");
		const b = otherGrid
			.getCells(c => c.position[0] === grid.rowCount - 1)
			.map(c => c.value)
			.join("");
		const r = otherGrid
			.getCells(c => c.position[1] === grid.rowCount - 1)
			.map(c => c.value)
			.join("");
		const l = otherGrid
			.getCells(c => c.position[1] === 0)
			.map(c => c.value)
			.join("");
		const tf = flipX(otherGrid)
			.getCells(c => c.position[0] === 0)
			.map(c => c.value)
			.join("");
		const bf = flipX(otherGrid)
			.getCells(c => c.position[0] === grid.rowCount - 1)
			.map(c => c.value)
			.join("");
		const rf = flipY(otherGrid)
			.getCells(c => c.position[1] === grid.rowCount - 1)
			.map(c => c.value)
			.join("");
		const lf = flipY(otherGrid)
			.getCells(c => c.position[1] === 0)
			.map(c => c.value)
			.join("");
		const edges = [t, b, r, l, tf, bf, rf, lf];
		for (const edge of edges) {
			if (edge === topEdge || edge === bottomEdge || edge === rightEdge || edge === leftEdge) {
				neighbors.push(otherGrid);
			}
		}
	}
	return neighbors;
}

async function p2020day20_part1(input: string) {
	const groups = input.split("\n\n");
	const grids: [Grid, number][] = [];
	for (const group of groups) {
		const num = Number(/Tile (\d+):/.exec(group)![1]);
		const lines = group.split("\n");
		lines.shift();
		grids.push([new Grid({ serialized: lines.join("\n") }), num]);
	}

	let prod = 1;
	for (const [grid, num] of grids) {
		const neighbors = getNeighbors(grid, grids);
		if (neighbors.length === 2) {
			prod *= Number(num);
		}
	}
	return prod;
}

function getNeighborsAndPos(grid: Grid, allGrids: [Grid, number][]) {
	const topEdge = grid
		.getCells(c => c.position[0] === 0)
		.map(c => c.value)
		.join("");
	const bottomEdge = grid
		.getCells(c => c.position[0] === grid.rowCount - 1)
		.map(c => c.value)
		.join("");
	const rightEdge = grid
		.getCells(c => c.position[1] === grid.rowCount - 1)
		.map(c => c.value)
		.join("");
	const leftEdge = grid
		.getCells(c => c.position[1] === 0)
		.map(c => c.value)
		.join("");

	const neighbors: Obj<Grid> = {};
	for (const [otherGrid, num] of allGrids) {
		if (otherGrid === grid) {
			continue;
		}

		const t = otherGrid
			.getCells(c => c.position[0] === 0)
			.map(c => c.value)
			.join("");
		const b = otherGrid
			.getCells(c => c.position[0] === grid.rowCount - 1)
			.map(c => c.value)
			.join("");
		const r = otherGrid
			.getCells(c => c.position[1] === grid.rowCount - 1)
			.map(c => c.value)
			.join("");
		const l = otherGrid
			.getCells(c => c.position[1] === 0)
			.map(c => c.value)
			.join("");
		const tf = flipX(otherGrid)
			.getCells(c => c.position[0] === 0)
			.map(c => c.value)
			.join("");
		const bf = flipX(otherGrid)
			.getCells(c => c.position[0] === grid.rowCount - 1)
			.map(c => c.value)
			.join("");
		const rf = flipY(otherGrid)
			.getCells(c => c.position[1] === grid.rowCount - 1)
			.map(c => c.value)
			.join("");
		const lf = flipY(otherGrid)
			.getCells(c => c.position[1] === 0)
			.map(c => c.value)
			.join("");
		const edges = [t, b, r, l, tf, bf, rf, lf];
		for (const edge of edges) {
			if (edge === topEdge) {
				neighbors["U"] = otherGrid;
			}
			if (edge === bottomEdge) {
				neighbors["D"] = otherGrid;
			}
			if (edge === leftEdge) {
				neighbors["L"] = otherGrid;
			}
			if (edge === rightEdge) {
				neighbors["R"] = otherGrid;
			}
		}
	}
	return neighbors;
}

async function p2020day20_part2(input: string) {
	const seaMonster = `                  # 
#    ##    ##    ###
 #  #  #  #  #  #   `;

	const groups = input.split("\n\n");
	const grids: [Grid, number][] = [];
	for (const group of groups) {
		const num = Number(/Tile (\d+):/.exec(group)![1]);
		const lines = group.split("\n");
		lines.shift();
		grids.push([new Grid({ serialized: lines.join("\n") }), num]);
	}
	const sideLen = Math.floor(Math.sqrt(grids.length));
	const tiles: Grid[][] = [];
	let tl: Grid | null = null;
	for (const [grid, num] of grids) {
		const neighbors = getNeighborsAndPos(grid, grids);
		if (Object.keys(neighbors).length === 2) {
			tl = grid;
		}
	}
	if (!tl) {
		throw new Error("No top left found.");
	}
	_.remove(grids, g => g[0] === tl);
	const tlNeighbors = getNeighborsAndPos(tl, grids);
	if (tlNeighbors["U"] && tlNeighbors["L"]) {
		tl = rotate(tl, 2);
	} else if (tlNeighbors["U"] && tlNeighbors["R"]) {
		tl = rotate(tl, 1);
	} else if (tlNeighbors["D"] && tlNeighbors["L"]) {
		tl = rotate(tl, 3);
	}

	for (let i = 0; i < sideLen; ++i) {
		tiles.push([]);
	}

	tiles[0].push(tl);
	function getRowAndCol(pos: number) {
		return [Math.floor(pos / sideLen), pos % sideLen];
	}
	for (let i = 0; i < sideLen * sideLen; ++i) {
		const [row, col] = getRowAndCol(i);
		const grid = tiles[row][col];
		const neighbors = getNeighborsAndPos(grid, grids);
		let [nrow, ncol] = getRowAndCol(i + 1);
		if (tiles[nrow] && tiles[nrow][ncol] == undefined && neighbors["R"]) {
			const rightEdge = grid
				.getCells(c => c.position[1] === grid.rowCount - 1)
				.map(c => c.value)
				.join("");
			let neighborLeft = "";
			let neighbor = neighbors["R"];
			let salt = true;
			while (neighborLeft !== rightEdge) {
				salt = !salt;
				if (salt) {
					neighbor = flipY(neighbor);
					neighbor = rotate(neighbor, 1);
				} else {
					neighbor = flipY(neighbor);
				}
				neighborLeft = neighbor
					.getCells(c => c.position[1] === 0)
					.map(c => c.value)
					.join("");
			}

			tiles[nrow][ncol] = neighbor;
			_.remove(grids, g => g[0] === neighbors["R"]);
		}
		[nrow, ncol] = getRowAndCol(i + sideLen);
		if (tiles[nrow] && tiles[nrow][ncol] == undefined && neighbors["D"]) {
			const bottomEdge = grid
				.getCells(c => c.position[0] === grid.rowCount - 1)
				.map(c => c.value)
				.join("");
			let neighborUp = "";
			let neighbor = neighbors["D"];
			let salt = true;
			while (neighborUp !== bottomEdge) {
				salt = !salt;
				if (salt) {
					neighbor = flipX(neighbor);
					neighbor = rotate(neighbor, 1);
				} else {
					neighbor = flipX(neighbor);
				}
				neighborUp = neighbor
					.getCells(c => c.position[0] === 0)
					.map(c => c.value)
					.join("");
			}

			tiles[nrow][ncol] = neighbor;
			_.remove(grids, g => g[0] === neighbors["D"]);
		}
	}
	let totalGrid = new Grid({ rowCount: 8 * sideLen, colCount: 8 * sideLen });
	for (let i = 0; i < tiles.length; ++i) {
		for (let j = 0; j < tiles[i].length; ++j) {
			const tile = tiles[i][j];
			const cells = tile.getCells(
				c => !c.isEastEdge() && !c.isNorthEdge() && !c.isSouthEdge() && !c.isWestEdge()
			);
			for (const cell of cells) {
				totalGrid.setCell([i * 8 + cell.position[0] - 1, j * 8 + cell.position[1] - 1], cell.value);
			}
		}
	}
	let salt = 0;
	while (true) {
		let smCount = 0;
		outer: for (const cell of totalGrid) {
			if (cell.position[0] + 3 >= totalGrid.rowCount || cell.position[1] + 20 >= totalGrid.colCount) {
				continue;
			}
			const subgrid = totalGrid.copyGrid({
				srcStartRow: cell.position[0],
				srcStartCol: cell.position[1],
				srcRowCount: 3,
				srcColCount: 20,
			});
			const str = subgrid.toString();
			for (let i = 0; i < seaMonster.length; ++i) {
				const smChar = seaMonster[i];
				const subgridChar = str[i];
				if (smChar === "#" && subgridChar !== "#") {
					continue outer;
				}
			}
			smCount++;
		}
		if (smCount !== 0) {
			return totalGrid.getCells("#").length - smCount * 15;
		} else {
			if (salt % 3 === 0) {
				totalGrid = flipX(totalGrid);
				totalGrid = flipY(totalGrid);
				totalGrid = rotate(totalGrid, 1);
			} else if (salt % 3 === 1) {
				totalGrid = flipX(totalGrid);
			} else {
				totalGrid = flipY(totalGrid);
			}
			salt += 1;
		}
	}
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `Tile 2311:
..##.#..#.
##..#.....
#...##..#.
####.#...#
##.##.###.
##...#.###
.#.#.#..##
..#....#..
###...#.#.
..###..###

Tile 1951:
#.##...##.
#.####...#
.....#..##
#...######
.##.#....#
.###.#####
###.##.##.
.###....#.
..#.#..#.#
#...##.#..

Tile 1171:
####...##.
#..##.#..#
##.#..#.#.
.###.####.
..###.####
.##....##.
.#...####.
#.##.####.
####..#...
.....##...

Tile 1427:
###.##.#..
.#..#.##..
.#.##.#..#
#.#.#.##.#
....#...##
...##..##.
...#.#####
.#.####.#.
..#..###.#
..##.#..#.

Tile 1489:
##.#.#....
..##...#..
.##..##...
..#...#...
#####...#.
#..#.#.#.#
...#.#.#..
##.#...##.
..##.##.##
###.##.#..

Tile 2473:
#....####.
#..#.##...
#.##..#...
######.#.#
.#...#.#.#
.#########
.###.#..#.
########.#
##...##.#.
..###.#.#.

Tile 2971:
..#.#....#
#...###...
#.#.###...
##.##..#..
.#####..##
.#..####.#
#..#.#..#.
..####.###
..#.#.###.
...#.#.#.#

Tile 2729:
...#.#.#.#
####.#....
..#.#.....
....#..#.#
.##..##.#.
.#.####...
####.#.#..
##.####...
##..#.##..
#.##...##.

Tile 3079:
#.#.#####.
.#..######
..#.......
######....
####.#..#.
.#...#.##.
#.#####.##
..#.###...
..#.......
..#.###...`,
			expected: `20899048083289`,
		},
	];
	const part2tests: TestCase[] = [
		{
			input: `Tile 2311:
..##.#..#.
##..#.....
#...##..#.
####.#...#
##.##.###.
##...#.###
.#.#.#..##
..#....#..
###...#.#.
..###..###

Tile 1951:
#.##...##.
#.####...#
.....#..##
#...######
.##.#....#
.###.#####
###.##.##.
.###....#.
..#.#..#.#
#...##.#..

Tile 1171:
####...##.
#..##.#..#
##.#..#.#.
.###.####.
..###.####
.##....##.
.#...####.
#.##.####.
####..#...
.....##...

Tile 1427:
###.##.#..
.#..#.##..
.#.##.#..#
#.#.#.##.#
....#...##
...##..##.
...#.#####
.#.####.#.
..#..###.#
..##.#..#.

Tile 1489:
##.#.#....
..##...#..
.##..##...
..#...#...
#####...#.
#..#.#.#.#
...#.#.#..
##.#...##.
..##.##.##
###.##.#..

Tile 2473:
#....####.
#..#.##...
#.##..#...
######.#.#
.#...#.#.#
.#########
.###.#..#.
########.#
##...##.#.
..###.#.#.

Tile 2971:
..#.#....#
#...###...
#.#.###...
##.##..#..
.#####..##
.#..####.#
#..#.#..#.
..####.###
..#.#.###.
...#.#.#.#

Tile 2729:
...#.#.#.#
####.#....
..#.#.....
....#..#.#
.##..##.#.
.#.####...
####.#.#..
##.####...
##..#.##..
#.##...##.

Tile 3079:
#.#.#####.
.#..######
..#.......
######....
####.#..#.
.#...#.##.
#.#####.##
..#.###...
..#.......
..#.###...`,
			expected: `273`,
		},
	];

	// Run tests
	test.beginTests();
	test.beginSection();
	for (const testCase of part1tests) {
		test.logTestResult(testCase, String(await p2020day20_part1(testCase.input)));
	}
	test.beginSection();
	for (const testCase of part2tests) {
		test.logTestResult(testCase, String(await p2020day20_part2(testCase.input)));
	}
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = "42"; // String(await p2020day20_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2020day20_part2(input));
	const part2After = performance.now();

	logSolution(20, 2020, part1Solution, part2Solution);

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
