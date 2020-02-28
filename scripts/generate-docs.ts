import * as path from 'path'
import { Extractor, ExtractorConfig, ExtractorResult } from '@microsoft/api-extractor'

const configs = ['../packages/daf-core/api-extractor.json', '../packages/daf-data-store/api-extractor.json']

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
