var fs = require('fs')

module.exports = {
  identityProviders: [
    {
      package: 'daf-ethr-did',
      network: 'rinkeby',
      rpcUrl: 'https://rinkeby.infura.io/v3/' + process.env.DAF_INFURA_ID,
      gas: 10001,
      ttl: 60 * 60 * 24 * 30 * 12 + 1,
    },
    {
      package: 'daf-elem-did',
      network: 'ropsten',
      apiUrl: 'https://element-did.com/api/v1/sidetree',
    },
  ],
  ethrDidNetworks: [
    {
      name: 'mainnet',
      rpcUrl: 'https://mainnet.infura.io/v3/' + process.env.DAF_INFURA_ID
    },
    {
      name: 'rinkeby',
      rpcUrl: 'https://rinkeby.infura.io/v3/' + process.env.DAF_INFURA_ID
    },

  ],
  // https://typeorm.io/#/connection-options
  database: {
    type: 'sqlite',
    synchronize: !fs.existsSync(process.env.DAF_DATA_STORE),
    database: process.env.DAF_DATA_STORE,
    logging: process.env.DAF_DEBUG_DB === 'true' ? true : false,
    migrationsRun: true,
  },
  graphql: {
    apiKey: process.env.DAF_GRAPHQL_API_KEY, 
    resolvers: {
      IdentityManager: true,
      TrustGraph: false,
      DIDComm: true,
      W3c: true,
      Sdr: true,
    }
  }
}