import { EventTypes, Types } from 'daf-core'
import { core, dataStore } from './setup'
import program from 'commander'

program
  .command('listen')
  .description('Receive new messages and listen for new ones')
  .action(async cmd => {
    await listen()
  })

export const listen = async () => {
  await dataStore.initialize()

  core.on(EventTypes.validatedMessage, async (type, msg: Types.ValidatedMessage) => {
    console.log('New message type:', msg.type)
    await dataStore.saveMessage(msg)
  })

  await core.startServices()
  await core.syncServices(await dataStore.latestMessageTimestamps())
}
