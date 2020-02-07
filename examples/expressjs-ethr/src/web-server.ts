import express from 'express'
import * as Daf from 'daf-core'
import * as SD from 'daf-selective-disclosure'
import * as W3C from 'daf-w3c'
import session, { MemoryStore } from 'express-session'
import socketio from 'socket.io'
import http from 'http'
import exphbs from 'express-handlebars'

import sharedsession from 'express-socket.io-session'

const bodyParser = require('body-parser')
import { core, dataStore } from './setup'

import Debug from 'debug'
const debug = Debug('main')

const app = express()
app.use(bodyParser.text())
const sessionStore = new MemoryStore()
const sess = session({
  secret: 'keyboard cat',
  cookie: { maxAge: 10 * 60000 },
  saveUninitialized: true,
  resave: true,
  store: sessionStore,
})
app.use(sess)

app.engine('handlebars', exphbs())
app.set('view engine', 'handlebars')

const server = http.createServer(app)
const io = socketio(server)

io.use(
  sharedsession(sess, {
    autoSave: true,
  }),
)

io.on('connection', function(socket) {
  if (socket.handshake?.session) {
    socket.join(socket.handshake.session.id)
  }
  socket.on('disconnect', function() {
    console.log('user disconnected')
  })
})

async function main() {
  await dataStore.initialize()

  // Get of create new identity
  let identity: Daf.AbstractIdentity
  const identities = await core.identityManager.getIdentities()
  if (identities.length > 0) {
    identity = identities[0]
  } else {
    const identityProviders = await core.identityManager.getIdentityProviderTypes()
    identity = await core.identityManager.createIdentity(identityProviders[0].type)
  }

  app.get('/', async function(req, res) {
    if (!req.session) {
      return
    }
    let viewcount = 1
    if (req.session.viewcount) {
      req.session.viewcount++
    } else {
      req.session.viewcount = 1
    }
    viewcount = req.session.viewcount

    console.log('APP SID', req.session.id)

    const did = req.session.did
    console.log({ did })
    let jwt
    let name
    if (!did) {
      const signAction: SD.ActionSignSdr = {
        type: SD.ActionTypes.signSdr,
        did: identity.did,
        data: {
          tag: req.sessionID,
          claims: [
            {
              reason: 'We need this information',
              essential: true,
              claimType: 'name',
            },
          ],
        },
      }

      jwt = await core.handleAction(signAction)
      jwt = encodeURI('http://localhost:8099/ssi?c_i=') + jwt
    } else {
      name = await dataStore.shortId(did)
    }

    const template = did ? 'home' : 'login'

    res.render(template, { viewcount, did, name, jwt })
  })

  app.get('/logout', (req, res) =>
    req.session?.destroy(function(err) {
      res.redirect('/')
    }),
  )

  core.on(Daf.EventTypes.validatedMessage, async (message: Daf.Message) => {
    debug('New message %s', message.id)
    debug('Meta %O', message.meta)
    console.log(message)
    await dataStore.saveMessage(message)
    if (message.type === W3C.MessageTypes.vp && message.threadId) {
      // TODO check for required vcs

      const sessionId = message.threadId
      await io.in(sessionId).emit('loggedin', { did: message.sender })
      sessionStore.get(sessionId, (error, session) => {
        if (error) {
          console.log(error)
          return
        }
        if (session) {
          console.log('Got session', session)
          console.log('View count', session.viewcount)
          session.did = message.sender
          sessionStore.set(sessionId, session)
        } else {
          console.log('No session: ' + message.threadId)
        }
      })
    }
  })

  const port = 8099
  server.listen(port, async () => {
    console.log(`Server running at http://localhost:${port}/`)

    await core.setupServices()
    await core.listen()
    await core.getMessagesSince(await dataStore.latestMessageTimestamps())
  })
}

main().catch(debug)
