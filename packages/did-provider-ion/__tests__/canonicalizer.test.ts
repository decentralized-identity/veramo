import { JsonCanonicalizer } from '../src/json-canonicalizer'

describe('canonicalizer result should be', () => {
  it('throwing an error on null input', () => {
    expect(() => JsonCanonicalizer.asString(null)).toThrow('Null content received in canonicalizer')
  })
  it('quoted empty string on empty string', () => {
    expect(JsonCanonicalizer.asString('')).toEqual('""')
  })
  it('empty json string on empty json', () => {
    expect(JsonCanonicalizer.asString({})).toEqual('{}')
  })
  it('a json string exactly matching input', () => {
    expect(
      JsonCanonicalizer.asString({
        test1: 'test1',
        test2: 'test2',
      }),
    ).toEqual('{"test1":"test1","test2":"test2"}')
  })
  it('a json string with properties reordered', () => {
    expect(
      JsonCanonicalizer.asString({
        test2: 'test2',
        test1: 'test1',
      }),
    ).toEqual('{"test1":"test1","test2":"test2"}')
  })
  it('a json string with null values intact', () => {
    expect(
      JsonCanonicalizer.asString({
        test1: 'test1',
        test2: null,
      }),
    ).toEqual('{"test1":"test1","test2":null}')
  })
  it('a json string with undefined property values removed', () => {
    expect(
      JsonCanonicalizer.asString({
        test1: 'test1',
        test2: undefined,
      }),
    ).toEqual('{"test1":"test1"}')
  })
  it('a json string with undefined property values removed if nested', () => {
    expect(
      JsonCanonicalizer.asString({
        test1: {
          test2: 'test2',
          test3: undefined,
        },
      }),
    ).toEqual('{"test1":{"test2":"test2"}}')
  })
})
