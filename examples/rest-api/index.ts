import express from 'express'
const app = express()
const port = process.env.PORT || 8080

import { agent } from './setup'

app.get('/identities', async (req, res) => {
  const identities = await agent.identityManager.getIdentities()
  res.json(identities.map((identity: any) => identity.did))
})

app.get('/providers', async (req, res) => {
  const providers = await agent.identityManager.getIdentityProviders()
  res.json(
    providers.map((provider: any) => {
      provider.type, provider.description
    }),
  )
})

app.post('/create-identity', express.json(), async (req, res) => {
  try {
    const identity = await agent.identityManager.createIdentity(req.body.type)
    res.json({ did: identity.did })
  } catch (e) {
    res.status(404)
    res.send(e)
  }
})

app.post('/handle-action', express.json(), async (req, res) => {
  try {
    const result = await agent.handleAction(req.body)
    res.json({ result })
  } catch (e) {
    res.status(404)
    res.send(e)
  }
})

// This endpoint would be published in did doc as a serviceEndpoint
app.post('/handle-message', express.text({ type: '*/*' }), async (req, res) => {
  try {
    const message = await agent.handleMessage({ raw: req.body })

    // add your business logic here

    res.json({ id: message.id })
  } catch (e) {
    res.send(e.message)
  }
})

app.listen(port, () => console.log(`Server running at http://localhost:${port}`))
