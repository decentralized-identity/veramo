import { agent } from './setup'
import program from 'commander'

program
  .command('resolve <did>')
  .description('Resolve DID Document')
  .action(async did => {
    try {
      const ddo = await (await agent).didResolver.resolve(did)
      console.log(ddo)
    } catch (e) {
      console.error(e)
    }
  })
