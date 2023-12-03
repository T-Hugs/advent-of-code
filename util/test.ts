import chalk from "chalk";

let NO_TESTS = false;

export function setNoTests(value: boolean) {
	NO_TESTS = value;
}

const grayBar = chalk.gray("║");
const blueBar = chalk.blueBright("│");

let testIndex = 1;
let sectionIndex = 1;
let testsHidden = false;

function testLog(...params: any[]) {
	if (!sectionHidden && !testsHidden) {
		console.log(...params);
	}
}

export function beginTests(hideTests = false) {
	if (NO_TESTS) {
		return;
	}
	testIndex = 1;
	sectionIndex = 1;
	testsHidden = hideTests;

	testLog(chalk.gray("╔═══════════════ TEST CASES ═══════════════╗\n║"));
}

let sectionHidden = false;
export function beginSection(hideSection = false) {
	sectionHidden = hideSection;
	if (sectionIndex > 1) {
		testLog(grayBar + chalk.blueBright(`  └────────────────────────────────────┘`));
	}
	testLog(grayBar + chalk.blueBright(`  ┌─────── PART ${sectionIndex} TESTS ──────┐`));
	sectionIndex++;
}

export function endSection() {
	testLog(grayBar + chalk.blueBright(`  └──────────────────────────────┘`));
}

export async function section(runner: () => void, hideSection = false) {
	if (NO_TESTS || hideSection) {
		return;
	}
	testLog(grayBar + chalk.blueBright(`  ┌─────── PART ${sectionIndex} TESTS ──────┐`));
	await runner();
	testLog(grayBar + chalk.blueBright(`  └───────────────────────────┘`));
	sectionIndex++;
}

function formatTestInput(input: string) {
	return grayBar + "  " + blueBar + "      " + input.split("\n").join("\n" + grayBar + "  " + blueBar + "      ");
}

export function logTestResult(testCase: TestCase, result: string) {
	if (testCase.expected === result) {
		testLog(`${grayBar}  ${blueBar} ${testIndex}.  ${chalk.greenBright("SUCCESS")}`);
	} else {
		testLog(`${grayBar}  ${blueBar} ${testIndex}.  ${chalk.redBright("FAILED")}`);
		testLog(`${grayBar}  ${blueBar}     ${chalk.blackBright("┄┄┄┄┄┄┄┄┄┄┄┄┄┄  Test Input")}`);
		testLog(formatTestInput(testCase.input));
		testLog(`${grayBar}  ${blueBar}     ${chalk.blackBright("┄┄┄┄┄┄┄┄┄┄┄┄┄┄  End")}`);
		testLog(`${grayBar}  ${blueBar}     Expected: ${testCase.expected}`);
		testLog(`${grayBar}  ${blueBar}     Actual  : ${chalk.yellowBright(result)}`);
	}
	testIndex++;
}

export function normalizeTestCases(part1tests: TestCase[], part2tests: TestCase[]): [TestCase[], TestCase[]] {
	const p1testsNormalized: TestCase[] = [];
	const p2testsNormalized: TestCase[] = [];
	for (const testCase of part1tests) {
		p1testsNormalized.push(testCase);
		if (testCase.expectedPart2) {
			p2testsNormalized.push({
				input: testCase.input,
				extraArgs: testCase.extraArgs,
				expected: testCase.expectedPart2,
			});
		}
	}
	for (const testCase of part2tests) {
		p2testsNormalized.push(testCase);
		if (testCase.expectedPart1) {
			p1testsNormalized.push({
				input: testCase.input,
				extraArgs: testCase.extraArgs,
				expected: testCase.expectedPart1,
			});
		}
	}
	
	return [p1testsNormalized, p2testsNormalized];
}

export function endTests() {
	if (NO_TESTS) {
		return;
	}
	sectionHidden = false;
	testIndex = 1;
	sectionIndex = 1;
	testLog(grayBar + chalk.gray("\n╚════════════════ END TESTS ═══════════════╝"));
}
