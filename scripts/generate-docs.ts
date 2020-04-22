import * as path from 'path'
import { Extractor, ExtractorConfig, ExtractorResult } from '@microsoft/api-extractor'

const configs = [
  '../packages/daf-core/api-extractor.json',
  '../packages/daf-did-jwt/api-extractor.json',
  '../packages/daf-ethr-did/api-extractor.json',
  '../packages/daf-fs/api-extractor.json',
  '../packages/daf-libsodium/api-extractor.json',
  '../packages/daf-local-storage/api-extractor.json',
  '../packages/daf-react-native-async-storage/api-extractor.json',
  '../packages/daf-react-native-libsodium/api-extractor.json',
  '../packages/daf-resolver/api-extractor.json',
  '../packages/daf-resolver-universal/api-extractor.json',
  '../packages/daf-selective-disclosure/api-extractor.json',
  '../packages/daf-trust-graph/api-extractor.json',
  '../packages/daf-url/api-extractor.json',
  '../packages/daf-w3c/api-extractor.json',
]

for (const config of configs) {
  const apiExtractorJsonPath: string = path.join(__dirname, config)

  // Load and parse the api-extractor.json file
  const extractorConfig: ExtractorConfig = ExtractorConfig.loadFileAndPrepare(apiExtractorJsonPath)

  // Invoke API Extractor
  const extractorResult: ExtractorResult = Extractor.invoke(extractorConfig, {
    // Equivalent to the "--local" command-line parameter
    localBuild: true,

    // Equivalent to the "--verbose" command-line parameter
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
