import { getAgent } from './setup.js'
import { Command } from 'commander'
import fs from 'fs'

const message = new Command('message').description('Messages')

message
  .command('handle', { isDefault: true })
  .description('Handle raw message ')
  .option('-r, --raw <string>', 'String containing raw message')
  .option('-f, --file <string>', 'Path to a file containing raw message')
  .option('--save <boolean>', 'Save message', true)

  .action(async (options: { file: string; raw: string; save: boolean }, cmd: Command) => {
    const agent = await getAgent(cmd.optsWithGlobals().config)
    try {
      let raw

      if (options.file) {
        raw = fs.readFileSync(options.file).toString()
      } else if (options.raw) {
        raw = options.raw
      } else {
        throw Error('Missing file path or raw string')
      }

      const message = await agent.handleMessage({
        raw,
        metaData: [{ type: 'cli' }],
        save: options.save,
      })

      console.dir(message, { depth: 10 })
    } catch (e: any) {
      console.error(e.message)
    }
  })

export { message }
