export abstract class AbstractSecretBox {
  abstract encrypt(message: string): Promise<string>
  abstract decrypt(encryptedMessageHex: string): Promise<string>
}
