import express from 'express'
import { agent } from './setup'
import { AgentExpressMiddleware } from '../lib/daf-expressjs'

const app = express()
app.use(express.json())

app.use(
  AgentExpressMiddleware({
    agent,
    prefix: '/agent',
    methods: agent.availableMethods(),
    // methods: ['resolve'],
  }),
)

app.listen(3002)
