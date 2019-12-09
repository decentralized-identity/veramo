import * as Daf from 'daf-core'
import { core } from './setup'
import program from 'commander'

program
  .command('msg <raw>')
  .description('Handle raw message (JWT)')
  .action(async raw => {
    try {
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
