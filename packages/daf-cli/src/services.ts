import { EventTypes, Types } from 'daf-core'
import { core, dataStore } from './setup'
import program from 'commander'

program
  .command('listen')
  .description('Receive new messages and listen for new ones')
  .action(async (did) => {
    await dataStore.initialize()

    core.on(EventTypes.validatedMessage, (type, msg: Types.ValidatedMessage) => {
      console.log('New message type:', msg.type)
    })

    await core.startServices()
    await core.syncServices(
      await dataStore.latestMessageTimestamps()
    )
  })
  