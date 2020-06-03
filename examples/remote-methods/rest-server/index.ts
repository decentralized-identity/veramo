// TODO https://expressjs.com/en/guide/writing-middleware.html

import express, { Request, Response, NextFunction } from 'express'
import { agent } from './setup'

const app = express()
app.use(express.json())

interface RestEndpoint {
  method: 'POST' | 'GET'
  name: string
  path: string
}

function DafExpressMiddleware(options: { agent: any; methods: RestEndpoint[]; prefix: string }) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.path === options.prefix) {
      const method = '' // todo
      const result = await agent.execute(method, req.body)
      res.json(result)
    }
    next()
  }
}

app.use(
  DafExpressMiddleware({
    prefix: '/daf/v1/',
    agent,
    methods: [
      { path: 'messages/handle', name: 'handleMessage', method: 'POST' },
      { path: 'messages/save', name: 'saveMessage', method: 'POST' },
    ],
  }),
)
// example.com/daf/v1/handleMessage
app.listen(3000)
