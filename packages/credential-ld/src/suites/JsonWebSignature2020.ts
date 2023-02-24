import { CredentialPayload, DIDDocument, IAgentContext, IKey, TKeyType } from "@veramo/core-types";
import { RequiredAgentMethods, VeramoLdSignature } from "../ld-suites.js";
import * as u8a from "uint8arrays";
import { JsonWebKey, JsonWebSignature } from "@transmute/json-web-signature";
import { asArray, encodeJoseBlob } from "@veramo/utils";


/**
 * Veramo wrapper for the JsonWebSignature2020 suite by Transmute Industries
 *
 * @alpha This API is experimental and is very likely to change or disappear in future releases without notice.
 */
export class VeramoJsonWebSignature2020 extends VeramoLdSignature {
    getSupportedVerificationType(): 'JsonWebKey2020' {
        return 'JsonWebKey2020'
    }

    getSupportedVeramoKeyType(): TKeyType {
        return 'Ed25519'
    }

    async getSuiteForSigning(
        key: IKey,
        issuerDid: string,
        verificationMethodId: string,
        context: IAgentContext<RequiredAgentMethods>,
    ): Promise<any> {
        const controller = issuerDid

        // DID Key ID
        let id = verificationMethodId

        const signer = {
            // returns a JWS detached
            sign: async (args: { data: Uint8Array }): Promise<string> => {
                const header = {
                    alg: 'EdDSA',
                    b64: false,
                    crit: ['b64'],
                }
                const headerString = encodeJoseBlob(header)
                const messageBuffer = u8a.concat([u8a.fromString(`${headerString}.`, 'utf-8'), args.data])
                const messageString = u8a.toString(messageBuffer, 'base64')
                const signature = await context.agent.keyManagerSign({
                    keyRef: key.kid,
                    algorithm: 'EdDSA',
                    data: messageString,
                    encoding: 'base64',
                })
                return `${headerString}..${signature}`
            },
        }

        const verificationKey = await JsonWebKey.from({
            id: id,
            type: this.getSupportedVerificationType(),
            controller: controller,
            publicKeyJwk: {
                kty: 'OKP',
                crv: 'Ed25519',
                x: u8a.toString(u8a.fromString(key.publicKeyHex, 'hex'), 'base64url'),
            },
        })

        verificationKey.signer = () => signer

        const suite = new JsonWebSignature({
            key: verificationKey,
        })

        suite.ensureSuiteContext = ({ document }: { document: any, addSuiteContext: boolean }) => {
            document['@context'] = [...asArray(document['@context'] || []), 'https://w3id.org/security/suites/jws-2020/v1']
        }

        return suite
    }

    getSuiteForVerification(): any {
        return new JsonWebSignature()
    }

    preSigningCredModification(credential: CredentialPayload): void {
        // nop
    }

    preDidResolutionModification(didUrl: string, didDoc: DIDDocument): void {
        // do nothing
    }

}
