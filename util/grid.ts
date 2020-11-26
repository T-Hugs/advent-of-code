import * as util from "./util";
import _ from "lodash";
import chalk from "chalk";

export interface GridOptions {
	serialized?: string;
	rows?: number;
	cols?: number;
}

export type GridPos = [row: number, col: number];

const colorOrder = [
	chalk.yellowBright,
	chalk.blueBright,
	chalk.greenBright,
	chalk.blueBright,
	chalk.redBright,
	chalk.cyanBright,
];
export class Grid {
	private numRows: number;
	private numCols: number;
	private grid: string[][] = [];
	private nextColor = 0;
	private sigilStats: { [sigil: string]: { colorIndex: number; count: number } } = {};

	constructor(options: GridOptions) {
		if ((!options.rows || !options.cols) && !options.serialized) {
			throw new Error("Must specify # of rows and cols, or a serialized grid.");
		}
		const splitSerial = options.serialized?.split("\n");
		this.numRows = options.rows || splitSerial!.length;
		this.numCols = options.cols || splitSerial![0].length;

		if (options.serialized) {
			this.setFromSerialized(options.serialized);
		} else {
			this.initBlankGrid();
		}
	}
	public initBlankGrid() {
		this.grid = [];
		for (const i of _.range(this.numRows)) {
			this.grid.push([]);
			for (const j of _.range(this.numCols)) {
				this.grid[i][j] = " ";
			}
		}
	}
	public setFromSerialized(serialized: string, updateDimensions: boolean = true) {
		const serialRows = serialized.split("\n");

		if (updateDimensions) {
			this.numRows = serialRows.length;
			this.numCols = serialRows[0].length;
		}

		this.initBlankGrid();

		for (let i = 0; i < serialRows.length; ++i) {
			for (let j = 0; j < serialRows[0].length; ++j) {
				this.setCell([i, j], serialRows[i][j]);
			}
		}
	}

	private getSigilColor(sigil: string) {
		if (sigil === ".") {
			return chalk.gray;
		} else {
			return colorOrder[this.sigilStats[sigil].colorIndex];
		}
	}

	private ensureSigilRegistered(sigil: string) {
		if (!this.sigilStats[sigil]) {
			this.sigilStats[sigil] = { count: 0, colorIndex: this.nextColor++ % colorOrder.length };
			if (sigil === " ") {
				// don't advance color for spaces
				this.nextColor--;
			}
		}
	}

	public setCell(pos: GridPos, val: string) {
		this.grid[pos[0]][pos[1]] = val;
		this.ensureSigilRegistered(val);
	}

	public getCell(input: GridPos | string | ((cell: Cell) => boolean)) {
		let pos: GridPos | undefined = undefined;
		if (typeof input === "string") {
			for (const cell of this) {
				if (cell.value === input) {
					return cell;
				}
			}
		} else if (typeof input === "function") {
			for (const cell of this) {
				if (input(cell)) {
					return cell;
				}
			}
		} else {
			if (this.grid[input[0]] != undefined && this.grid[input[0]][1] != undefined) {
				return new Cell(this, input, this.getValue(input));
			} else {
				return undefined;
			}
		}
	}

	public getCells(input: GridPos[] | string | ((cell: Cell) => boolean)) {
		const result: Cell[] = [];
		if (typeof input === "string") {
			for (const cell of this) {
				if (cell.value === input) {
					result.push(cell);
				}
			}
			return result;
		} else if (typeof input === "function") {
			for (const cell of this) {
				if (input(cell)) {
					result.push(cell);
				}
			}
			return result;
		} else {
			for (const pos of input) {
				if (this.grid[pos[0]] != undefined && this.grid[pos[0]][1] != undefined) {
					result.push(new Cell(this, pos, this.getValue(pos)));
				}
			}
			return result;
		}
	}

	public getValue(pos: GridPos) {
		return this.grid[pos[0]][pos[1]];
	}

	public toString() {
		let str = "";
		for (let i = 0; i < this.grid.length; ++i) {
			for (let j = 0; j < this.grid[0].length; ++j) {
				str += this.grid[i][j];
			}
			str += "\n";
		}
		return str;
	}

	public log() {
		console.log(`Grid with ${this.grid.length} rows and ${this.grid[0].length} columns.`);
		for (let i = 0; i < this.grid.length; ++i) {
			for (let j = 0; j < this.grid[0].length; ++j) {
				const char = this.grid[i][j];
				process.stdout.write(this.getSigilColor(char)(char));
			}
			process.stdout.write("\n");
		}
		console.log();
	}

	public [Symbol.iterator]() {
		let row = 0;
		let col = 0;
		const savedRows = this.numRows;
		const savedCols = this.numCols;

		return {
			next: (): IteratorResult<Cell, undefined> => {
				if (this.numRows !== savedRows || this.numCols !== savedCols) {
					throw new Error("Grid has changed shape since the last iteration.");
				}
				if (row >= this.numRows) {
					return { done: true, value: undefined };
				}
				const cell = new Cell(this, [row, col], this.getValue([row, col]));
				col++;
				if (col >= this.numCols) {
					col = 0;
					row++;
				}
				return {
					value: cell,
					done: false,
				};
			},
		};
	}
}

export class Cell {
	private grid: Grid;
	private pos: GridPos;
	private val: string;

	constructor(grid: Grid, pos: GridPos, value: string) {
		this.grid = grid;
		this.pos = pos;
		this.val = value;
	}

	public get value() {
		return this.val;
	}

	public north(count = 1) {
		return this.grid.getCell([this.pos[0] - count, this.pos[1]]);
	}

	public east(count = 1) {
		return this.grid.getCell([this.pos[0], this.pos[1] + count]);
	}

	public south(count = 1) {
		return this.grid.getCell([this.pos[0] + count, this.pos[1]]);
	}

	public west(count = 1) {
		return this.grid.getCell([this.pos[0], this.pos[1] - count]);
	}

	public neighbors(includeDiagonals = false) {
		if (includeDiagonals) {
			return [
				this.north(),
				this.north()?.east(),
				this.east(),
				this.south()?.east(),
				this.south(),
				this.south()?.west(),
				this.west(),
				this.north()?.west(),
			];
		} else {
			return [this.north(), this.east(), this.south(), this.west()];
		}
	}

	public toString() {
		return `[${this.pos[0]}, ${this.pos[1]}]: ${this.val}`;
	}
}

if (require.main === module) {
	// run tests if this file is run directly.
	const myGrid = `..X..
@.#.$
.....
  &  
12345`;
	console.log(myGrid);
	const g = new Grid({ serialized: myGrid });
	g.log();
	let count = 0;
	for (const cell of g) {
		if (cell.value === ".") {
			count++;
		}
	}
	console.log(`dot count: ${count} (expect 11)`);
	const cellsThatHaveTwoDotNeighbors = Array.from(g).reduce(
		(p, c) => p + (c.neighbors(true).filter(n => n && n.value === ".").length === 2 ? 1 : 0),
		0
	);
	console.log(`Num cells w/ 2 neighbors that are dots: ${cellsThatHaveTwoDotNeighbors} (expect 8)`);
}
