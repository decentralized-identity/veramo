import { core } from './setup'
import program from 'commander'

program
  .command('msg <raw>')
  .description('Handle raw message (JWT)')
  .action(async raw => {
    try {
      const result = await core.onRawMessage({
        raw,
        meta: [
          {
            sourceType: 'cli',
          },
        ],
      })
      console.log(result)
    } catch (e) {
      console.error(e)
    }
  })
