import * as Daf from 'daf-core'
import { core, dataStore } from './setup'
import program from 'commander'

program
  .command('msg <raw>')
  .description('Handle raw message (JWT)')
  .action(async raw => {
    try {
      await dataStore.initialize()
      const result = await core.validateMessage(
        new Daf.Message({
          raw,
          meta: { type: 'cli' },
        }),
      )
      console.log(result)
    } catch (e) {
      console.error(e)
    }
  })
