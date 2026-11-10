// Fixture used by objectCreator tests to exercise `$require` specifiers.
// Deliberately plain ESM JavaScript so it loads in any context without a transform step.

export class TestClass {
  constructor(greeting) {
    this.greeting = greeting
  }
}

export function testFunction(a, b) {
  return a + b
}

export const testObject = { foo: 'bar' }

export const nested = { deep: { value: 42 } }
