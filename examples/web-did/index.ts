import { Message } from 'daf-core'
import { Identity } from 'daf-web-did'
import express from 'express'
import ngrok from 'ngrok'
import parse from 'url-parse'
import { agent } from './setup'

const port = process.env.PORT || 8081
let url: string
let domain: string
let did: string
const messagingEndpoint = '/handle-message'
const app = express()

app.get('/.well-known/did.json', async (req, res) => {
  let identity: Identity
  try {
    identity = (await agent.identityManager.getIdentity(did)) as Identity
  } catch (e) {
    identity = (await agent.identityManager.createIdentity('web-did', { domain })) as Identity
  }

  const didDoc = await identity.identityController.getDidDocument()
  didDoc['service'] = [
    {
      type: 'Messaging',
      serviceEndpoint: url + messagingEndpoint,
    },
  ]
  res.json(didDoc)
})

app.post(messagingEndpoint, express.text({ type: '*/*' }), async (req, res) => {
  try {
    const message = await agent.handleMessage({ raw: req.body, save: true })
    res.json({ id: message.id })
  } catch (e) {
    console.log(e)
    res.send(e.message)
  }
})

app.get('/', async (req, res) => {
  let html = `Send messages to: ${did}<br/>`
  const messages = await (await agent.dbConnection).getRepository(Message).find()
  html += messages
    .map(message => `Type ${message.type}, from: ${message.from?.did}, to: ${message.to?.did}`)
    .join('<br/>')
  res.send(html)
})

app.listen(port, async () => {
  url = await ngrok.connect({ addr: port })
  const parsed = parse(url)
  domain = parsed.hostname
  did = 'did:web:' + domain

  console.log(`${did}`)
  console.log(`Running at ${url}`)
})
