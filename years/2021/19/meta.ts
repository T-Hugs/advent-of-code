type Mat33 = [[number, number, number], [number, number, number], [number, number, number]];
type XYZ = [number, number, number];
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

for (let i = 0; i < rotationMatrixes.length; ++i) {
	const vec: XYZ = [4, 5, 6];
	const mat = rotationMatrixes[i];
	const rotated = rotatePoint(vec, mat);

	for (let j = 0; j < rotationMatrixes.length; ++j) {
		const potentialInverse = rotationMatrixes[j];
		const rotatedAgain = rotatePoint(rotated, potentialInverse);

		if (rotatedAgain[0] === vec[0] && rotatedAgain[1] === vec[1] && rotatedAgain[2] === vec[2]) {
			console.log(`${i}: ${j},`);
			break;
		}
	}
}

function rotatePoint(point: XYZ, rotationMatrix: Mat33): XYZ {
	const [x, y, z] = point;
	return [
		x * rotationMatrix[0][0] + y * rotationMatrix[0][1] + z * rotationMatrix[0][2],
		x * rotationMatrix[1][0] + y * rotationMatrix[1][1] + z * rotationMatrix[1][2],
		x * rotationMatrix[2][0] + y * rotationMatrix[2][1] + z * rotationMatrix[2][2],
	];
}
