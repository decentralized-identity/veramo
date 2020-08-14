import { AgentRestClient, supportedMethods } from '../'

describe('daf-rest', () => {
  it('should support some methods', () => {
    expect(Array.isArray(supportedMethods)).toEqual(true)
    expect(supportedMethods.length).toBeGreaterThan(0)
  })

  it('should be a valid agent plugin', () => {
    const client = new AgentRestClient({
      url: 'mock',
      enabledMethods: supportedMethods,
    })

    expect(client.methods[supportedMethods[0]]).toBeTruthy()
  })
})
