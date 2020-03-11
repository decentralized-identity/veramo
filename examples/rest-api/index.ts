import express from 'express'
const app = express()
const port = process.env.PORT || 8080
import { Message, Entities } from 'daf-core'
import { createConnection } from 'typeorm'

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
  try {
    const identity = await core.identityManager.createIdentity(req.body.type)
    res.json({ did: identity.did })
  } catch (e) {
    res.status(404)
    res.send(e)
  }
})

app.post('/handle-action', express.json(), async (req, res) => {
  try {
    const result = await core.handleAction(req.body)
    res.json({ result })
  } catch (e) {
    res.status(404)
    res.send(e)
  }
})

// This endpoint would be published in did doc as a serviceEndpoint
app.post('/handle-message', express.text({ type: '*/*' }), async (req, res) => {
  try {
    const message = await core.validateMessage(
      new Message({ raw: req.body, meta: { type: 'serviceEndpoint', value: 'handle-message' } }),
    )

    await message.save()
    // now you can store this message or pass through to some webhook

    res.json({ id: message.id })
  } catch (e) {
    res.send(e.message)
  }
})

createConnection({
  type: 'sqlite',
  database: './database.sqlite',
  synchronize: true,
  logging: true,
  entities: Entities,
}).then(() => {
  app.listen(port, () => console.log(`Server running at http://localhost:${port}`))
})
