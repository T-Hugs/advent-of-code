import _, { reduce } from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import aStar from "a-star";

const YEAR = 2021;
const DAY = 19;

// solution path: C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\19\index.ts
// data path    : C:\Users\trgau.NORTHAMERICA\dev\t-hugs\advent-of-code\years\2021\19\data.txt
// problem url  : https://adventofcode.com/2021/day/19

type XYZ = [number, number, number];

type Mat33 = [[number, number, number], [number, number, number], [number, number, number]];

type Transformation = {
	from: string;
	to: string;
	x: [mapsToDimension: string, scale: number, bias: number];
	y: [mapsToDimension: string, scale: number, bias: number];
	z: [mapsToDimension: string, scale: number, bias: number];
};

let OVERLAP_THRESHOLD = 12;
async function p2021day19_part1(input: string, ...params: any[]) {
	if (params[0]) {
		OVERLAP_THRESHOLD = params[0];
	}
	const groups = input.split("\n\n");
	const reports: Obj<XYZ[]> = {};
	let scannerNo = 0;
	for (const group of groups) {
		const lines = group.split("\n").slice(1);
		reports[scannerNo] = [];
		for (const line of lines) {
			const coords = line.split(",").map(Number);
			reports[scannerNo].push(coords as XYZ);
		}
		scannerNo++;
	}

	const scannerTransformations: Transformation[] = [];

	// scanner => beacon x => every other beacon y => relative coordinates of y from x
	const relativeBeacons: Obj<XYZ[][]> = {};
	for (const [scanner, beacons] of Object.entries(reports)) {
		relativeBeacons[scanner] = [];
		for (let i = 0; i < beacons.length; ++i) {
			const hostBeacon: XYZ[] = [];
			for (let j = 0; j < beacons.length; ++j) {
				if (i === j) {
					continue;
				}
				const relativeCoords = [
					beacons[j][0] - beacons[i][0],
					beacons[j][1] - beacons[i][1],
					beacons[j][2] - beacons[i][2],
				] as XYZ;
				hostBeacon.push(relativeCoords);
			}
			relativeBeacons[scanner].push(hostBeacon);
		}
	}

	const distanceToOtherBeacons: Obj<number[][]> = {};
	for (const [scanner, beacons] of Object.entries(reports)) {
		distanceToOtherBeacons[scanner] = [];
		for (let i = 0; i < beacons.length; ++i) {
			const distanceToOthers: number[] = [];
			for (let j = 0; j < beacons.length; ++j) {
				distanceToOthers.push(distance(beacons[i], beacons[j]));
			}
			distanceToOtherBeacons[scanner].push(distanceToOthers);
		}
	}

	const scannerNames = Object.keys(relativeBeacons);
	const sameBeaconsLog: string[][] = [];

	const scannerBeacons: Map<string, string[]> = new Map();
	for (const [scanner, beacons] of Object.entries(reports)) {
		for (let i = 0; i < beacons.length; ++i) {
			scannerBeacons.set(`${scanner},${i}`, []);
		}
	}

	const equivalentBeacons: Set<string> = new Set();
	const overlappingScanners: Set<string> = new Set();

	for (let i = 0; i < scannerNames.length; ++i) {
		const hostBeacons = reports[scannerNames[i]];
		const sameBeaconsOnScanner: string[] = [];
		sameBeaconsLog.push(sameBeaconsOnScanner);

		for (let j = 0; j < hostBeacons.length; ++j) {
			// try to find hostBeacon in other scanners
			for (let k = 0; k < scannerNames.length; ++k) {
				if (i === k) {
					continue;
				}
				const otherHosts = reports[scannerNames[k]];
				for (let l = 0; l < otherHosts.length; ++l) {
					const sameBeacon = isSameBeaconByDistance(
						distanceToOtherBeacons[scannerNames[i]][j],
						distanceToOtherBeacons[scannerNames[k]][l]
					);
					if (sameBeacon) {
						//log(`Scanner ${i} beacon ${j} is same as Scanner ${k} beacon ${l}`);
						log(`${i},${j} = ${k},${l}`);
						// sameBeaconsOnScanner.push(`${k},${l}`);
						// break;
						const ij = `${i},${j}`;
						const kl = `${k},${l}`;

						scannerBeacons.get(ij)?.push(kl);
						scannerBeacons.get(kl)?.push(ij);

						equivalentBeacons.add(`${ij}=${kl}`);
						overlappingScanners.add(`${i}-${k}`);

						// if (scannerBeacons.get(ij)?.length ?? -1 > 0) {
						// 	scannerBeacons.get(ij)?.push(kl);
						// } else if (scannerBeacons.get(kl)?.length ?? -1 > 0) {
						// 	scannerBeacons.get(kl)?.push(ij);
						// } else {
						// 	scannerBeacons.get(ij)?.push(kl);
						// }

						// if (scannerBeacons.has(ij)) {
						// 	scannerBeacons.get(ij)?.push(kl);
						// } else if (scannerBeacons.has(kl)) {
						// 	scannerBeacons.get(kl)?.push(ij);
						// }
					}
				}
			}
		}
	}

	const reducedOverlappingScanners: string[] = [];
	for (const s of overlappingScanners) {
		const [a, b] = s.split("-");
		if (!reducedOverlappingScanners.includes(`${a}-${b}`) && !reducedOverlappingScanners.includes(`${b}-${a}`)) {
			if (a.localeCompare(b) < 0) {
				reducedOverlappingScanners.push(`${a}-${b}`);
			} else {
				reducedOverlappingScanners.push(`${b}-${a}`);
			}
		}
	}

	reducedOverlappingScanners.sort((a, b) => a.split("-").map(Number)[0] - b.split("-").map(Number)[0]);

	const scannerOffsets: Obj<Obj<[number, XYZ]>> = {};

	for (const s of reducedOverlappingScanners) {
		const [os1, os2] = s.split("-");
		const pool = [...equivalentBeacons].filter(eb => {
			const [l, r] = eb.split("=");
			const [s1, _] = l.split(",");
			const [s2, __] = r.split(",");
			return s1 === os1 && s2 === os2;
		});
		log(pool);
		const [l1, r1] = pool[0].split("=");
		const [l2, r2] = pool[2].split("=");
		const [firstS1, firstB1] = l1.split(",");
		const [firstS2, firstB2] = r1.split(",");
		const [secondS1, secondB1] = l2.split(",");
		const [secondS2, secondB2] = r2.split(",");

		const s1b1 = reports[firstS1][Number(firstB1)];
		const s1b2 = reports[secondS1][Number(secondB1)];
		const s2b1 = reports[firstS2][Number(firstB2)];
		const s2b2 = reports[secondS2][Number(secondB2)];
		log(
			`${firstS1} . ${firstB1} . ${firstS2} . ${firstB2} . ${secondS1} . ${secondB1} . ${secondS2} . ${secondB2} . `
		);
		log(`${s1b1} . ${s1b2} . ${s2b1} . ${s2b2}`);

		const b1Rotations = getAllRotations(s2b1);
		const b2Rotations = getAllRotations(s2b2);

		for (let i = 0; i < b1Rotations.length; ++i) {
			const b1Rotated = b1Rotations[i];
			const b2Rotated = b2Rotations[i];

			const b1Diff = [b1Rotated[0] - s1b1[0], b1Rotated[1] - s1b1[1], b1Rotated[2] - s1b1[2]];
			const b2Diff = [b2Rotated[0] - s1b2[0], b2Rotated[1] - s1b2[1], b2Rotated[2] - s1b2[2]];

			if (b1Diff[0] === b2Diff[0] && b1Diff[1] === b2Diff[1] && b1Diff[2] === b2Diff[2]) {
				log(`${firstS1} <=> ${firstS2} (ri: ${i}). Offsets: ${b1Diff}`);
				// if (!scannerOffsets[firstS1]) {
				// 	log("This is a big problem.");
				// }
				if (!scannerOffsets[firstS2]) {
					scannerOffsets[firstS2] = {};
				}
				if (!scannerOffsets[firstS1]) {
					scannerOffsets[firstS1] = {};
				}
				// may need to flip the signs here
				scannerOffsets[firstS2][firstS1] = [-i, [b1Diff[0], b1Diff[1], b1Diff[2]]];
				scannerOffsets[firstS1][firstS2] = [i, [-b1Diff[0], -b1Diff[1], -b1Diff[2]]];
			}
		}
	}

	const scannerZeroOffsets: Obj<[number[], XYZ]> = { "0": [[0], [0, 0, 0]] };

	// is it overkill to use astar to find the path back to scanner 0? Nahh...
	for (const scannerName of scannerNames) {
		if (scannerZeroOffsets[scannerName]) {
			continue;
		}
		const path = aStar({
			distance: (a, b) => 1,
			heuristic: a => 1,
			isEnd: n => n === 0,
			start: Number(scannerName),
			neighbor: n => Object.keys(scannerOffsets[n]).map(Number),
		}).path;

		let zeroOffset: XYZ = [0, 0, 0];
		const zeroRotations: number[] = [];
		for (let i = 0; i < path.length - 1; ++i) {
			const [relevantRotation, relevantOffset] = scannerOffsets[String(path[i])][String(path[i + 1])];
			zeroOffset[0] += relevantOffset[0];
			zeroOffset[1] += relevantOffset[1];
			zeroOffset[2] += relevantOffset[2];
			if (relevantRotation < 0) {
				zeroRotations.push(rotationInverses[Math.abs(relevantRotation)]);
			} else {
				zeroRotations.push(relevantRotation);
			}
		}
		scannerZeroOffsets[scannerName] = [zeroRotations, zeroOffset];
	}

	log([...reducedOverlappingScanners]);

	for (const k of scannerBeacons.keys()) {
		if (scannerBeacons.get(k)?.length === 0) {
			scannerBeacons.delete(k);
		}
	}
	return scannerBeacons.size;

	// for (let i = 0; i < scannerNames.length; ++i) {
	// 	const hostBeacons = relativeBeacons[scannerNames[i]];
	// 	const sameBeacons: string[] = [];
	// 	sameBeaconsLog.push(sameBeacons);

	// 	for (let j = 0; j < hostBeacons.length; ++j) {
	// 		// try to find hostBeacon in other scanners
	// 		for (let k = 0; k < scannerNames.length; ++k) {
	// 			if (i === k) {
	// 				continue;
	// 			}
	// 			const otherHosts = relativeBeacons[scannerNames[k]];
	// 			for (let l = 0; l < otherHosts.length; ++l) {
	// 				const sameBeacon = isSameBeacon(hostBeacons[j], otherHosts[l]);
	// 				if (sameBeacon) {
	// 					sameBeacons.push(`${k},${l}`);
	// 					break;
	// 				}
	// 			}
	// 		}
	// 	}
	// }

	// log(sameBeaconsLog);
}

const rotationMatrixes: Mat33[] = [
	[
		[1, 0, 0],
		[0, 1, 0],
		[0, 0, 1],
	],
	[
		[1, 0, 0],
		[0, 0, -1],
		[0, 1, 0],
	],
	[
		[1, 0, 0],
		[0, -1, 0],
		[0, 0, -1],
	],
	[
		[1, 0, 0],
		[0, 0, 1],
		[0, -1, 0],
	],
	[
		[0, -1, 0],
		[1, 0, 0],
		[0, 0, 1],
	],
	[
		[0, 0, 1],
		[1, 0, 0],
		[0, 1, 0],
	],
	[
		[0, 1, 0],
		[1, 0, 0],
		[0, 0, -1],
	],
	[
		[0, 0, -1],
		[1, 0, 0],
		[0, -1, 0],
	],
	[
		[-1, 0, 0],
		[0, -1, 0],
		[0, 0, 1],
	],
	[
		[-1, 0, 0],
		[0, 0, -1],
		[0, -1, 0],
	],
	[
		[-1, 0, 0],
		[0, 1, 0],
		[0, 0, -1],
	],
	[
		[-1, 0, 0],
		[0, 0, 1],
		[0, 1, 1],
	],
	[
		[0, 1, 0],
		[-1, 0, 0],
		[0, 0, 1],
	],
	[
		[0, 0, 1],
		[-1, 0, 0],
		[0, -1, 0],
	],
	[
		[0, -1, 0],
		[-1, 0, 0],
		[0, 0, -1],
	],
	[
		[0, 0, -1],
		[-1, 0, 0],
		[0, 1, 0],
	],
	[
		[0, 0, -1],
		[0, 1, 0],
		[1, 0, 0],
	],
	[
		[0, 1, 0],
		[0, 0, 1],
		[1, 0, 0],
	],
	[
		[0, 0, 1],
		[0, -1, 0],
		[1, 0, 0],
	],
	[
		[0, -1, 0],
		[0, 0, -1],
		[1, 0, 0],
	],
	[
		[0, 0, -1],
		[0, -1, 0],
		[-1, 0, 0],
	],
	[
		[0, -1, 0],
		[0, 0, 1],
		[-1, 0, 0],
	],
	[
		[0, 0, 1],
		[0, 1, 0],
		[-1, 0, 0],
	],
	[
		[0, 1, 0],
		[0, 0, -1],
		[-1, 0, 0],
	],
];

const rotationInverses: Obj<number> = {
	0: 0,
	1: 3,
	2: 2,
	3: 1,
	4: 12,
	5: 17,
	6: 6,
	7: 23,
	8: 8,
	9: 9,
	10: 10,
	12: 4,
	13: 19,
	14: 14,
	15: 21,
	16: 22,
	17: 5,
	18: 18,
	19: 13,
	20: 20,
	21: 15,
	22: 16,
	23: 7,
};

function getInverseRotation(mat: Mat33) {
	for (let i = 0; i < rotationMatrixes.length; ++i) {
		if (_.isEqual(rotationMatrixes[i], mat)) {
			return rotationMatrixes[rotationInverses[i]];
		}
	}
}

function getAllRotations(vec: XYZ) {
	const rotations: XYZ[] = [];
	for (const m of rotationMatrixes) {
		rotations.push(rotatePoint(vec, m));
	}
	return rotations;
}

function rotatePoint(point: XYZ, rotationMatrix: Mat33): XYZ {
	const [x, y, z] = point;
	return [
		x * rotationMatrix[0][0] + y * rotationMatrix[0][1] + z * rotationMatrix[0][2],
		x * rotationMatrix[1][0] + y * rotationMatrix[1][1] + z * rotationMatrix[1][2],
		x * rotationMatrix[2][0] + y * rotationMatrix[2][1] + z * rotationMatrix[2][2],
	];
}

function numInBothArrays(a: number[], b: number[]) {
	return _.intersection(a, b).length;
}

function isSameBeaconByDistance(hostBeacon1: number[], hostBeacon2: number[]) {
	return numInBothArrays(hostBeacon1, hostBeacon2) >= OVERLAP_THRESHOLD;
}

function distance(a: XYZ, b: XYZ) {
	return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

function isSameBeacon(beacon1: XYZ[], beacon2: XYZ[]) {
	return beacon1.filter(c1 => beacon2.find(c2 => coordEqual(c1, c2))).length >= OVERLAP_THRESHOLD;
}

function coordEqual(first: XYZ, second: XYZ) {
	return (
		Math.abs(first[0]) === Math.abs(second[0]) &&
		Math.abs(first[1]) === Math.abs(second[1]) &&
		Math.abs(first[2]) === Math.abs(second[2])
	);
}

async function p2021day19_part2(input: string, ...params: any[]) {
	return "Not implemented";
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `--- scanner 0 ---
404,-588,-901
528,-643,409
-838,591,734
390,-675,-793
-537,-823,-458
-485,-357,347
-345,-311,381
-661,-816,-575
-876,649,763
-618,-824,-621
553,345,-567
474,580,667
-447,-329,318
-584,868,-557
544,-627,-890
564,392,-477
455,729,728
-892,524,684
-689,845,-530
423,-701,434
7,-33,-71
630,319,-379
443,580,662
-789,900,-551
459,-707,401

--- scanner 1 ---
686,422,578
605,423,415
515,917,-361
-336,658,858
95,138,22
-476,619,847
-340,-569,-846
567,-361,727
-460,603,-452
669,-402,600
729,430,532
-500,-761,534
-322,571,750
-466,-666,-811
-429,-592,574
-355,545,-477
703,-491,-529
-328,-685,520
413,935,-424
-391,539,-444
586,-435,557
-364,-763,-893
807,-499,-711
755,-354,-619
553,889,-390

--- scanner 2 ---
649,640,665
682,-795,504
-784,533,-524
-644,584,-595
-588,-843,648
-30,6,44
-674,560,763
500,723,-460
609,671,-379
-555,-800,653
-675,-892,-343
697,-426,-610
578,704,681
493,664,-388
-671,-858,530
-667,343,800
571,-461,-707
-138,-166,112
-889,563,-600
646,-828,498
640,759,510
-630,509,768
-681,-892,-333
673,-379,-804
-742,-814,-386
577,-820,562

--- scanner 3 ---
-589,542,597
605,-692,669
-500,565,-823
-660,373,557
-458,-679,-417
-488,449,543
-626,468,-788
338,-750,-386
528,-832,-391
562,-778,733
-938,-730,414
543,643,-506
-524,371,-870
407,773,750
-104,29,83
378,-903,-323
-778,-728,485
426,699,580
-438,-605,-362
-469,-447,-387
509,732,623
647,635,-688
-868,-804,481
614,-800,639
595,780,-596

--- scanner 4 ---
727,592,562
-293,-554,779
441,611,-461
-714,465,-776
-743,427,-804
-660,-479,-426
832,-632,460
927,-485,-438
408,393,-506
466,436,-512
110,16,151
-258,-428,682
-393,719,612
-211,-452,876
808,-476,-593
-575,615,604
-485,667,467
-680,325,-822
-627,-443,-432
872,-547,-609
833,512,582
807,604,487
839,-516,451
891,-625,532
-652,-548,-490
30,-46,-14`,
			extraArgs: [],
			expected: `79`,
		},
	];
	const part2tests: TestCase[] = [];

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of part1tests) {
			test.logTestResult(testCase, String(await p2021day19_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of part2tests) {
			test.logTestResult(testCase, String(await p2021day19_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = "42"; // String(await p2021day19_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now();
	const part2Solution = String(await p2021day19_part2(input));
	const part2After = performance.now();

	logSolution(19, 2021, part1Solution, part2Solution);

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
