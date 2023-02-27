import { veramo } from '../createCommand.js'
import { jest } from '@jest/globals'
import { createObjects } from '../lib/objectCreator'
import { getConfig } from '../setup'

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

  it('should load the dbConnection', async () => {
    const { dbConnection } = await createObjects(await getConfig('./packages/cli/default/default.yml'), {
      dbConnection: '/dbConnection',
    })
    expect(dbConnection).toBeDefined()
  })

  // this seems to fail because of an incompatibility between jest and the `multiformats@11` transitive dependency
  it('should load the agent', async () => {
    const { agent } = await createObjects(await getConfig('./packages/cli/default/default.yml'), {
      agent: '/agent',
    })
    expect(agent).toBeDefined()
  })

  // this seems to fail because of some timing issues or an incompatibility with the `chalk` transitive dependency
  it.skip('should list version number', async () => {
    expect(() => {
      // veramo.parse(['--version'], { from: 'user' })
    }).toThrow()
    expect(writeMock).toHaveBeenCalledWith(expect.stringMatching(/^\d\.\d\.\d\n?$/))
  })

  // this seems to fail because of some timing issues or an incompatibility with the `chalk` transitive dependency
  it.skip('should check the default config', async () => {
    expect(() => {
      // veramo.parse(['config', 'check', '-f', './packages/cli/default/default.yml'], { from: 'user' })
    }).toThrow(/hello/)
    expect(writeMock).toHaveBeenCalledWith(expect.stringMatching(/^\d\.\d\.\d\n?$/))
  })
})
