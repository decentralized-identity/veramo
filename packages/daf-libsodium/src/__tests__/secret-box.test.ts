import { SecretBox } from '../secret-box'

describe('daf-libsodium', () => {
  it('should encrypt and decrypt', async () => {
    const secretKey = await SecretBox.createSecretKey()
    const box = new SecretBox(secretKey)
    const message = 'hello world'

    const encrypted = await box.encrypt(message)
    const decrypted = await box.decrypt(encrypted)
    expect(decrypted).toEqual(message)
  })
})
