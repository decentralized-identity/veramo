import { EventTypes, Types } from 'daf-core'
import { core, dataStore } from './setup'
import program from 'commander'
import { setInterval } from 'timers'

program
  .command('listen')
  .description('Receive new messages and listen for new ones')
  .option('-i, --interval <seconds>', 'Poll for new messages with interval of <seconds>')
  .action(async cmd => {
    await listen(cmd.interval)
  })

export const listen = async (pollSeconds?: number) => {
  await dataStore.initialize()

  core.on(EventTypes.validatedMessage, async (msg: Types.ValidatedMessage) => {
    console.log('New message type:', msg.type)
  })

  await core.startServices()
  await core.syncServices(await dataStore.latestMessageTimestamps())

  if (pollSeconds) {
    setInterval(async () => {
      await core.syncServices(await dataStore.latestMessageTimestamps())
    }, pollSeconds * 1000)
  }
}
