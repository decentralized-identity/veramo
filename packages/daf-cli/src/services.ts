import { EventTypes, Message } from 'daf-core'
import { agent } from './setup'
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
  ;(await agent).on(EventTypes.savedMessage, async (msg: Message) => {
    console.log('New message type:', msg.type)
  })

  await (await agent).setupServices()
  await (await agent).listen()
  await (await agent).getMessagesSince([])

  if (pollSeconds) {
    setInterval(async () => {
      await (await agent).getMessagesSince([])
    }, pollSeconds * 1000)
  }
}
