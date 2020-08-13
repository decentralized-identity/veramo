import * as path from 'path'
import { Extractor, ExtractorConfig, ExtractorResult } from '@microsoft/api-extractor'

const configs = [
  '../packages/daf-core/api-extractor.json',
  '../packages/daf-did-comm/api-extractor.json',
  // '../packages/daf-did-jwt/api-extractor.json',
  // '../packages/daf-ethr-did/api-extractor.json',
  // '../packages/daf-express/api-extractor.json',
  // '../packages/daf-graphql/api-extractor.json',
  // '../packages/daf-libsodium/api-extractor.json',
  // '../packages/daf-resolver/api-extractor.json',
  // '../packages/daf-resolver-universal/api-extractor.json',
  // '../packages/daf-rest/api-extractor.json',
  '../packages/daf-selective-disclosure/api-extractor.json',
  '../packages/daf-typeorm/api-extractor.json',
  '../packages/daf-url/api-extractor.json',
  '../packages/daf-w3c/api-extractor.json',
]

for (const config of configs) {
  const apiExtractorJsonPath: string = path.join(__dirname, config)
  const extractorConfig: ExtractorConfig = ExtractorConfig.loadFileAndPrepare(apiExtractorJsonPath)
  const extractorResult: ExtractorResult = Extractor.invoke(extractorConfig, {
    localBuild: true,
    showVerboseMessages: true,
  })

  if (!extractorResult.succeeded) {
    console.error(
      `API Extractor completed with ${extractorResult.errorCount} errors` +
        ` and ${extractorResult.warningCount} warnings`,
    )
    process.exitCode = 1
    break
  }
}
