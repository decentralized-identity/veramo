import { getAgent } from './setup'
import program from 'commander'

program
  .command('msg <raw>')
  .description('Handle raw message (JWT)')
  .action(async (raw) => {
    const agent = getAgent(program.config)
    try {
      const message = await agent.handleMessage({ raw, metaData: [{ type: 'cli' }], save: true })
      console.dir(message, { depth: 10 })
    } catch (e) {
      console.error(e.message)
    }
  })
