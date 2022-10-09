import { createAgent, CredentialStatus, VerifiableCredential } from "@veramo/core"
import { DIDDocument } from "did-resolver"
import { AbstractStatusMethod } from '../abstract-status-method'
import { CredentialStatusRouter } from '../status-router'
import { CredentialStatusReference } from '@veramo/core/src/types/vc-data-model'
import { ICredentialStatusRouter } from '@veramo/core/src/types/ICredentialStatusRouter'
import { ICredentialIssuer } from "@veramo/credential-w3c"

const referenceDidDoc: DIDDocument = { id: 'did:example:1234' }
const referenceCredentialStatus = <CredentialStatusReference>{
    type: 'ExoticStatusMethod2022',
    id: 'some-exotic-id',
}
const referenceCredential: VerifiableCredential & { credentialStatus: CredentialStatusReference } = {
    '@context': [],
    issuanceDate: new Date().toISOString(),
    proof: {},
    issuer: referenceDidDoc.id,
    credentialSubject: {},
    credentialStatus: referenceCredentialStatus
}

class ExoticStatusMethod2022 extends AbstractStatusMethod {
    async checkCredentialStatus(args: any, context: any): Promise<CredentialStatus> {
        return { verified: true }
    }
    async credentialStatusRead(args: any, context: any): Promise<VerifiableCredential> {
        return referenceCredential
    }
    async credentialStatusGenerate(args: any): Promise<CredentialStatusReference> {
        return <CredentialStatusReference>referenceCredential.credentialStatus
    }
    async credentialStatusUpdate(args: any): Promise<any> {
        throw new Error("Method not implemented.")
    }
}

describe('@veramo/credential-status/status-router', () => {
    it('should route to the correct status method instance', async () => {
        const statusMethod = new ExoticStatusMethod2022()
        const agent = createAgent<ICredentialIssuer | ICredentialStatusRouter>({
            plugins: [
                new CredentialStatusRouter({
                    statusMethods: {
                        ExoticStatusMethod2022: statusMethod,
                    },
                    defaultStatusMethod: '',
                })
            ]
        })

        const result = await agent.statusRouterCheckStatus({
            credential: referenceCredential,
        })

        expect(result).toStrictEqual({ verified: true })
    })
})