import { resolve } from 'path'
import { existsSync, readdirSync, copyFileSync, mkdirSync, unlinkSync } from 'fs'
const outputFolder = './temp'
const inputFolders = [
  'packages/daf-core/api/',
  'packages/daf-did-comm/api/',
  'packages/daf-did-jwt/api/',
  'packages/daf-ethr-did/api/',
  'packages/daf-express/api/',
  'packages/daf-graphql/api/',
  'packages/daf-libsodium/api/',
  'packages/daf-resolver/api/',
  'packages/daf-resolver-universal/api/',
  'packages/daf-rest/api/',
  'packages/daf-selective-disclosure/api/',
  'packages/daf-typeorm/api/',
  'packages/daf-url/api/',
  'packages/daf-w3c/api/',
  'packages/daf-web-did/api/',
  'packages/daf-key-manager/api/',
  'packages/daf-identity-manager/api/',
  'packages/daf-message-handler/api/',
]

console.log('here')
if (!existsSync(resolve(outputFolder))) {
  console.log('Creating', outputFolder)
  mkdirSync(resolve(outputFolder))
} else {
  console.log('Removing files in', outputFolder)
  readdirSync(resolve(outputFolder)).forEach(file => { 
    unlinkSync(resolve(outputFolder, file))
  })
}

for (const inputFolder of inputFolders) {
  readdirSync(resolve(inputFolder)).forEach(file => { 
    console.log('Copying', resolve(outputFolder, file))
    copyFileSync(resolve(inputFolder, file), resolve(outputFolder, file))
  }) 
}