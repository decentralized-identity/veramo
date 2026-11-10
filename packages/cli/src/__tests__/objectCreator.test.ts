import { describe, expect, it } from 'vitest'

import { createObjects } from '../lib/objectCreator.js'

const fixtureSpecifier = './packages/cli/src/__tests__/fixtures/testClasses.js'

describe('objectCreator $require specifiers', () => {
  it('should instantiate a class export by default, passing $args', async () => {
    const { instance } = await createObjects(
      { instance: { $require: `${fixtureSpecifier}#TestClass`, $args: ['hello'] } },
      { instance: '/instance' },
    )
    expect(instance.greeting).toEqual('hello')
  })

  it('should call a function export with ?t=function', async () => {
    const { result } = await createObjects(
      { result: { $require: `${fixtureSpecifier}?t=function#testFunction`, $args: ['a', 'b'] } },
      { result: '/result' },
    )
    expect(result).toEqual('ab')
  })

  it('should return the export as-is with ?t=object', async () => {
    const { object } = await createObjects(
      { object: { $require: `${fixtureSpecifier}?t=object#testObject` } },
      { object: '/object' },
    )
    expect(object).toEqual({ foo: 'bar' })
  })

  it('should throw when no member is specified with the default class type', async () => {
    // Pre-existing semantics: a member-less specifier defaults to `t=class`,
    // and the module namespace itself cannot be constructed.
    await expect(
      createObjects({ module: { $require: fixtureSpecifier } }, { module: '/module' }),
    ).rejects.toThrow(/Error creating .*\['undefined']/)
  })

  it('should extract a JSON pointer from the module export with ?t=object&p=', async () => {
    const { value } = await createObjects(
      { value: { $require: `${fixtureSpecifier}?t=object&p=/nested/deep` } },
      { value: '/value' },
    )
    expect(value).toEqual({ value: 42 })
  })

  it('should import relative (./) module specifiers', async () => {
    const { instance } = await createObjects(
      { instance: { $require: `${fixtureSpecifier}?t=function#testFunction`, $args: ['x', 'y'] } },
      { instance: '/instance' },
    )
    expect(instance).toEqual('xy')
  })

  it('should import real workspace modules (e.g. @veramo/core#Agent)', async () => {
    const { agent } = await createObjects({ agent: { $require: '@veramo/core#Agent' } }, { agent: '/agent' })
    expect(agent.constructor.name).toEqual('Agent')
  })

  it('should resolve $ref references inside $args', async () => {
    const { instance } = await createObjects(
      {
        greeting: 'hello from ref',
        instance: { $require: `${fixtureSpecifier}#TestClass`, $args: [{ $ref: '/greeting' }] },
      },
      { instance: '/instance' },
    )
    expect(instance.greeting).toEqual('hello from ref')
  })

  it('should resolve $env values', async () => {
    process.env.VERAMO_TEST_ENV_VALUE = 'from-env'
    try {
      const { value } = await createObjects(
        { value: { $env: 'VERAMO_TEST_ENV_VALUE' } },
        { value: '/value' },
      )
      expect(value).toEqual('from-env')
    } finally {
      delete process.env.VERAMO_TEST_ENV_VALUE
    }
  })

  it('should wrap errors from unresolvable modules', async () => {
    await expect(
      createObjects(
        { instance: { $require: './packages/cli/src/__tests__/fixtures/does-not-exist.js#Foo' } },
        { instance: '/instance' },
      ),
    ).rejects.toThrow(/Error creating .*does-not-exist\.js\['Foo']/)
  })

  it('should wrap errors from missing members', async () => {
    await expect(
      createObjects(
        { instance: { $require: `${fixtureSpecifier}#doesNotExist` } },
        { instance: '/instance' },
      ),
    ).rejects.toThrow(/Error creating .*\['doesNotExist']/)
  })
})
