import * as util from "./util";
import _ from "lodash";
import chalk from "chalk";

export interface GridOptions {
	serialized?: string;
	fillWith?: string;
	rowCount?: number;
	colCount?: number;
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
	private batchUpdatedGrid: Grid | undefined;
	private fillWith: string | undefined;

	constructor(options: GridOptions) {
		if ((!options.rowCount || !options.colCount) && !options.serialized) {
			throw new Error("Must specify # of rows and cols, or a serialized grid.");
		}
		const splitSerial = options.serialized?.split("\n");
		this.numRows = options.rowCount || splitSerial!.length;
		this.numCols = options.colCount || splitSerial![0].length;

		if (options.serialized) {
			this.setFromSerialized(options.serialized);
		} else {
			this.initBlankGrid(options.fillWith);
		}
	}

	public get rowCount() {
		return this.numRows;
	}

	public get colCount() {
		return this.numCols;
	}

	public initBlankGrid(fillWith: string | undefined) {
		this.grid = [];
		for (const i of _.range(this.numRows)) {
			this.grid.push([]);
			for (const j of _.range(this.numCols)) {
				this.grid[i][j] = fillWith ?? " ";
			}
		}
	}
	public setFromSerialized(serialized: string, updateDimensions: boolean = true) {
		const serialRows = serialized.split("\n");

		if (updateDimensions) {
			this.numRows = serialRows.length;
			this.numCols = serialRows[0].length;
		}

		this.initBlankGrid(this.fillWith);

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

	public batchUpdates() {
		if (this.batchUpdatedGrid != undefined) {
			throw new Error("Already batch updating. Must commit those changes first.");
		}
		this.batchUpdatedGrid = new Grid({ serialized: this.toString() });
	}

	public commit() {
		if (this.batchUpdatedGrid == undefined) {
			throw new Error("Have not called batchUpdates().");
		}
		for (const cell of this.batchUpdatedGrid) {
			this.setCell(cell.position, cell.value, true);
		}
		this.batchUpdatedGrid = undefined;
	}

	public setCell(pos: GridPos, val: string, ignoreBatch = false) {
		if (this.batchUpdatedGrid && !ignoreBatch) {
			this.batchUpdatedGrid.setCell(pos, val);
		} else {
			this.grid[pos[0]][pos[1]] = val;
			this.ensureSigilRegistered(val);
		}
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
			if (this.grid[input[0]] != undefined && this.grid[input[0]][input[1]] != undefined) {
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
			if (i < this.grid.length - 1) {
				str += "\n";
			}
		}
		return str;
	}

	public log(printGridInfo: boolean = true) {
		if (printGridInfo) {
			console.log(`Grid with ${this.grid.length} rows and ${this.grid[0].length} columns.`);
		}
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

	public get position() {
		return this.pos;
	}

	public get index() {
		return this.pos[0] * this.grid.colCount + this.pos[1];
	}

	public north(count = 1, moveOption: "wrap" | "stay" | "none" = "none") {
		let newRow = this.pos[0] - count;
		if (moveOption === "wrap") {
			newRow = util.mod(newRow, this.grid.rowCount);
		} else if (moveOption === "stay") {
			newRow = util.clamp(newRow, 0, this.grid.rowCount - 1);
		}
		return this.grid.getCell([newRow, this.pos[1]]);
	}

	public east(count = 1, moveOption: "wrap" | "stay" | "none" = "none") {
		let newCol = this.pos[1] + count;
		if (moveOption === "wrap") {
			newCol = util.mod(newCol, this.grid.rowCount);
		} else if (moveOption === "stay") {
			newCol = util.clamp(newCol, 0, this.grid.rowCount - 1);
		}
		return this.grid.getCell([this.pos[0], newCol]);
	}

	public south(count = 1, moveOption: "wrap" | "stay" | "none" = "none") {
		let newRow = this.pos[0] + count;
		if (moveOption === "wrap") {
			newRow = util.mod(newRow, this.grid.rowCount);
		} else if (moveOption === "stay") {
			newRow = util.clamp(newRow, 0, this.grid.rowCount - 1);
		}
		return this.grid.getCell([newRow, this.pos[1]]);
	}

	public west(count = 1, moveOption: "wrap" | "stay" | "none" = "none") {
		let newCol = this.pos[1] - count;
		if (moveOption === "wrap") {
			newCol = util.mod(newCol, this.grid.rowCount);
		} else if (moveOption === "stay") {
			newCol = util.clamp(newCol, 0, this.grid.rowCount - 1);
		}
		return this.grid.getCell([this.pos[0], newCol]);
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
			].filter(n => n != undefined) as Cell[];
		} else {
			return [this.north(), this.east(), this.south(), this.west()].filter(n => n != undefined) as Cell[];
		}
	}

	public isNorthEdge() {
		return this.north() == undefined;
	}

	public isEastEdge() {
		return this.east() == undefined;
	}

	public isSouthEdge() {
		return this.south() == undefined;
	}

	public isWestEdge() {
		return this.west() == undefined;
	}

	public isCorner() {
		return (
			(this.isNorthEdge() && this.isEastEdge()) ||
			(this.isNorthEdge() && this.isWestEdge()) ||
			(this.isSouthEdge() && this.isEastEdge()) ||
			(this.isSouthEdge() && this.isWestEdge())
		);
	}

	public setValue(val: string) {
		this.grid.setCell(this.pos, val);
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
	const cellsThatHaveTwoDotNeighbors = Array.from(g).filter(
		c => c.neighbors(true).filter(n => n.value === ".").length === 2
	).length;
	console.log(`Num cells w/ 2 neighbors that are dots: ${cellsThatHaveTwoDotNeighbors} (expect 8)`);
}
