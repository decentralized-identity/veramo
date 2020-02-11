import express from 'express'
const app = express()
const port = process.env.PORT || 8080

import { core } from './setup'

app.use(express.json())

app.get('/identities', async (req, res) => {
  const identities = await core.identityManager.getIdentities()
  res.json(identities.map(identity => identity.did))
})

app.get('/providers', async (req, res) => {
  const providers = await core.identityManager.getIdentityProviderTypes()
  res.json(providers)
})

app.post('/create-identity', async (req, res) => {
  const identity = await core.identityManager.createIdentity(req.body.type)
  res.json({ did: identity.did })
})

app.post('/handle-action', async (req, res) => {
  const result = await core.handleAction(req.body)
  res.json({ result })
})

app.listen(port, () => console.log(`Server running at http://localhost:${port}`))
