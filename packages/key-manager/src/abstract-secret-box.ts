/**
 * This simple abstract class can be extended by different implementations to provide encryption at rest for
 * some implementations of {@link @veramo/key-manager#AbstractPrivateKeyStore | AbstractPrivateKeyStore}.
 *
 * @public
 */
export abstract class AbstractSecretBox {
  abstract encrypt(message: string): Promise<string>
  abstract decrypt(encryptedMessageHex: string): Promise<string>
}
