import { Command } from 'commander'
import inquirer from 'inquirer'
import { getAgent } from './setup.js'
import fs from 'fs'
import fuzzy from 'fuzzy'
import Debug from 'debug'

const debug = Debug('veramo:cli:execute')

const execute = new Command('execute')
  .description('Execute agent method')
  .option('-m, --method <string>', 'Method name')
  .option('-a, --argsJSON <string>', 'Method arguments')
  .option('-f, --argsFile <string>', 'Path to a file containing method arguments in a JSON string')
  .action(async (options: { method: string; argsJSON?: string; argsFile?: string }, cmd: Command) => {
    const agent = await getAgent(cmd.optsWithGlobals().config)

    try {
      let method = options.method
      let argsString = options.argsJSON
      let argsFile = options.argsFile
      let argsObj

      if (!method) {
        const answers = await inquirer.prompt({
          // @ts-ignore
          type: 'autocomplete',
          name: 'method',
          pageSize: 15,
          // suggestOnly: true,
          source: async (answers: any, search: string) => {
            const res = fuzzy
              .filter(search, agent.availableMethods())
              .map((el: any) => (typeof el === 'string' ? el : el.original))
            return res
          },
          message: 'Method',
        })
        method = answers.method
      }

      if (!argsString && !argsFile) {
        console.error(`No arguments provided for execute method=${method}`)
        process.exit(1)
      } else {
        debug(`Attempting to extract method arguments from file (${argsFile})`)
        if (argsFile) {
          argsString = fs.readFileSync(argsFile).toString('utf-8')
        }
        try {
          argsObj = JSON.parse(argsString!)
        } catch (e: any) {
          console.error('could not parse arguments JSON')
          process.exit(1)
        }
      }

      debug('\nMethod: ', method)
      debug('\nArguments: ', JSON.stringify(argsObj, null, 2))

      const result = await agent.execute(method, argsObj)

      debug('\nResult: ', JSON.stringify(result, null, 2))
      console.log(JSON.stringify(result))
    } catch (e: any) {
      console.error(e.message)
    }
  })

export { execute }
