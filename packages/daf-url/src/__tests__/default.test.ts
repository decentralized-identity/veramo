import { Message } from 'daf-core'
import { MessageValidator } from '../message-validator'
describe('daf-url', () => {
  const validator = new MessageValidator()
  it('should reject unknown message type', async () => {
    const message = new Message({ raw: 'test', meta: { type: 'test' } })
    expect(validator.validate(message, null)).rejects.toEqual('Unsupported message type')
  })

  it('should transform message after standard URL', async () => {
    const JWT =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NzU5Njc1MzEsInR5cGUiOiJzZHIiLCJ0YWciOiJzZXNzaW9uLTEyMyIsImNsYWltcyI6W3sicmVhc29uIjoiV2UgbmVlZCB5b3VyIG5hbWUiLCJjbGFpbVR5cGUiOiJuYW1lIn1dLCJpc3MiOiJkaWQ6ZXRocjoweDViMmIwMzM1Mzk4NDM2MDFmYjgxZGYxNzA0OTE4NzA0ZmQwMTQxZmEifQ.KoHbpJ5HkLLIw8iEqsu2Jql9m5dbydNy2zO53GKuIbwfPOW842_IPXw2zwVtj0FcEuHUkzhx-bhS28Zhmvkv2gE'
    const message = new Message({
      raw: 'https://identity.foundation/ssi/?c_i=' + JWT,
      meta: {
        type: 'QRCode',
      },
    })
    expect(validator.validate(message, null)).rejects.toEqual('Unsupported message type')
    expect(message.raw).toEqual(JWT)
  })
})
