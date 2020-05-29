import { ConnectionOptions } from 'typeorm'
const fs = require('fs')

export interface Configuration {
  identityProviders: {
    package: 'daf-ethr-did' | 'daf-elem-did' | 'daf-web-did'
    network: string
    rpcUrl?: string
    apiUrl?: string
    gas?: number
    ttl?: number
    registry?: string
  }[]
  ethrDidNetworks: {
    name: string
    rpcUrl: string
    registry?: string
  }[]
  database: ConnectionOptions
  graphql: {
    apiKey?: string
    resolvers: {
      IdentityManager: boolean
      TrustGraph: boolean
      DIDComm: boolean
      W3c: boolean
      Sdr: boolean
    }
  }
}

const defaultPath = process.env.HOME + '/.daf/'
const configFile = process.env.DAF_CONFIG || defaultPath + 'config.js'

export const getConfiguration = (): Configuration => {
  if (!fs.existsSync(configFile)) {
    console.log('Config file does not exist. Creating: ' + configFile)
    const contents = fs.readFileSync(__dirname + '/../default/config.js')
    fs.writeFileSync(configFile, contents)
  }
  const configuration: Configuration = require(configFile)
  return configuration
}
