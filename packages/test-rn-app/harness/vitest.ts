// What `vitest` resolves to inside the RN bundle (see metro.config.cjs), so the files in tests/ are plain vitest
// files: vitest's own `expect` (@vitest/expect on chai), and a minimal `describe` / `it` / `beforeAll` (plus
// `describe.each` / `it.each` over objects, with vitest's `$property` names) that registers tests for `run()`. Tests in
// a file run in order, like vitest's default. Other vitest exports are missing.
import { JestAsymmetricMatchers, JestChaiExpect, JestExtend } from '@vitest/expect'
import * as chai from 'chai'

chai.use(JestExtend)
chai.use(JestChaiExpect)
chai.use(JestAsymmetricMatchers)

export const expect: any = chai.expect

type Fn = () => unknown
type Test = { name: string; fn: Fn }
type Suite = { name: string; beforeAll: Fn[]; children: (Suite | Test)[] }
export type Failure = { name: string; error: string }
export type Result = { passed: number; failed: number; failures: Failure[] }

const root: Suite = { name: '', beforeAll: [], children: [] }
let current = root

function addSuite(name: string, fn: () => void) {
  const suite: Suite = { name, beforeAll: [], children: [] }
  current.children.push(suite)
  const parent = current
  current = suite
  try {
    fn()
  } finally {
    current = parent
  }
}

const addTest = (name: string, fn: Fn) => void current.children.push({ name, fn })

/** vitest's name formatting for object cases: `$property` is replaced by that property of the case. */
const caseName = (name: string, testCase: any) => name.replace(/\$(\w+)/g, (_, key) => String(testCase[key]))

export const describe = Object.assign(addSuite, {
  each:
    <T>(cases: T[]) =>
    (name: string, fn: (testCase: T) => void) =>
      cases.forEach((testCase) => addSuite(caseName(name, testCase), () => fn(testCase))),
})

export const it = Object.assign(addTest, {
  each:
    <T>(cases: T[]) =>
    (name: string, fn: (testCase: T) => unknown) =>
      cases.forEach((testCase) => addTest(caseName(name, testCase), () => fn(testCase))),
})
export const test = it
export const beforeAll = (fn: Fn) => void current.beforeAll.push(fn)

const message = (e: any) =>
  String(e?.message ?? e) + (e?.cause ? ` [cause: ${e.cause?.message ?? e.cause}]` : '')
const stack = (e: any) => (e?.stack ? '\n' + String(e.stack).split('\n').slice(1, 8).join('\n') : '')
const sum = (results: Result[]): Result => ({
  passed: results.reduce((n, r) => n + r.passed, 0),
  failed: results.reduce((n, r) => n + r.failed, 0),
  failures: results.flatMap((r) => r.failures),
})
const fullName = (path: string[]) => path.join(' > ')
const testNames = (node: Suite | Test, path: string[]): string[] =>
  'fn' in node ? [fullName(path)] : node.children.flatMap((child) => testNames(child, [...path, child.name]))

async function runTest(test: Test, name: string): Promise<Result> {
  try {
    await test.fn()
    console.log('ok     ' + name)
    return { passed: 1, failed: 0, failures: [] }
  } catch (e) {
    console.log('not ok ' + name + ' :: ' + message(e) + stack(e))
    return { passed: 0, failed: 1, failures: [{ name, error: message(e) }] }
  }
}

/** Runs the registered tests in order. A failing `beforeAll` fails every test of its suite. */
export async function run(suite: Suite = root, path: string[] = []): Promise<Result> {
  try {
    for (const hook of suite.beforeAll) await hook()
  } catch (e) {
    console.log(`not ok ${fullName(path)} (beforeAll) :: ${message(e)}${stack(e)}`)
    const names = testNames(suite, path)
    return { passed: 0, failed: names.length, failures: names.map((name) => ({ name, error: message(e) })) }
  }
  const results: Result[] = []
  for (const child of suite.children) {
    const childPath = [...path, child.name]
    results.push('fn' in child ? await runTest(child, fullName(childPath)) : await run(child, childPath))
  }
  return sum(results)
}
