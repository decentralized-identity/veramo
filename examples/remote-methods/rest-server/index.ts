// TODO https://expressjs.com/en/guide/writing-middleware.html

var express = require('express')
var app = express()

app.use(
  new DafExpressMiddleware({
    agent,
    methods: ['handleMessage', 'saveMessage'],
  }),
)

app.listen(3000)
