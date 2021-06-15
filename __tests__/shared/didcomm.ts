import { TAgent, IDIDManager, IKeyManager, IIdentifier, IResolver } from '../../packages/core/src'
import { IDIDComm, IDIDCommMessageMediaType } from '../../packages/did-comm/src'

type ConfiguredAgent = TAgent<IDIDManager & IKeyManager & IResolver & IDIDComm>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: () => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('DID comm', () => {
    let agent: ConfiguredAgent
    let sender: IIdentifier
    let receiver: IIdentifier

    beforeAll(async () => {
      await testContext.setup()
      agent = testContext.getAgent()

      sender = await agent.didManagerGetOrCreate({
        kms: 'local',
        provider: 'did:key',
        alias: 'sender',
      })

      receiver = await agent.didManagerGetOrCreate({
        kms: 'local',
        provider: 'did:key',
        alias: 'sender',
      })

      return true
    })
    afterAll(testContext.tearDown)

    it('should pack an anonymous encrypted message', async () => {
      const message = {
        type: 'test',
        to: receiver.did,
        id: 'test',
        body: { hello: 'world' },
      }
      const packedMessage = await agent.packDIDCommMessage({
        packing: 'anoncrypt',
        message,
      })

      console.log(packedMessage)

      const unpackedMessage = await agent.unpackDIDCommMessage({
        mediaType: IDIDCommMessageMediaType.DIDCOMM_JWE,
        ...packedMessage,
      })

      expect(unpackedMessage).toEqual(message)
    })
  })
}

const packed = {
  protected: 'eyJlbmMiOiJYQzIwUCJ9',
  iv: 'sHQLXzGfAbFgte9-EYeu0O2c8S8pkMFu',
  ciphertext:
    'lMEt7DO_QtxpCBridyjVbyqqce5yD4J6fwpJo88hQOmPYu6RO8Uj8-Q1xONEafdCgUQadHhq5QuiO9UIGJUczdCHCVtv-HR9Q8HifpBvCxC5R4DdFD42O4ONDeUfOjRbYiuBbmtpbohGcjbZ1qCVfpoXQbU',
  tag: 'uVHwTY8RCeSfyVFP9DTr-Q',
  recipients: [
    {
      encrypted_key: 'XigXj53YEUU6OIjciCuHw8XorDskAKDtIiNoZ_M7D_4',
      header: {
        alg: 'ECDH-ES+XC20PKW',
        iv: '66VLiS4L7JG27sbTeJPRmnXs8I6wIx6l',
        tag: 'cJefilGTSKChzVXNN3xFbA',
        epk: { kty: 'OKP', crv: 'X25519', x: 'CjHXsPG8GhqlVJndaApQkm9nxRzA2gQRc0LMCNARzm4' },
        kid: '#z6LSogMxqn5NePSAtbgtgTfRr1Qb5qtXzPdcN1yfWuzhViwe',
      },
    },
  ],
}
