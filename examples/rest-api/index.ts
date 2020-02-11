import express from 'express'
const app = express()
const port = process.env.PORT || 8080
import { Message } from 'daf-core'

import { core } from './setup'

app.get('/identities', async (req, res) => {
  const identities = await core.identityManager.getIdentities()
  res.json(identities.map(identity => identity.did))
})

app.get('/providers', async (req, res) => {
  const providers = await core.identityManager.getIdentityProviderTypes()
  res.json(providers)
})

app.post('/create-identity', express.json(), async (req, res) => {
  const identity = await core.identityManager.createIdentity(req.body.type)
  res.json({ did: identity.did })
})

app.post('/handle-action', express.json(), async (req, res) => {
  const result = await core.handleAction(req.body)
  res.json({ result })
})

app.post('/handle-message', express.text({ type: '*/*' }), async (req, res) => {
  try {
    const result = await core.validateMessage(
      new Message({ raw: req.body, meta: { type: 'serviceEndpoint', id: '/handle-message' } }),
    )
    res.json({ id: result.id })
  } catch (e) {
    res.send(e.message)
  }
})

app.listen(port, () => console.log(`Server running at http://localhost:${port}`))
