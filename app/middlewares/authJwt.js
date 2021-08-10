const jwt = require('jsonwebtoken')
const config = require('../../config')
const { User } = require('../models').dbInproject

const authDefault = (req, res, next) => {
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, Origin, Content-Type, Accept"
  );
  next()
}

const authen = async (req, res, next) => {

  // const user = await User.findById('60f9573c583eb541d9ec5e53');
  // return user;
  let token = req.headers['authorization']

  if (!token) {
    return res.status(403).send({ message: 'No token provided!' })
  }

  // token = token.split(' ')[1]

  jwt.verify(token, config.secret, async (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized!' })
    }
    req.user = decoded;
    next()
  })
}

const authenSocket = (socket, next) => {
  const token = socket.handshake.query.token
  console.log('============================= socket:', socket.id);
  if (token) {
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return next(new Error('Unauthorized!'))
      } else {
        socket.userId = decoded._id
        next()
      }
    })
  } else {
    next(new Error('Unauthorized!'))
  }
}

const authJwt = {
  authDefault,
  authen,
  authenSocket
}
module.exports = authJwt;
