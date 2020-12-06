interface TestCase {
	input: string;
	expected: string;
}

type Obj<TVal> = { [key: string]: TVal };

declare module "a-star" {
	export default function (options: any): { status: stringify; path: any[] };
}
