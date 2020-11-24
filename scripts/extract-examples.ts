import { resolve } from 'path'
import { writeFileSync, readFileSync } from 'fs'
import * as TJS from 'ts-json-schema-generator'
import {
  ApiModel,
  ApiPackage,
  ApiParameterListMixin,
  ApiDocumentedItem,
  ApiReturnTypeMixin,
  ApiMethodSignature,
} from '@microsoft/api-extractor-model'

import { DocFencedCode } from '@microsoft/tsdoc'

const apiExtractorConfig = require('../api-extractor-base.json')

const agentPlugins: Record<string, Array<string>> = {
  'daf-core': ['IResolver', 'IIdentityManager', 'IMessageHandler', 'IDataStore', 'IKeyManager'],
  'daf-w3c': ['ICredentialIssuer'],
  'daf-selective-disclosure': ['ISelectiveDisclosure'],
  'daf-did-comm': ['IDIDComm'],
  'daf-typeorm': ['IDataStoreORM'],
}

interface RestMethod {
  packageName: string
  pluginInterfaceName: string
  operationId: string
  description?: string
  example?: DocFencedCode
  parameters?: string
  response: string
}

let allMethods: Array<RestMethod> = []

for (const packageName of Object.keys(agentPlugins)) {
  const generator = TJS.createGenerator({
    path: resolve('packages/' + packageName + '/src/index.ts'),
    encodeRefs: false,
  })

  const apiModel: ApiModel = new ApiModel()
  const apiPackage = apiModel.loadPackage(
    (apiExtractorConfig.docModel.apiJsonFilePath as string).replace('<unscopedPackageName>', packageName),
  )

  const entry = apiPackage.entryPoints[0]

  for (const pluginInterfaceName of agentPlugins[packageName]) {
    console.log(packageName, pluginInterfaceName)
    const pluginInterface = entry.findMembersByName(pluginInterfaceName)[0]

    // Collecting method information
    const methods: RestMethod[] = []
    for (const member of pluginInterface.members) {
      const method: Partial<RestMethod> = {}
      method.packageName = packageName
      method.pluginInterfaceName = pluginInterfaceName
      method.operationId = member.displayName
      // console.log(member)
      method.parameters = (member as ApiParameterListMixin).parameters[0]?.parameterTypeExcerpt?.text
      method.response = (member as ApiReturnTypeMixin).returnTypeExcerpt.text
        .replace('Promise<', '')
        .replace('>', '')

      const methodSignature = member as ApiMethodSignature
      method.description = methodSignature.tsdocComment?.summarySection
        ?.getChildNodes()[0]
        //@ts-ignore
        ?.getChildNodes()[0]?.text

      method.example = methodSignature.tsdocComment?.customBlocks[0]?.content?.getChildNodes()[1] as DocFencedCode

      method.description = method.description || ''

      methods.push(method as RestMethod)
    }

    allMethods = allMethods.concat(methods)
  }
}

let summary = '# Available agent methods\n'
for (const packageName of Object.keys(agentPlugins)) {
  // summary += `## [${packageName}](./api/${packageName}.md) \n\n`
  for (const pluginInterfaceName of agentPlugins[packageName]) {
    summary += `## [${pluginInterfaceName}](./api/${packageName}.${pluginInterfaceName.toLowerCase()}.md) \n\n`

    for (const method of allMethods.filter(
      (m) => m.packageName === packageName && m.pluginInterfaceName == pluginInterfaceName,
    )) {
      summary += `\n### [${method.operationId}](./api/${
        method.packageName
      }.${method.pluginInterfaceName.toLowerCase()}.${method.operationId.toLowerCase()}.md)`
      summary += `\n\n${method.description}\n\n`
      if (method.example) {
        summary += '```' + method.example.language + '\n'
        summary += method.example.code
        summary += '```\n'
      }
    }
  }
}

writeFileSync('docs/methods.md', summary)

let tests = ''
for (const method of allMethods) {
  if (method.example) {
    tests += `\nit('${method.packageName}-${method.pluginInterfaceName}-${method.operationId} example', async () => {\n${method.example.code}\n})\n`
  }
}
tests = `DO NOT EDIT MANUALLY START\n ${tests}\n//DO NOT EDIT MANUALLY END`

const testsFile = '__tests__/shared/documentationExamples.ts'
const source = readFileSync(testsFile).toString()
const newSource = source.replace(/DO NOT EDIT MANUALLY START(.+?)DO NOT EDIT MANUALLY END/s, tests)
writeFileSync(testsFile, newSource)
