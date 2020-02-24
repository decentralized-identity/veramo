import express from 'express'
import session, { MemoryStore } from 'express-session'
import socketio from 'socket.io'
import http from 'http'
import handlebars from 'express-handlebars'
import sharedSession from 'express-socket.io-session'

const app = express()
app.engine('handlebars', handlebars())
app.set('view engine', 'handlebars')
app.use(express.text())

const sessionStore = new MemoryStore()
const sess = session({
  secret: 'keyboard cat',
  cookie: { maxAge: 10 * 60000 },
  saveUninitialized: true,
  resave: true,
  store: sessionStore,
})
app.use(sess)

const server = http.createServer(app)
const io = socketio(server)

io.use(
  sharedSession(sess, {
    autoSave: true,
  }),
)

io.on('connection', function(socket) {
  if (socket.handshake?.session) {
    socket.join(socket.handshake.session.id)
  }
})

export { app, server, io, sessionStore }
