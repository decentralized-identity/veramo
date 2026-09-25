// The tiny test runner shared by every harness test module: no framework, no
// globals beyond `console` and Promise, so it runs the same on Hermes and Node.
export type Failure = { name: string; error: string }
export type Result = { passed: number; failed: number; failures: Failure[] }

export function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg)
}

/** Returns a result to fill in and a `test(name, fn)` that records into it. */
export function createTestRun() {
  const result: Result = { passed: 0, failed: 0, failures: [] }
  const test = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn()
      result.passed++
      console.log('ok     ' + name)
    } catch (e: any) {
      result.failed++
      const cause = e?.cause ? ' [cause: ' + String(e.cause?.message ?? e.cause) + ']' : ''
      const error = String(e?.message ?? e) + cause
      result.failures.push({ name, error })
      const stack = e?.stack ? '\n' + String(e.stack).split('\n').slice(1, 8).join('\n') : ''
      console.log('not ok ' + name + ' :: ' + error + stack)
    }
  }
  return { result, test }
}
