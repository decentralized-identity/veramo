import express from 'express'
import { agent } from './setup'
import { AgentExpressMiddleware } from 'daf-express'

const app = express()
app.use(express.json())

app.use(
  AgentExpressMiddleware({
    agent,
    prefix: '/agent',
    // methods: agent.availableMethods(),
    methods: [
      'resolveDid',
      'identityManagerGetProviders',
      'identityManagerGetIdentities',
      'identityManagerGetIdentity',
      'identityManagerCreateIdentity',
    ],
  }),
)

app.listen(3002)
