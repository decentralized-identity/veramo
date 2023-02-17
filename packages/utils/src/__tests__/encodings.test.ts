import { bytesToHex, hexToBytes } from '../encodings.js'

describe('@veramo/utils encoding utils', () => {
  describe('hexToBytes', () => {
    it('should convert hex string to bytes', () => {
      expect(hexToBytes('0x0102')).toEqual(Uint8Array.from([1, 2]))
      expect(hexToBytes('0x0A0b')).toEqual(Uint8Array.from([10, 11]))
      expect(hexToBytes('0102')).toEqual(Uint8Array.from([1, 2]))
      expect(hexToBytes('0A0b')).toEqual(Uint8Array.from([10, 11]))
      expect(hexToBytes('A0b')).toEqual(Uint8Array.from([10, 11]))
    })

    it('should mirror uint8array', () => {
      // @ts-ignore
      expect(hexToBytes(Buffer.from('0102', 'hex'))).toEqual(Uint8Array.from([1, 2]))
    })

    it('should refuse non-string types', () => {
      expect(() => {
        // @ts-ignore
        hexToBytes({})
      }).toThrow(/illegal_argument/)
      expect(() => {
        // @ts-ignore
        hexToBytes(undefined)
      }).toThrow(/illegal_argument/)
      expect(() => {
        // @ts-ignore
        hexToBytes(null)
      }).toThrow(/illegal_argument/)
      expect(() => {
        // @ts-ignore
        hexToBytes(1234)
      }).toThrow(/illegal_argument/)
    })

    it('should refuse wrong charset', () => {
      expect(() => {
        // @ts-ignore
        hexToBytes('zxcv')
      }).toThrow()
    })
  })

  describe('bytesToHex', () => {
    it('should convert bytes to hexString', () => {
      expect(bytesToHex(Uint8Array.from([1, 2]))).toEqual('0102')
      expect(bytesToHex(Buffer.from([11, 12]))).toEqual('0b0c')
      expect(bytesToHex(Uint8Array.from([1, 2]), true)).toEqual('0x0102')
      expect(bytesToHex(Buffer.from([11, 12]), true)).toEqual('0x0b0c')
    })

    it('should refuse non-uint8Array types', () => {
      expect(() => {
        // @ts-ignore
        bytesToHex({})
      }).toThrow(/illegal_argument/)
      expect(() => {
        // @ts-ignore
        bytesToHex(undefined)
      }).toThrow(/illegal_argument/)
      expect(() => {
        // @ts-ignore
        bytesToHex(null)
      }).toThrow(/illegal_argument/)
      expect(() => {
        // @ts-ignore
        bytesToHex(1234)
      }).toThrow(/illegal_argument/)
      expect(() => {
        // @ts-ignore
        bytesToHex([1, 2, 3, 4])
      }).toThrow(/illegal_argument/)
    })
  })
})
