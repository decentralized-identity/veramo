import { SecretBox } from '../secret-box.js'

describe('@veramo/kms-local', () => {
  it('should encrypt and decrypt', async () => {
    const secretKey = await SecretBox.createSecretKey()
    const box = new SecretBox(secretKey)
    const message = 'hello world'

    const encrypted = await box.encrypt(message)
    const decrypted = await box.decrypt(encrypted)
    expect(decrypted).toEqual(message)
  })
  //
  // // @ts-ignore
  // const curves = elliptic.default.curves
  //
  // function createCurve(options: any) {
  //   // @ts-ignore
  //   // const curve = elliptic.default.curve
  //   let curve
  //   if (options.type === 'short') curve = new elliptic.curve.short(options)
  //   else if (options.type === 'edwards') curve = new elliptic.curve.edwards(options)
  //   else {
  //     // @ts-ignore
  //     curve = new elliptic.curve.mont(options)
  //   }
  //
  //   curve.hash = options.hash
  //   if (!curve.g.validate()) {
  //     throw new Error('Invalid curve')
  //   }
  //   if (!curve.g.mul(curve.n).isInfinity()) {
  //     throw new Error("Invalid curve, G*N != O'")
  //   }
  //   return curve
  // }
  //
  // function defineCurve(name: string, options: any) {
  //   Object.defineProperty(curves, name, {
  //     configurable: true,
  //     enumerable: true,
  //     get: function () {
  //       var curve = createCurve(options)
  //       Object.defineProperty(curves, name, {
  //         configurable: true,
  //         enumerable: true,
  //         value: curve,
  //       })
  //       return curve
  //     },
  //   })
  // }
  //
  // it.only('should do baby jubjbub', async () => {
  //   // @ts-ignore
  //   defineCurve('babyjubjub', {
  //     type: 'edwards',
  //     prime: '30644e72 e131a029 b85045b6 8181585d 2833e848 79b97091 43e1f593 f0000001',
  //     p: 'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff',
  //     a: 'ffffffff ffffffff ffffffff fffffffe ffffffff fffffffc',
  //     b: '64210519 e59c80e7 0fa7e9ab 72243049 feb8deec c146b9b1',
  //     n: 'ffffffff ffffffff ffffffff 99def836 146bc9b1 b4d22831',
  //     hash: hash.sha256,
  //     gRed: false,
  //     g: [
  //       '188da80e b03090f6 7cbf20eb 43a18800 f4ff0afd 82ff1012',
  //       '07192b95 ffc8da78 631011ed 6b24cdd5 73f977a1 1e794811',
  //     ],
  //   })
  //   // @ts-ignore
  //   console.dir(elliptic.default.curves)
  //   const a = new elliptic.ec('babyjubjub')
  //
  // })
})
