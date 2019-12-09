import { Message } from '../message'

jest.mock('blakejs')
import { blake2bHex } from 'blakejs'

it('empty message should not be valid', () => {
  const msg = new Message({ raw: '', meta: { type: '' } })
  expect(msg.type).toEqual(null)
  expect(msg.threadId).toEqual(null)
  expect(msg.from).toEqual(null)
  expect(msg.to).toEqual(null)
  expect(msg.isValid()).toEqual(false)
})

it('valid message should be valid', () => {
  const msg = new Message({ raw: 'raw', meta: { type: 'test' } })
  msg.id = '123'
  expect(msg.id).toEqual('123')

  msg.type = 'someType'
  expect(msg.type).toEqual('someType')

  msg.threadId = '456'
  expect(msg.threadId).toEqual('456')

  msg.from = 'did:example:abc'
  expect(msg.from).toEqual('did:example:abc')

  msg.to = 'did:example:xyz'
  expect(msg.to).toEqual('did:example:xyz')

  expect(msg.isValid()).toEqual(true)
})

it('should return raw and meta from last transformation', () => {
  const msg = new Message({ raw: 'raw1', meta: { type: 'type1' } })
  msg.transform({ raw: 'raw2', meta: { type: 'type2' } })

  expect(msg.raw).toEqual('raw2')
  expect(msg.meta).toEqual({ type: 'type2' })
})

it('should return all meta data in right order', () => {
  const msg = new Message({ raw: 'raw1', meta: { type: 'type1' } })
  msg.transform({ raw: 'raw2', meta: { type: 'type2' } })
  msg.transform({ raw: 'raw3', meta: { type: 'type3' } })

  expect(msg.allMeta).toEqual([{ type: 'type1' }, { type: 'type2' }, { type: 'type3' }])
})

it('should use blake hash of last raw as id if id is not set', () => {
  const msg = new Message({ raw: 'raw1', meta: { type: 'type1' } })

  msg.transform({ raw: 'raw2', meta: { type: 'type2' } })
  blake2bHex.mockReturnValue('hash123')

  expect(msg.id).toEqual('hash123')
})
