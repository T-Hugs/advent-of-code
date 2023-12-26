interface TestCase {
	input: string;
	extraArgs?: any[];
	expected: string;
	expectedPart1?: string;
	expectedPart2?: string;
	ignore?: boolean;
}

type Obj<TVal> = { [key: string]: TVal };

declare module "a-star" {
	interface Node<T> {
		parent: Node<T>;
		data: T
	}
	interface AStarOptions<T> {
		start: T;
		isEnd: (node: T) => boolean;
		neighbor: (node: T, rawNode: Node<T>) => T[];
		heuristic: (node: T) => number;
		distance: (a: T, b: T) => number;
		hash?: (node: T) => string;
		timeout?: number;
	}
	export default function <T>(options: AStarOptions<T>): { status: string; path: T[] };
}
