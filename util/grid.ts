import * as util from "./util";
import _ from "lodash";
import chalk from "chalk";

/**
 * Options for initializing a Grid
 */
export interface GridOptions {
	/**
	 * Initialize a grid from a string. Each grid row must be
	 * separated by a new line character and have the same
	 * number of characters per row.
	 */
	serialized?: string;

	/**
	 * Optional (defaults to space). If initializing a blank
	 * grid, fill each cell with this character. Must be a
	 * single-character string.
	 */
	fillWith?: string;

	/**
	 * Number of rows for this new blank grid.
	 */
	rowCount?: number;

	/**
	 * Number of columns for this new blank grid.
	 */
	colCount?: number;
}

/**
 * Settings for copying a grid
 */
export interface CopyGridOptions {
	/**
	 * Row in the source grid to start copying from. Defaults to 0.
	 */
	srcStartRow?: number;

	/**
	 * Column in the source grid to start copying from. Defaults to 0.
	 */
	srcStartCol?: number;

	/**
	 * Row in the source grid to finish copying from. Defaults to the row
	 * at srcStartRow + srcRowCount.
	 */
	srcEndRow?: number;

	/**
	 * Column in the source grid to finish copying from. Defaults to the
	 * column at srcStartCol + srcColCount.
	 */
	srcEndCol?: number;

	/**
	 * Number of source rows to copy. Defaults to all remaining rows.
	 */
	srcRowCount?: number;

	/**
	 * Number of source columns to copy. Defaults to all remaining columns.
	 */
	srcColCount?: number;

	/**
	 * Number of rows in the destination grid. Defaults to the number of
	 * copied rows from the source grid.
	 */
	destRowCount?: number;

	/**
	 * Number of columns in the destination grid. Defaults to the number
	 * of copied rows from the source grid.
	 */
	destColCount?: number;

	/**
	 * The row index to begin copying data to in the destination grid.
	 * Defaults to 0.
	 */
	destStartRow?: number;

	/**
	 * The column index to begin copying data to in the destination grid.
	 * Defaults to 0.
	 */
	destStartCol?: number;

	/**
	 * If false, leave the destination grid blank. Defaults to true.
	 */
	copyValues?: boolean;

	/**
	 * If the new grid is larger than the source grid, initialize those
	 * new cells with this value.
	 */
	fillNewCellsWith?: string;
}

/**
 * Tuple describing a (row, column) position on a grid.
 */
export type GridPos = [row: number, col: number];

/**
 * Options for moving from cell-to-cell
 * - "wrap": If you go off the edge of the grid, wrap over
 *           to the other edge on the same axis.
 * - "stay": If you go off the edge, just return the cell
 *           on that edge.
 * - "none": If you go off the edge, return undefined.
 */
export type MoveOption = "wrap" | "stay" | "none";

const colorOrder = [
	chalk.yellowBright,
	chalk.blueBright,
	chalk.greenBright,
	chalk.blueBright,
	chalk.redBright,
	chalk.cyanBright,
];

/**
 * Character-based Grid data structure. Grids have finite size.
 * Each cell is expected to be a single printable character.
 */
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

	/**
	 * Number of rows in this grid.
	 */
	public get rowCount() {
		return this.numRows;
	}

	/**
	 * Number of columns in this grid.
	 */
	public get colCount() {
		return this.numCols;
	}

	/**
	 * Clears all of the grid's data and fills it with the
	 * given character.
	 * @param fillWith Character to fill the grid with. Defaults to a space.
	 */
	public initBlankGrid(fillWith: string | undefined) {
		this.grid = [];
		for (const i of _.range(this.numRows)) {
			this.grid.push([]);
			for (const j of _.range(this.numCols)) {
				this.grid[i][j] = fillWith ?? " ";
			}
		}
	}

	/**
	 * Clears all of the grid's data and fills it with the given serialized grid.
	 * Defaults to updating the grid's dimensions to the given serialized grid's dimensions.
	 * @param serialized
	 * @param updateDimensions
	 */
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

	/**
	 * Start queueing all subsequent updates to grid cell values. Do not
	 * update the grid until commit() is called. This is useful when you need
	 * to edit cells based on their surroundings, but not commit any changes
	 * until each cell has been visited (e.g. game of life).
	 */
	public batchUpdates() {
		if (this.batchUpdatedGrid != undefined) {
			throw new Error("Already batch updating. Must commit those changes first.");
		}
		this.batchUpdatedGrid = new Grid({ serialized: this.toString() });
	}

	/**
	 * Commit all queued changes from batchUpdates(). Further batched updates will
	 * require another call to batchUpdates().
	 */
	public commit() {
		if (this.batchUpdatedGrid == undefined) {
			throw new Error("Have not called batchUpdates().");
		}
		for (const cell of this.batchUpdatedGrid) {
			this.setCell(cell.position, cell.value, true);
		}
		this.batchUpdatedGrid = undefined;
	}

	/**
	 * Returns a grid AS IF all current batched updates were applied.
	 * Any mutations made to this grid WILL be committed next time
	 * commit() is called! If you need a copy, use copyGrid().
	 */
	public peekBatchedUpdates() {
		if (this.batchUpdatedGrid == undefined) {
			throw new Error("Have not called batchUpdates().");
		}
		return this.batchUpdatedGrid;
	}

	/**
	 * Discard all batched updates without committing to the grid.
	 */
	public rollback() {
		this.batchUpdatedGrid = undefined;
	}

	/**
	 * Set the value of a cell.
	 * @param pos The position of the cell to set the value of
	 * @param val A single character string value of the cell
	 * @param ignoreBatch If true, bypass the batched updates
	 * queue and set the value directly on the grid.
	 */
	public setCell(pos: GridPos, val: string, ignoreBatch = false) {
		if (this.batchUpdatedGrid && !ignoreBatch) {
			this.batchUpdatedGrid.setCell(pos, val);
		} else {
			this.grid[pos[0]][pos[1]] = val;
			this.ensureSigilRegistered(val);
		}
	}

	/**
	 * Get a single cell based on a criterion. If multiple cells match, get the first.
	 * @param input Can be one of:
	 *   GridPos: identifies a single cell based on its row and column
	 *    string: the value of the cell
	 *  Function: a predicate that is called on each cell in order.
	 */
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

	/**
	 * Get an array of cells based on a criterion.
	 * @param input Can be one of:
	 *   GridPos[]: List of grid positions of cells to return
	 *      string: the value of the cell.
	 *    Function: a predicate that is called on each cell in order.
	 */
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

	/**
	 * Copy a grid to a new grid. Defaults to making an identical copy.
	 * @param options See CopyGridOptions for details.
	 */
	public copyGrid(options?: CopyGridOptions) {
		const _options = options ?? {};
		const srcStartRow = _options.srcStartRow ?? 0;
		const srcStartCol = _options.srcStartCol ?? 0;
		const srcEndRow = _options.srcEndRow ?? this.rowCount - 1; // srcStartRow + srcRowCount - 1;
		const srcEndCol = _options.srcEndCol ?? this.colCount - 1; // srcStartCol + srcColCount - 1;
		const srcRowCount = _options.srcRowCount ?? srcEndRow - srcStartRow + 1;
		const srcColCount = _options.srcColCount ?? srcEndCol - srcStartCol + 1;
		const destRowCount = _options.destRowCount ?? srcRowCount;
		const destColCount = _options.destColCount ?? srcColCount;
		const destStartRow = _options.destStartRow ?? 0;
		const destStartCol = _options.destStartCol ?? 0;

		const subgrid = new Grid({
			rowCount: destRowCount,
			colCount: destColCount,
			fillWith: options?.fillNewCellsWith,
		});
		if (_options.copyValues !== false) {
			for (let i = srcStartRow; i < srcStartRow + srcRowCount; ++i) {
				for (let j = srcStartCol; j < srcStartCol + srcColCount; ++j) {
					subgrid.setCell(
						[i - srcStartRow + destStartRow, j - srcStartCol + destStartCol],
						this.getValue([i, j])
					);
				}
			}
		}
		return subgrid;
	}

	/**
	 * Gets the value of a single cell
	 * @param pos The position of the cell to get the value from
	 */
	public getValue(pos: GridPos) {
		return this.grid[pos[0]][pos[1]];
	}

	/**
	 * Serializes a grid to a flat string, rows separated by
	 * newline characters.
	 */
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

	/**
	 * Logs a grid to the console with colored grid cell values
	 * @param printGridInfo If true, prints a line describing the
	 * number of rows and columns in the grid.
	 */
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

	/**
	 * Iterate cell-by-cell in the grid, starting with the top-left cell, moving
	 * through the whole row before moving down to the next row.
	 */
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

/**
 * Describes a Cell within a Grid. Please note the encapsulation relationship:
 * Cell contains a Grid member, not the other way around! Methods on the Cell
 * class are all convenience methods that call back to the parent grid. A Cell
 * is immutable! Its value is stored on the parent grid.
 */
export class Cell {
	private grid: Grid;
	private pos: GridPos;

	constructor(grid: Grid, pos: GridPos, value: string) {
		this.grid = grid;
		this.pos = pos;
	}

	/**
	 * Gets the value of the cell.
	 */
	public get value() {
		return this.grid.getValue(this.pos);
	}

	/**
	 * Gets the position of the cell.
	 */
	public get position() {
		return this.pos;
	}

	/**
	 * Gets the overall flat index of this cell. For example,
	 * the cell on the 2nd row in the first column of a grid with
	 * 10 columns will have an index of 10 (0-based).
	 */
	public get index() {
		return this.pos[0] * this.grid.colCount + this.pos[1];
	}

	/**
	 * Return the cell found `count` cells above of this cell.
	 * @param count Number of cells to move
	 * @param moveOption How to handle hitting the edge. @See MoveOption.
	 */
	public north(count = 1, moveOption: MoveOption = "none") {
		let newRow = this.pos[0] - count;
		if (moveOption === "wrap") {
			newRow = util.mod(newRow, this.grid.rowCount);
		} else if (moveOption === "stay") {
			newRow = util.clamp(newRow, 0, this.grid.rowCount - 1);
		}
		return this.grid.getCell([newRow, this.pos[1]]);
	}

	/**
	 * Return the cell found `count` cells right of this cell.
	 * @param count Number of cells to move
	 * @param moveOption How to handle hitting the edge. @See MoveOption.
	 */
	public east(count = 1, moveOption: MoveOption = "none") {
		let newCol = this.pos[1] + count;
		if (moveOption === "wrap") {
			newCol = util.mod(newCol, this.grid.colCount);
		} else if (moveOption === "stay") {
			newCol = util.clamp(newCol, 0, this.grid.colCount - 1);
		}
		return this.grid.getCell([this.pos[0], newCol]);
	}

	/**
	 * Return the cell found `count` cells below of this cell.
	 * @param count Number of cells to move
	 * @param moveOption How to handle hitting the edge. @See MoveOption.
	 */
	public south(count = 1, moveOption: MoveOption = "none") {
		let newRow = this.pos[0] + count;
		if (moveOption === "wrap") {
			newRow = util.mod(newRow, this.grid.rowCount);
		} else if (moveOption === "stay") {
			newRow = util.clamp(newRow, 0, this.grid.rowCount - 1);
		}
		return this.grid.getCell([newRow, this.pos[1]]);
	}

	/**
	 * Return the cell found `count` cells left of this cell.
	 * @param count Number of cells to move
	 * @param moveOption How to handle hitting the edge. @See MoveOption.
	 */
	public west(count = 1, moveOption: MoveOption = "none") {
		let newCol = this.pos[1] - count;
		if (moveOption === "wrap") {
			newCol = util.mod(newCol, this.grid.colCount);
		} else if (moveOption === "stay") {
			newCol = util.clamp(newCol, 0, this.grid.colCount - 1);
		}
		return this.grid.getCell([this.pos[0], newCol]);
	}

	/**
	 * Get an array of this cell's neighbors. Internal cells have four
	 * neighbors, while edge cells have three, and corner cells have two.
	 * @param includeDiagonals Also include the 4 diagonal neighbors.
	 */
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

	/**
	 * Returns true if this cell is on the top row of the grid.
	 */
	public isNorthEdge() {
		return this.north() == undefined;
	}

	/**
	 * Returns true if this cell is on the rightmost column of the grid.
	 */
	public isEastEdge() {
		return this.east() == undefined;
	}

	/**
	 * Returns true if this cell is last row of the grid.
	 */
	public isSouthEdge() {
		return this.south() == undefined;
	}

	/**
	 * Returns true if this cell is on the leftmost column of the grid.
	 */
	public isWestEdge() {
		return this.west() == undefined;
	}

	/**
	 * Returns true if the cell is in a corner of the grid.
	 */
	public isCorner() {
		return (
			(this.isNorthEdge() && this.isEastEdge()) ||
			(this.isNorthEdge() && this.isWestEdge()) ||
			(this.isSouthEdge() && this.isEastEdge()) ||
			(this.isSouthEdge() && this.isWestEdge())
		);
	}

	/**
	 * Set the value of this cell (calls to parent grid)
	 * @param val Single-character string value to set
	 */
	public setValue(val: string) {
		this.grid.setCell(this.pos, val);
	}

	/**
	 * Returns a string representation of this cell's position and value.
	 */
	public toString() {
		return `[${this.pos[0]}, ${this.pos[1]}]: ${this.value}`;
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

	// Copy to new grid with 2 row/column thick border of empty cells.
	const borderSize = 2;
	const borderGrid = g.copyGrid({
		fillNewCellsWith: "#",
		destRowCount: g.rowCount + 2 * borderSize,
		destColCount: g.colCount + 2 * borderSize,
		destStartRow: borderSize,
		destStartCol: borderSize,
	});
	borderGrid.log();

	// Copy half of the grid to new grid, a few different ways
	const topHalf1 = g.copyGrid({
		srcRowCount: Math.floor(g.rowCount / 2),
	});
	topHalf1.log();

	const topHalf2 = g.copyGrid({
		srcEndRow: Math.floor(g.rowCount / 2),
	});
	topHalf2.log();

	const botHalf1 = g.copyGrid({
		srcStartRow: Math.floor(g.rowCount / 2),
	});
	botHalf1.log();
}
