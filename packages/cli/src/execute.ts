import { Command } from 'commander'
import inquirer from 'inquirer'
import { getAgent } from './setup.js'
import fs from 'fs'
import OasResolver from 'oas-resolver'
import fuzzy from 'fuzzy'

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

      const { openapi } = await OasResolver.resolve(agent.getSchema(), null, { resolveInternal: true })

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
      const methodApi = openapi.components.methods[method]

      if (!argsString && !argsFile) {
        // parse schema, generate options

        const questions = []
        // console.log(methodApi.arguments.type)
        if (methodApi.arguments.type === 'object') {
          for (const property in methodApi.arguments.properties) {
            const propertySchema = methodApi.arguments.properties[property]
            // console.log({property, propertySchema})
            let question: any = {
              name: property,
              message: property + ' - ' + propertySchema.description,
            }

            // TODO handle anyOf
            switch (propertySchema.type) {
              case 'object':
                question.type = 'input'
                question.filter = (input: string) => JSON.parse(input === '' ? '{}' : input)
                question.transformer = (input: object) => JSON.stringify(input)
                break
              case 'string':
                question.type = 'input'
                break
              case 'number':
                question.type = 'number'
                break
              case 'boolean':
                question.type = 'confirm'
                break
              // TODO
              case 'array':
              default:
                console.log(`Method argument type ${propertySchema.type} not supported yet`)
                process.exit(1)
            }

            if (question.type) {
              if (propertySchema.enum) {
                question.type = 'list'
                question.choices = propertySchema.enum
              }
              questions.push(question)
            }
          }
        }

        argsObj = await inquirer.prompt(questions)
      } else {
        if (argsFile) {
          console.log({ argsFile })
          argsString = fs.readFileSync(argsFile).toString('utf-8')
        }
        try {
          argsObj = JSON.parse(argsString!)
        } catch (e: any) {
          console.error('could not parse arguments JSON')
        }
      }

      console.log('\nMethod: ', method)
      console.log('\nArguments: ', JSON.stringify(argsObj, null, 2))

      const result = await agent.execute(method, argsObj)

      console.log(
        '\nResult',
        methodApi.returnType.description ? `(${methodApi.returnType.description}):` : ':',
        JSON.stringify(result, null, 2),
      )
    } catch (e: any) {
      console.error(e.message)
    }
  })

export { execute }
