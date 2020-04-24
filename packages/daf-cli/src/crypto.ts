import { SecretBox } from 'daf-libsodium'
import program from 'commander'

program
  .command('crypto')
  .option('-s, --secret', 'Generate secret key')
  .description('Crypto')
  .action(async raw => {
    try {
      const secretKey = await SecretBox.createSecretKey()
      console.log(secretKey)
    } catch (e) {
      console.error(e.message)
    }
  })
