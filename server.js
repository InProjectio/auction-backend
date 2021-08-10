// require("dotenv").config()
const express = require('express')
const compression = require('compression')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { RateLimiterRedis } = require('rate-limiter-flexible')
var needle = require('needle')
const cf = require('./app/helpers/CF')
const authJwt = require('./app/middlewares/authJwt')
const schedule = require('node-schedule')
const ResponseCode = require('./ResponseCode')
const helmet = require('helmet')
const csrf = require('csurf')
const app = express()
const cors = require('cors')
const http = require('http').Server(app)
const config = require('./config')
const BiddingService = require('./app/routes/bidding/service/BiddingService')
const io = require('socket.io').listen(http, {
  pingInterval: config.pingInterval, pingTimeout: config.pingTimeout, path: '/bidSocket',
  // transports: ['websocket',  'polling'],
  // cors: {
  //   origin: "https://cd.tk",
  //   methods: ["GET", "POST"],
  //   credentials: true
  // }
}) 
const ChatSocket = require('./app/socket/ChatSocket')(io)
const db = require('./app/models')

app.io = io;
app.locals.io = io
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


io.use((socket, next) => {
  authJwt.authenSocket(socket, next)
})


app.use(compression())
app.use(cors())
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.header('Access-Control-Allow-Credentials', true)
  return next()
})

// routes
app.use('/api/company', require('./app/routes/company'))
app.use('/api/bidding', require('./app/routes/bidding'))
app.use('/api/chat', require('./app/routes/chat'))

// app.get('/tung', function (req, res) {
//   res.send('hello world')
// })

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  // let err = new Error('Not Found')
  // err.status = 404;
  next(`Not found url: , ${req.originalUrl}`);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  console.log(err)
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).send(cf.buildResponseObject({
      code: ResponseCode.ERROR,
      message: 'Csrf invalid token'
    }))
  }

  // render the error page
  return res.status(403).send(cf.buildResponseObject({
    code: ResponseCode.ERROR,
    message: 'Request Fail'
  }))
})

const autoChangeStatusBidding = schedule.scheduleJob('0 0 1 * * *', async () => {
  await BiddingService.selectingBiddingChangeStatus()
})

// set port, listen for requests
if (config.isHttp) {
  app.listen(config.RUN_PORT, () => {
    console.log(`Server is running http on port ${config.RUN_PORT}.`)
  })
  http.listen(config.SOCKET_PORT, function () {
    console.log('Socket.io Listening on: ' + config.SOCKET_PORT)
  })

} else {
  app.listen(config.RUN_PORT, () => {
    console.log(`Server is running on port ${config.RUN_PORT}.`)
  })

  // httpsSocket.listen(config.SOCKET_PORT, () => {
  //   console.log(`API https socket is listening on port: ${config.SOCKET_PORT}`);
  // })
}