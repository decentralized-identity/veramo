// noinspection ES6PreferShortImport

import { CredentialStatus } from 'credential-status'
import {
  CredentialPayload,
  IAgentOptions,
  ICredentialPlugin,
  IDataStore,
  IDataStoreORM,
  IDIDManager,
  IIdentifier,
  TAgent,
} from '../../packages/core/src'
import { CredentialStatusPlugin } from '../../packages/credential-status/src'

type ConfiguredAgent = TAgent<IDIDManager & ICredentialPlugin & IDataStore & IDataStoreORM>

// Constant used to simulate exception flows
const simulateStatusVerificationFailure = 'Any unexpected failure during status verification.'

// Constant used to simulate revoked credentials
const simulateRevokedCredential = 'A revoked credential.'

// Constant used to simulate revoked credentials
const simulateNotRevokedCredential = 'A NOT revoked credential.'

const callsCounter = jest.fn()

const checkStatus = async (credential: any): Promise<CredentialStatus> => {
  callsCounter()

  if (credential.credentialStatus.id === simulateStatusVerificationFailure) {
    // Simulates the exception flows where the credential status verification
    // can't be executed for and unexpected reason, like network failures.
    throw new Error(simulateStatusVerificationFailure)
  }

  const revoked = credential.credentialStatus.id === simulateRevokedCredential
  if (!revoked && credential.credentialStatus.id !== simulateNotRevokedCredential) {
    throw new Error('Invalid state.')
  }

  return { revoked }
}

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: (options?: IAgentOptions) => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('Credential status verification (revocation)', () => {
    let agent: ConfiguredAgent
    let identifier: IIdentifier
    let rawCredential: CredentialPayload
    let rawRevoked: CredentialPayload
    let rawFailure: CredentialPayload
    let rawUnknown: CredentialPayload

    // Clean the number of times the methos was called in the previosu test
    beforeEach(callsCounter.mockReset)

    beforeAll(async () => {
      await testContext.setup({
        plugins: [
          new CredentialStatusPlugin({
            ExoticStatusMethod2022: checkStatus,
          }),
        ],
      })
      agent = testContext.getAgent()
      identifier = await agent.didManagerCreate({ kms: 'local' })

      rawCredential = buildCredential(identifier, {
        type: 'ExoticStatusMethod2022',
        id: simulateNotRevokedCredential,
      })

      rawRevoked = buildCredential(identifier, {
        type: 'ExoticStatusMethod2022',
        id: simulateRevokedCredential,
      })

      rawUnknown = buildCredential(identifier, {
        type: 'UnknownType',
        id: 'any',
      })

      rawFailure = buildCredential(identifier, {
        type: 'ExoticStatusMethod2022',
        id: simulateStatusVerificationFailure,
      })

      return true
    })

    afterAll(testContext.tearDown)

    it('should check credentialStatus for JWT credential', async () => {
      const vc = await agent.createVerifiableCredential({
        credential: rawCredential,
        proofFormat: 'jwt',
      })
      expect(vc).toHaveProperty('proof.jwt')

      const result = await agent.verifyCredential({ credential: vc })
      expect(callsCounter).toHaveBeenCalledTimes(1)
      expect(result.verified).toEqual(true)
    })

    it('should check credentialStatus for revoked JWT credential', async () => {
      const vc = await agent.createVerifiableCredential({
        credential: rawRevoked,
        proofFormat: 'jwt',
      })
      expect(vc).toHaveProperty('proof.jwt')

      const result = await agent.verifyCredential({ credential: vc })
      expect(callsCounter).toHaveBeenCalledTimes(1)
      expect(result.verified).toEqual(false)
    })

    it('should fail checking credentialStatus with exception during verification', async () => {
      const vc = await agent.createVerifiableCredential({
        credential: rawFailure,
        proofFormat: 'jwt',
      })
      expect(vc).toHaveProperty('proof.jwt')

      await expect(agent.verifyCredential({ credential: vc })).rejects.toThrow(
        simulateStatusVerificationFailure,
      )
      expect(callsCounter).toHaveBeenCalledTimes(1)
    })

    it('should fail checking credentialStatus when agent doesn`t have the status type', async () => {
      const vc = await agent.createVerifiableCredential({
        credential: rawUnknown,
        proofFormat: 'jwt',
      })
      expect(vc).toHaveProperty('proof.jwt')

      await expect(agent.verifyCredential({ credential: vc })).rejects.toThrow(
        `unknown_method: credentialStatus method UnknownType unknown. Validity can not be determined.`,
      )
      expect(callsCounter).toHaveBeenCalledTimes(0)
    })

    it('should check credentialStatus for JSON-LD credential', async () => {
      const vc = await agent.createVerifiableCredential({
        credential: rawCredential,
        proofFormat: 'lds',
      })
      expect(vc).toHaveProperty('proof.jws')

      const result = await agent.verifyCredential({ credential: vc })
      expect(callsCounter).toHaveBeenCalledTimes(1)
      expect(result.verified).toEqual(true)
    })

    it('should check credentialStatus for revoked JSON-LD credential', async () => {
      const vc = await agent.createVerifiableCredential({
        credential: rawRevoked,
        proofFormat: 'lds',
      })
      expect(vc).toHaveProperty('proof.jws')

      const result = await agent.verifyCredential({ credential: vc })
      expect(callsCounter).toHaveBeenCalledTimes(1)
      expect(result.verified).toEqual(false)
    })

    it('should check credentialStatus for EIP712 credential', async () => {
      const vc = await agent.createVerifiableCredential({
        credential: rawCredential,
        proofFormat: 'EthereumEip712Signature2021',
      })
      expect(vc).toHaveProperty('proof.proofValue')

      const result = await agent.verifyCredential({ credential: vc })
      expect(callsCounter).toHaveBeenCalledTimes(1)
      expect(result.verified).toEqual(true)
    })

    it('should check credentialStatus for revoked EIP712 credential', async () => {
      const vc = await agent.createVerifiableCredential({
        credential: rawRevoked,
        proofFormat: 'EthereumEip712Signature2021',
      })
      expect(vc).toHaveProperty('proof.proofValue')

      const result = await agent.verifyCredential({ credential: vc })
      expect(callsCounter).toHaveBeenCalledTimes(1)
      expect(result.verified).toEqual(false)
    })
  })

  describe('Credential status verification (revocation) without status plugin', () => {
    let agent: ConfiguredAgent
    let identifier: IIdentifier
    let rawCredential: CredentialPayload

    // Clean the number of times the methos was called in the previosu test
    beforeEach(callsCounter.mockReset)

    beforeAll(async () => {
      await testContext.setup({
        plugins: [],
      })
      agent = testContext.getAgent()
      identifier = await agent.didManagerCreate({ kms: 'local' })

      rawCredential = {
        issuer: { id: identifier.did },
        '@context': ['https://www.w3.org/2018/credentials/v1', 'https://veramo.io/contexts/profile/v1'],
        type: ['VerifiableCredential', 'Profile'],
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          name: 'Better trust layers with Veramo!',
        },
        credentialStatus: {
          type: 'ExoticStatusMethod2022',
          id: simulateNotRevokedCredential,
        },
      }
    })

    afterAll(testContext.tearDown)

    it('should fail on credentialStatus check when agent has no status plugin', async () => {
      const vc = await agent.createVerifiableCredential({
        credential: rawCredential,
        proofFormat: 'jwt',
      })
      expect(vc).toHaveProperty('proof.jwt')

      // TODO It`s an exception flow an it'd be better to throw an exception instead of returning false
      await expect(agent.verifyCredential({ credential: vc })).rejects.toThrow(
        `invalid_setup: The credential status can't be verified because there is no ICredentialStatusVerifier plugin installed.`,
      )
    })
  })
}

function buildCredential(
  identifier: IIdentifier,
  credentialStatus: { type: string; id: string },
): CredentialPayload {
  return {
    issuer: { id: identifier.did },
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://veramo.io/contexts/profile/v1'],
    type: ['VerifiableCredential', 'Profile'],
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      name: 'Better trust layers with Veramo!',
    },
    credentialStatus,
  }
}
