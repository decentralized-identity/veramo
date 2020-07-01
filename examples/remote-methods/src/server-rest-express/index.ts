import express from 'express'
import { agent } from './setup'
import { AgentRouter } from 'daf-express'

const agentRouter = AgentRouter({
  getAgentForRequest: async req => agent,
  exposedMethods: [
    'resolveDid',
    'identityManagerGetProviders',
    'identityManagerGetIdentities',
    'identityManagerGetIdentity',
    'identityManagerCreateIdentity',
    'handleMessage',
    'dataStoreORMGetMessages',
    'dataStoreSaveMessage',
    'createVerifiableCredential',
    'createVerifiablePresentation',
    'createSelectiveDisclosureRequest',
    'getVerifiableCredentialsForSdr',
    'dataStoreORMGetVerifiableCredentials',
  ],
})

const app = express()
app.use('/agent', agentRouter)

app.listen(3002)
