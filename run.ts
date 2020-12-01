import * as util from "./util/util";
import path from "path";

let [year, day] = process.argv.slice(2).map(Number);
if (year == undefined || day == undefined) {
	({year, day} = util.getLatestPuzzleDate());
}
const latestPuzzleFile = path.join(util.getDayRoot(day, year), "index");
require(latestPuzzleFile);
