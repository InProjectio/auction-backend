const db = require('../models')
let Validator = require('validatorjs')

const User = db.User
const Role = db.Role
const ResponseCode = require('../../ResponseCode')
const cf = require('../helpers/CF')
const message = require('../../message')

const validateInputSignup = (req, res, next) => {
  let {
    username,
    password,
    fullName,
    phoneNumber,
    address,
    region
  } = req.body
  // set language
  let lang = req.headers['lang'] || 'vi'
  Validator.useLang(lang)
  // create validation rule
  let validation = new Validator({
    username,
    password,
    fullName,
    phoneNumber,
    address,
    region
  }, {
    username: 'required|max: 20',
    password: 'min:6',
    fullName: 'required',
    phoneNumber: ['required', 'max: 12', 'regex:/^(84|0[3|5|7|8|9])+([0-9]{8})$/'],
    address: 'required|max: 200',
    region: 'required'
  })


  validation.setAttributeNames({
    username: message[lang]['username'],
    password: message[lang]['password'],
    fullName: message[lang]['fullName'],
    phoneNumber: message[lang]['phoneNumber'],
    address: message[lang]['address'],
    region: message[lang]['region']
  });

  if (validation.fails()) {
    if (validation.errors.first('username')) {
      return handleValidationErr(res, validation.errors.first('username'))
    }
    if (validation.errors.first('password')) {
      return handleValidationErr(res, validation.errors.first('password'))
    }
    if (validation.errors.first('fullName')) {
      return handleValidationErr(res, validation.errors.first('fullName'))
    }
    if (validation.errors.first('phoneNumber')) {
      return handleValidationErr(res, validation.errors.first('phoneNumber'))
    }
    if (validation.errors.first('address')) {
      return handleValidationErr(res, validation.errors.first('address'))
    }
    if (validation.errors.first('region')) {
      return handleValidationErr(res, validation.errors.first('region'))

    }
  }
  next()
}

const validateInputSignupAdmin = async (req, res, next) => {
  let { username, unit, fullName, email, phoneNumber } = req.body
  // set language
  let lang = req.headers['lang'] || 'vi'
  Validator.useLang(lang)

  // create validation rule
  let validation = new Validator({
    // username,
    unit,
    fullName,
    email,
    phoneNumber,
  }, {
    // username: 'required|max: 20',
    unit: 'required',
    fullName: 'required',
    email: 'required|email',
    phoneNumber: ['required', 'max: 12', 'regex:/^(84|0[3|5|7|8|9])+([0-9]{8})$/'],
  })


  validation.setAttributeNames({
    // username: message[lang]['username'],
    unitId: message[lang]['unit'],
    email: message[lang]['email'],
    fullName: message[lang]['fullName'],
    phoneNumber: message[lang]['phoneNumber'],
  })

  if (validation.fails()) {
    // if (validation.errors.first('username')) {
    //   return handleValidationErr(res, validation.errors.first('username'))
    // }
    if (validation.errors.first('unit')) {
      return handleValidationErr(res, validation.errors.first('unit'))
    }
    if (validation.errors.first('fullName')) {
      return handleValidationErr(res, validation.errors.first('fullName'))
    }
    if (validation.errors.first('email')) {
      return handleValidationErr(res, validation.errors.first('email'))
    }
    if (validation.errors.first('phoneNumber')) {
      return handleValidationErr(res, validation.errors.first('phoneNumber'))
    }
  }
  //Check email, username existed
  const existAcc = await User.countDocuments({ $or: [{ email: email }, { phoneNumber: phoneNumber }] })
  // const countUsername = await User.countDocuments({ username })

  if (existAcc > 0) {
    return cf.responseError(res, message[lang]['username.duplicate'])
  }

  // if (countUsername > 0) {
  //   return cf.responseError(res, message[lang]['email.duplicate'])
  // }

  next()
}

const validateInputSignin = (req, res, next) => {
  let { username, password } = req.body
  // set language
  const lang = req.headers['lang'] || 'vi'

  Validator.useLang(lang)
  username = username && username.trim() || ''
  const isEmail = username && (username.indexOf('@') > -1)


  const validRegexUserName = ['required', isEmail ? 'email' : 'regex:/(84|0[3|5|7|8|9])+([0-9]{8})/', 'max:100']
  // create validation rule
  let validation = new Validator({
    username,
    password,
  }, {
    username: validRegexUserName,
    password: 'min:6',
  })

  validation.setAttributeNames({
    username: message[lang]['username'],
    password: message[lang]['password'],
  });

  if (validation.fails()) {
    if (validation.errors.first('username')) {
      return cf.responseError(res, validation.errors.first('username'))
    }
    if (validation.errors.first('password')) {
      return cf.responseError(res, validation.errors.first('password'))
    }
  }

  next()
}

const handleValidationErr = (res, message) => {
  return res.status(400).send(cf.buildResponseObject({
    code: ResponseCode.ERROR,
    message
  }))
}

const checkExistUsername = (req, res, next) => {
  let lang = req.headers['lang'] || 'vi'
  if (!req.body.username) {
    return res.status(400).send(cf.buildResponseObject({
      code: ResponseCode.ERROR,
      message: message[lang]['username.not.empty']
    }))
  }
  // Username Email
  User.findOne({
    $or: [{
      username: req.body.username
    }]
  }).exec((err, user) => {
    if (err) {
      res.status(500).send({
        message: err
      })
      return
    }

    if (user) {
      return res.status(400).send(cf.buildResponseObject({
        code: ResponseCode.ERROR,
        message: message[lang]['username.duplicate']
      }))
    }
    next()
  })
};

const checkExistEmail = async (req, res, next) => {
  let lang = req.headers['lang'] || 'vi'
  let { email } = req.body
  if (!email) {
    return cf.responseError(res, message[lang]['email.not.empty'])
  }
  const countEmail = await User.countDocuments({ email })

  if (countEmail > 0) {
    return cf.responseError(res, message[lang]['email.duplicate'])
  }
  next()
}

const checkRolesExisted = (req, res, next) => {
  if (!req.body.roles) {
    return res.status(400).send(cf.buildResponseObject({
      code: ResponseCode.ERROR,
      message: 'Roles is not empty'
    }))
  }

  Role.find({}, (err, docs) => {
    if (err) throw err
    if (!docs || docs.length === 0) {
      return res.status(400).send(cf.buildResponseObject({
        code: ResponseCode.ERROR,
        message: 'Roles is not empty'
      }))
    }
    let roles = docs.map((item) => item._doc.code)
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!roles.includes(req.body.roles[i].toUpperCase())) {
        return res.status(400).send({
          message: `Failed! Role ${req.body.roles[i]} does not exist!`
        })
      }
    }
    next()
  })
};

module.exports = {
  checkExistUsername,
  validateInputSignup,
  checkRolesExisted,
  validateInputSignupAdmin,
  validateInputSignin,
  checkExistEmail
}