import * as path from 'path'
import { resolve } from 'path'
import { existsSync, readdirSync, copyFileSync, mkdirSync, unlinkSync } from 'fs'

const outputFolder = './temp'
const { documentPackages } = require('../docsconfig.json')

if (!existsSync(resolve(outputFolder))) {
  console.log('Creating', outputFolder)
  mkdirSync(resolve(outputFolder))
} else {
  console.log('Removing files in', outputFolder)
  readdirSync(resolve(outputFolder)).forEach((file) => {
    unlinkSync(resolve(outputFolder, file))
  })
}

for (const packageName of documentPackages) {
  const apiDocsPath: string = path.join(__dirname, `../packages/${packageName}/api`)

  readdirSync(apiDocsPath).forEach((file) => {
    console.log('Copying', resolve(outputFolder, file))
    copyFileSync(resolve(apiDocsPath, file), resolve(outputFolder, file))
  })
}
