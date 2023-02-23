import { veramo } from '../createCommand.js'
import { jest } from '@jest/globals'
import { createObjects } from '../lib/objectCreator'
import { getConfig } from '../setup'

jest.useFakeTimers()

describe('cli version', () => {
  const writeMock = jest.fn()

  beforeAll(() => {
    // veramo
    //   .exitOverride()
    //   .configureOutput({ writeOut: writeMock })
  })

  afterAll(() => {
    jest.clearAllMocks()
  })

  it.skip('should list version number', async () => {
    expect(() => {
      // veramo.parse(['--version'], { from: 'user' })
    }).toThrow()
    expect(writeMock).toHaveBeenCalledWith(expect.stringMatching(/^\d\.\d\.\d\n?$/))
  })

  it.skip('should load the dbConnection', async () => {
    // this seems to fail because of some timing issues or an incompatibility with the `chalk` transitive dependency
    // all other tests that need to load the dbConnection fail similarly
    const res = await createObjects(getConfig('./packages/cli/default/default.yml'), {
      my: '/dbConnection',
    })
  })

  it.skip('should check the default config', async () => {
    expect(() => {
      // veramo.parse(['config', 'check', '-f', './packages/cli/default/default.yml'], { from: 'user' })
    }).toThrow(/hello/)
    expect(writeMock).toHaveBeenCalledWith(expect.stringMatching(/^\d\.\d\.\d\n?$/))
  })
})
