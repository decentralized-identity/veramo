import { describe, expect, it, vi } from 'vitest'

import { createDefaultDid } from '../default-did.js'

function makeAgent() {
  return {
    didManagerGetOrCreate: vi.fn(async () => ({ did: 'did:web:example.com' })),
    didManagerAddService: vi.fn(async () => true),
  } as any
}

describe('createDefaultDid', () => {
  it('should create a did:web keyed by the baseUrl hostname, without the port', async () => {
    const agent = makeAgent()
    await createDefaultDid({ agent, baseUrl: 'https://example.com:8443', messagingServiceEndpoint: '/messaging' })
    expect(agent.didManagerGetOrCreate).toHaveBeenCalledWith({
      provider: 'did:web',
      alias: 'example.com',
      options: { keyType: 'Ed25519' },
    })
  })

  it('should register messaging and DIDComm services at baseUrl + messagingServiceEndpoint', async () => {
    const agent = makeAgent()
    await createDefaultDid({ agent, baseUrl: 'https://example.com', messagingServiceEndpoint: '/messaging' })
    expect(agent.didManagerAddService).toHaveBeenCalledTimes(2)
    expect(agent.didManagerAddService).toHaveBeenCalledWith({
      did: 'did:web:example.com',
      service: expect.objectContaining({
        type: 'Messaging',
        serviceEndpoint: 'https://example.com/messaging',
      }),
    })
    expect(agent.didManagerAddService).toHaveBeenCalledWith({
      did: 'did:web:example.com',
      service: expect.objectContaining({
        type: 'DIDCommMessaging',
        serviceEndpoint: 'https://example.com/messaging',
      }),
    })
  })

  it('should not register services when no messagingServiceEndpoint is given', async () => {
    const agent = makeAgent()
    await createDefaultDid({ agent, baseUrl: 'https://example.com' })
    expect(agent.didManagerAddService).not.toHaveBeenCalled()
  })

  it('should require an agent and a baseUrl', async () => {
    const agent = makeAgent()
    await expect(createDefaultDid({ agent: undefined as any, baseUrl: 'https://example.com' })).rejects.toThrow(
      'Agent is required',
    )
    await expect(createDefaultDid({ agent, baseUrl: '' })).rejects.toThrow('baseUrl is required')
  })
})
