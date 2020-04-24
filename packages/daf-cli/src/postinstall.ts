const fs = require('fs')
import { SecretBox } from 'daf-libsodium'

const defaultPath = process.env.HOME + '/.daf/'
const envFile = defaultPath + '.env'

async function main() {

  if (!fs.existsSync(defaultPath)) {
    fs.mkdirSync(defaultPath)
  }
  
  if (!fs.existsSync(envFile)) {
    console.log('Configuration file does not exist. Creating: ' + envFile)
    let env = 'DAF_DATA_STORE=' + defaultPath + 'database-v3.sqlite3'
    env  += '\nDEBUG_DAF_DB=0'
    env  += '\nDAF_SECRET_KEY=' + await SecretBox.createSecretKey()
    env  += '\nDAF_INFURA_ID=5ffc47f65c4042ce847ef66a3fa70d4c' 
    env  += '\n#DEBUG=daf:*' 
    
    fs.writeFileSync(envFile, env)
  }

}

main().catch(console.error)