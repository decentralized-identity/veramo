import * as Daf from 'daf-core'
import { core, dataStore, initializeDb } from './setup'
import program from 'commander'

program
  .command('msg <raw>')
  .description('Handle raw message (JWT)')
  .action(async raw => {
    try {
      await initializeDb()
      const message = await core.validateMessage(
        new Daf.Message({
          raw,
          meta: { type: 'cli' },
        }),
      )
      console.log(message)
    } catch (e) {
      console.error(e)
    }
  })
