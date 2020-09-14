import { getAgent } from './setup'
import program from 'commander'

program
  .command('resolve <didUrl>')
  .description('Resolve DID Document')
  .action(async (didUrl) => {
    const agent = getAgent(program.config)
    try {
      const ddo = await agent.resolveDid({ didUrl })
      console.log(ddo)
    } catch (e) {
      console.error(e.message)
    }
  })
