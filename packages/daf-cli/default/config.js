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
      package: 'daf-ethr-did',
      network: 'ropsten',
      rpcUrl: 'https://ropsten.infura.io/v3/' + process.env.DAF_INFURA_ID,
    },
    {
      package: 'daf-ethr-did',
      network: 'mainnet',
      rpcUrl: 'https://mainnet.infura.io/v3/' + process.env.DAF_INFURA_ID,
    },
    {
      package: 'daf-ethr-did',
      network: 'private',
      rpcUrl: 'http://localhost:8545/',
      registry: '0x05cc574b19a3c11308f761b3d7263bd8608bc532',
    },
    // {
    //   package: 'daf-elem-did',
    //   network: 'ropsten',
    //   apiUrl: 'https://element-did.com/api/v1/sidetree',
    // },
  ],
  ethrDidNetworks: [
    {
      name: 'mainnet',
      rpcUrl: 'https://mainnet.infura.io/v3/' + process.env.DAF_INFURA_ID,
    },
    {
      name: 'rinkeby',
      rpcUrl: 'https://rinkeby.infura.io/v3/' + process.env.DAF_INFURA_ID,
    },
    {
      name: 'ropsten',
      rpcUrl: 'https://ropsten.infura.io/v3/' + process.env.DAF_INFURA_ID,
    },
    {
      name: 'kovan',
      rpcUrl: 'https://kovan.infura.io/v3/' + process.env.DAF_INFURA_ID,
    },
    {
      name: 'goerli',
      rpcUrl: 'https://goerli.infura.io/v3/' + process.env.DAF_INFURA_ID,
    },
    {
      name: 'private',
      rpcUrl: 'http://localhost:8545/',
      registry: '0x05cc574b19a3c11308f761b3d7263bd8608bc532',
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
    },
  },
}
