interface TestCase {
	input: string;
	expected: string;
}

declare module "a-star" {
	export default function (options: any): { status: stringify; path: any[] };
}
